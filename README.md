# SWEN-383 Todo App — personal labs

Fork of [valonraca/swen383-todo](https://github.com/valonraca/swen383-todo), completed through Week 4 on October 4, 2026.

## Run

Open this folder in VS Code and use **Open with Live Server** on index.html. Alternatively run `python3 -m http.server 8383 --bind 127.0.0.1` and open http://127.0.0.1:8383. The browser modules require an HTTP server. No build step or npm install is needed.

## Deliverables

- Week 1: root `SMELLS.md`, three findings with original file/line citations and consequences.
- Week 2: `docs/class-diagram.puml`, `docs/sequence-add-task.puml`, and locally rendered SVGs documenting the original program.
- Week 3: `feat/solid-refactoring`, SRP and DIP fixes, merged into main for Week 4. OCP Issue #2 stays open for Week 6.
- Week 4: `feat/grasp-controller`, controller and Information Expert implementation, pushed and left unmerged as required.
- [Issues](https://github.com/amar-i/swen383-todo/issues): three SOLID findings and three GRASP decisions.

## Current classes

TodoService owns task rules and state. LocalStorageHandler handles persistence. TodoRenderer displays tasks and calls action callbacks. TodoController coordinates UI operations. main.js creates and wires these objects.

## Check and understand

Run `node --test tests/todo.test.mjs` on the Week 4 branch. See [design notes](docs/design-notes.md) for responsibility choices, branch history, diagrams, verification and questions to practise for Test 1.

MIT — see LICENSE.
