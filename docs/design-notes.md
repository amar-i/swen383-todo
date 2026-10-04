# Design decisions: Weeks 1–4

## Week 1 — what hurts and why

`SMELLS.md` cites the original source at upstream commit `b32ff42`. God Object means unrelated reasons to change live in one class. Duplicated row loops make maintenance inconsistent. The summary function has Feature Envy because it asks another object for its internal task data and performs its business calculation outside that owner.

## Week 2 — model the actual program

`class-diagram.puml` and `sequence-add-task.puml` intentionally describe the **original** code, as the lab requires. TodoManager is the only JavaScript class. Task is a plain record, not an invented Task class with complete() methods. Browser DOM/localStorage boxes describe external dependencies. A class diagram shows structure; a sequence diagram shows one ordered scenario. The task records are owned by the manager; the DOM container exists independently. The sequence follows the real click callback, validation, construction, save, render and input reset. The original method returns true; after Week 3 it returns the new ID.

Locally rendered versions: `OriginalTodoApp.svg` and `OriginalAddTask.svg`. The PlantUML extension is installed. Local rendering uses the ignored `.tools/plantuml.jar` and the workspace settings, rather than transmitting source to a public rendering server. If moving to another computer, install a local PlantUML jar and update that setting.

## Week 3 — SRP and DIP

- **TodoService** owns tasks, validation and mutation. It creates task records. Invalid descriptions return null. It returns the new task ID so the UI can highlight the row.
- **TodoRenderer** owns DOM markup, click wiring, animation and the page title. buildTaskRow stays here because it builds presentation. In the Week 3 branch, summarizeWorkload temporarily lives here for Week 4 to address.
- **LocalStorageHandler** alone contains localStorage calls, using the original `todo-tasks` key and JSON shape.
- **main.js** is the composition root: it chooses storage, constructs dependencies and wires startup. This is where the original DOMContentLoaded code belongs.

SRP is about separate reasons to change, not simply separate files. The commits first split classes in the same file; a later commit moves them into modules. DIP uses JavaScript's structural contract: any injected object with load()/save(tasks) can supply persistence. The automated tests use an in-memory handler, demonstrating that TodoService works without a browser or edits to its code.

Issues: [SRP #1](https://github.com/amar-i/swen383-todo/issues/1), [OCP #2](https://github.com/amar-i/swen383-todo/issues/2), [DIP #3](https://github.com/amar-i/swen383-todo/issues/3). The SRP and DIP fixes were merged into main at the start of Week 4. OCP remains open: the urgent branch deliberately stays until the Week 6 Builder lab.

## Week 4 — responsibility assignment with GRASP

- **Controller (#4):** TodoController coordinates application operations, delegating task rules to the service and display to the renderer. It contains no task construction or markup. Invalid input does not render.
- **Creator (#5):** TodoService already owns the collection, has the necessary data, constructs the record and stores it. Check that main.js and TodoController never construct task records; no new factory is needed.
- **Information Expert (#6):** TodoService has the information to calculate done/urgent/normal counts, so getWorkloadSummary() belongs there. A completed urgent task counts as done, not urgent remaining.

The renderer gets onToggle/onDelete functions from the controller. It does not retain a controller or mutate the service. The callbacks avoid circular construction while preserving the controller as coordinator. start(), addTask(), toggleTask(), deleteTask() call the expert and then refresh the view. main.js routes normal Add, urgent Add and Enter through the controller.

Week 4's `feat/grasp-controller` branch is pushed but intentionally **not merged**. Creator is verified and closed; the Controller and Information Expert discussion issues remain open as the lab instructs.

## Verification

Run `node --test tests/todo.test.mjs` (Node's built-in test runner; no dependencies). Eight tests cover validation without writes, normal/urgent creation, persisted complete/undo/delete, Information Expert counts, controller call order and callback routing, rejected-input no-render behavior, LocalStorageHandler JSON/key compatibility, and safe renderer text plus callback IDs.

Browser checks cover baseline add/complete/delete; SRP add/complete; persistence after reload; final normal/urgent add, Enter, invalid input, Done/Undo/Delete and refresh. Test task data is kept only on localhost.

A small presentation fix escapes descriptions, timestamps and the oldest label before inserting HTML, so user text renders as text. The original six-argument row helper, duplicated loops and numeric constants stay visible for later labs. The original Date.now() IDs remain; extremely rapid calls in the same millisecond can collide, an inherited limitation outside these refactors.

## Be ready to explain

1. Which change request would affect each of the four responsibilities?
2. How can storage be substituted without editing TodoService?
3. Why does the renderer receive callbacks instead of a controller reference?
4. Why does the workload summary belong in TodoService?
5. Why does adding a third task type still violate OCP, and why is it deferred?
6. What does composition mean in the original class diagram, and how does a sequence diagram differ?

AI assistance is disclosed in `AI_DISCLOSURE.md`. Read the implementation and explain these choices yourself before treating the work as ready for assessment.
