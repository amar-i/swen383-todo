# Week 1: three code smells

Source: upstream `src/todo.js` at commit b32ff422b2560d5987b6d686e4b05a3df10da855. Line numbers refer to that version, before refactoring.

## 1. God Object — src/todo.js
**Where:** src/todo.js, lines 2–121 (`TodoManager`).
**Smell:** The same class owns task state, input validation, localStorage persistence, DOM markup, click handlers, animation and the page title.
**Cost:** Changing storage or presentation requires modifying the object that also controls task rules; a UI change can break persistence and the class is difficult to test without a browser.
**Not yet fixing:** recorded for the Week 3 SRP and DIP refactor.

## 2. Duplicated Code — src/todo.js
**Where:** src/todo.js, lines 62–78 (`renderPendingRows`, `renderCompletedRows`).
**Smell:** Both methods iterate the tasks, filter by completion, and call the same six-argument row helper. Only the completion predicate differs.
**Cost:** A change to row construction or filtering must be applied consistently to both paths; missing one produces different behaviour for pending and completed tasks.
**Not yet fixing:** recorded; the early labs focus on responsibility assignment, not eliminating every smell.

## 3. Feature Envy — src/todo.js
**Where:** src/todo.js, lines 143–159 (`summarizeWorkload`).
**Smell:** The free function reads `manager.tasks` and computes all counts from data owned by another object.
**Cost:** Changing the task collection or priority representation forces callers outside its owner to change, spreading business rules into presentation code.
**Not yet fixing:** recorded for Week 4 Information Expert: move the summary onto the task-owning service.
