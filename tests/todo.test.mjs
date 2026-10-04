import test from 'node:test';
import assert from 'node:assert/strict';
import { TodoService } from '../src/TodoService.js';
import { TodoController } from '../src/TodoController.js';
import { TodoRenderer } from '../src/TodoRenderer.js';
import { LocalStorageHandler } from '../src/LocalStorageHandler.js';

class MemoryStorage {
  constructor(tasks = []) { this.saved = structuredClone(tasks); this.writes = 0; }
  load() { return structuredClone(this.saved); }
  save(tasks) { this.saved = structuredClone(tasks); this.writes++; }
}

test('validation rejects blank and short descriptions without changing storage', () => {
  const storage = new MemoryStorage();
  const service = new TodoService(storage);
  for (const description of ['', ' ', 'ab', ' a ']) {
    assert.equal(service.addTask(description, 'simple'), null);
  }
  assert.deepEqual(service.tasks, []);
  assert.equal(storage.writes, 0);
});

test('normal and urgent tasks retain original fields and persist through injected storage', () => {
  const storage = new MemoryStorage();
  const service = new TodoService(storage);
  const id = service.addTask('  Buy milk  ', 'simple');
  assert.equal(id, service.tasks[0].id);
  assert.equal(service.tasks[0].desc, 'Buy milk');
  assert.equal(service.tasks[0].priority, 'normal');
  assert.equal(service.tasks[0].completed, false);
  assert.equal(typeof service.tasks[0].createdAt, 'string');
  service.addTask('  Submit lab  ', 'urgent');
  assert.equal(service.tasks[1].desc, '[URGENT] Submit lab');
  assert.equal(service.tasks[1].priority, 'high');
  assert.deepEqual(new TodoService(storage).tasks, service.tasks);
});

test('complete, undo and delete persist; unknown toggle does not write', () => {
  const storage = new MemoryStorage([{ id: 10, desc: 'Read', completed: false, priority: 'normal' }]);
  const service = new TodoService(storage);
  service.toggleComplete(10);
  assert.equal(new TodoService(storage).tasks[0].completed, true);
  service.toggleComplete(10);
  assert.equal(service.tasks[0].completed, false);
  service.toggleComplete(999);
  assert.equal(storage.writes, 2);
  service.deleteTask(10);
  assert.deepEqual(new TodoService(storage).tasks, []);
});

test('Information Expert counts completed urgent tasks only as done', () => {
  const service = new TodoService(new MemoryStorage([
    {id: 1, completed: true, priority: 'high'},
    {id: 2, completed: false, priority: 'high'},
    {id: 3, completed: false, priority: 'normal'}
  ]));
  assert.equal(service.getWorkloadSummary(), '1/3 done - 1 urgent, 1 normal remaining');
  service.deleteTask(2);
  assert.equal(service.getWorkloadSummary(), '1/2 done - 0 urgent, 1 normal remaining');
  assert.equal(new TodoService(new MemoryStorage()).getWorkloadSummary(), '0/0 done - 0 urgent, 0 normal remaining');
});

test('controller binds callbacks and invokes service before rendering', () => {
  const calls = [];
  const service = {
    addTask: (description, type) => { calls.push(['add', description, type]); return 42; },
    toggleComplete: id => calls.push(['toggle', id]),
    deleteTask: id => calls.push(['delete', id])
  };
  const renderer = {
    bindActions(actions) { this.actions = actions; },
    render: (s, id) => { assert.equal(s, service); calls.push(['render', id]); }
  };
  const controller = new TodoController(service, renderer);
  controller.start();
  assert.equal(controller.addTask('Study', 'urgent'), 42);
  renderer.actions.onToggle(42);
  renderer.actions.onDelete(42);
  assert.deepEqual(calls, [['render', undefined], ['add', 'Study', 'urgent'], ['render', 42], ['toggle', 42], ['render', undefined], ['delete', 42], ['render', undefined]]);
});

test('controller returns null without rerendering rejected input', () => {
  let rendered = false;
  const controller = new TodoController({addTask: () => null}, {bindActions() {}, render() { rendered = true; }});
  assert.equal(controller.addTask('a', 'simple'), null);
  assert.equal(rendered, false);
});

test('LocalStorageHandler maintains original key and round-trips task JSON', () => {
  const original = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  try {
    const storage = new LocalStorageHandler();
    assert.deepEqual(storage.load(), []);
    storage.save([{id: 10, desc: 'Persist'}]);
    assert.deepEqual(JSON.parse(values.get('todo-tasks')), [{id: 10, desc: 'Persist'}]);
    assert.deepEqual(storage.load(), [{id: 10, desc: 'Persist'}]);
  } finally { if (original === undefined) delete globalThis.localStorage; else globalThis.localStorage = original; }
});

test('renderer sends numeric IDs through callbacks and escapes user text in rows and status', () => {
  const original = globalThis.document;
  const listeners = {};
  const toggle = {dataset: {toggle: '7'}, addEventListener(event, cb) { listeners.toggle = cb; }};
  const remove = {dataset: {delete: '7'}, addEventListener(event, cb) { listeners.delete = cb; }};
  const container = { innerHTML: '', querySelectorAll: selector => selector === '[data-toggle]' ? [toggle] : [remove] };
  globalThis.document = {getElementById: () => container, title: ''};
  try {
    const renderer = new TodoRenderer('task-container');
    const calls = [];
    renderer.bindActions({onToggle: id => calls.push(['toggle', id]), onDelete: id => calls.push(['delete', id])});
    const service = new TodoService(new MemoryStorage([{id: 7, desc: '<b>Read & study</b>', completed: false, priority: 'normal', createdAt: '12:00'}]));
    renderer.render(service);
    assert.ok(container.innerHTML.includes('&lt;b&gt;Read &amp; study&lt;/b&gt;'));
    assert.ok(!container.innerHTML.includes('<b>Read'));
    assert.equal(document.title, 'Todo (1)');
    listeners.toggle(); listeners.delete();
    assert.deepEqual(calls, [['toggle', 7], ['delete', 7]]);
    assert.equal(service.tasks.length, 1);
    assert.equal(service.tasks[0].completed, false);
  } finally { if (original === undefined) delete globalThis.document; else globalThis.document = original; }
});
