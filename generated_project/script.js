// script.js - Todo List Application
// Implements task CRUD, filtering, persistence, and keyboard shortcuts.

(() => {
  // ---------- Data Model ----------
  class Task {
    constructor(text) {
      this.id = Task.generateId();
      this.text = text;
      this.completed = false;
    }
    static generateId() {
      // Use crypto API if available, fallback to simple random string.
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      // Simple fallback (not truly UUID but sufficient for demo)
      return "" + Date.now() + Math.random().toString(16).slice(2);
    }
  }

  /** @type {Task[]} */
  let tasks = [];
  let currentFilter = "all"; // all | active | completed

  // ---------- DOM Caching ----------
  const newTaskInput = document.getElementById("new-task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("task-list");
  const filterAllBtn = document.getElementById("filter-all");
  const filterActiveBtn = document.getElementById("filter-active");
  const filterCompletedBtn = document.getElementById("filter-completed");
  const itemsLeftSpan = document.getElementById("items-left");
  const taskTemplate = document.getElementById("task-template");

  // ---------- Helper Functions ----------
  function saveTasks() {
    try {
      const json = JSON.stringify(tasks);
      localStorage.setItem("todo-tasks", json);
    } catch (e) {
      console.error("Failed to save tasks", e);
    }
  }

  function loadTasks() {
    const json = localStorage.getItem("todo-tasks");
    if (json) {
      try {
        const data = JSON.parse(json);
        // Recreate Task instances
        tasks = data.map(item => {
          const t = new Task(item.text);
          t.id = item.id; // preserve original id
          t.completed = !!item.completed;
          return t;
        });
      } catch (e) {
        console.error("Failed to load tasks", e);
        tasks = [];
      }
    }
    renderAll();
  }

  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const task = new Task(trimmed);
    tasks.push(task);
    saveTasks();
    renderAll();
    newTaskInput.value = "";
    newTaskInput.focus();
  }

  function editTask(id, newText) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const trimmed = newText.trim();
    if (trimmed) task.text = trimmed;
    saveTasks();
    renderAll();
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderAll();
  }

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    saveTasks();
    renderAll();
  }

  function filterTasks(mode) {
    if (!["all", "active", "completed"].includes(mode)) return;
    currentFilter = mode;
    // Update ARIA pressed state on filter buttons
    filterAllBtn.setAttribute("aria-pressed", mode === "all");
    filterActiveBtn.setAttribute("aria-pressed", mode === "active");
    filterCompletedBtn.setAttribute("aria-pressed", mode === "completed");
    renderAll();
  }

  function updateItemsLeft() {
    const leftCount = tasks.filter(t => !t.completed).length;
    itemsLeftSpan.textContent = `${leftCount} item${leftCount !== 1 ? "s" : ""} left`;
  }

  // ---------- Rendering ----------
  function renderTask(task) {
    const clone = taskTemplate.cloneNode(true);
    clone.id = ""; // ensure no duplicate IDs
    clone.classList.remove("hidden");
    clone.removeAttribute("aria-hidden");
    clone.dataset.id = task.id;

    const checkbox = clone.querySelector(".toggle-complete");
    const label = clone.querySelector(".task-label");
    const editInput = clone.querySelector(".edit-input");
    const editBtn = clone.querySelector(".edit-btn");
    const deleteBtn = clone.querySelector(".delete-btn");

    checkbox.checked = task.completed;
    label.textContent = task.text;
    editInput.value = task.text; // keep in sync for edit mode
    // Ensure completed class reflects state
    clone.classList.toggle("completed", task.completed);

    // Attach data-id for delegation (not strictly needed here but helpful)
    checkbox.dataset.id = task.id;
    editBtn.dataset.id = task.id;
    deleteBtn.dataset.id = task.id;
    label.dataset.id = task.id;
    editInput.dataset.id = task.id;

    taskList.appendChild(clone);
  }

  function renderAll() {
    // Clear existing rendered tasks but keep the hidden template.
    // Removing innerHTML also removes the template, so we re-append it.
    taskList.innerHTML = "";
    // Re-attach the template (it remains detached but still referenced).
    taskList.appendChild(taskTemplate);

    const filtered = tasks.filter(task => {
      if (currentFilter === "active") return !task.completed;
      if (currentFilter === "completed") return task.completed;
      return true; // all
    });
    filtered.forEach(renderTask);
    updateItemsLeft();
  }

  // ---------- Edit Mode ----------
  function enterEditMode(li) {
    const label = li.querySelector(".task-label");
    const editInput = li.querySelector(".edit-input");
    if (!label || !editInput) return;
    label.classList.add("hidden");
    editInput.classList.remove("hidden");
    editInput.focus();
    editInput.select();
  }

  function exitEditMode(li, commit = true) {
    const label = li.querySelector(".task-label");
    const editInput = li.querySelector(".edit-input");
    if (!label || !editInput) return;
    const id = li.dataset.id;
    if (commit) {
      editTask(id, editInput.value);
    }
    // Clean UI – re-render will replace the element, but we hide inputs for safety.
    label.classList.remove("hidden");
    editInput.classList.add("hidden");
  }

  // ---------- Event Listeners ----------
  addTaskBtn.addEventListener("click", () => {
    addTask(newTaskInput.value);
  });

  newTaskInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask(newTaskInput.value);
    }
  });

  // Global shortcuts
  document.addEventListener("keydown", e => {
    // Ctrl+Enter to add task (if input has focus or not)
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      addTask(newTaskInput.value);
    }
    // Esc to cancel edit mode if any edit input is focused
    if (e.key === "Escape") {
      const activeEdit = document.querySelector(".edit-input:not(.hidden):focus");
      if (activeEdit) {
        const li = activeEdit.closest("li.task-item");
        if (li) {
          // Cancel edit (do not commit)
          exitEditMode(li, false);
        }
      }
    }
  });

  // Delegated events for task list actions
  taskList.addEventListener("click", e => {
    const target = e.target;
    const li = target.closest("li.task-item");
    if (!li) return;
    const id = li.dataset.id;
    if (target.classList.contains("toggle-complete")) {
      toggleTask(id);
    } else if (target.classList.contains("delete-btn")) {
      deleteTask(id);
    } else if (target.classList.contains("edit-btn")) {
      // Enter edit mode
      enterEditMode(li);
    }
  });

  // Handle edit input key events (Enter to commit, blur to commit)
  taskList.addEventListener("keydown", e => {
    if (!e.target.classList.contains("edit-input")) return;
    const li = e.target.closest("li.task-item");
    if (!li) return;
    if (e.key === "Enter") {
      e.preventDefault();
      exitEditMode(li, true);
    }
  });

  taskList.addEventListener("blur", e => {
    if (!e.target.classList.contains("edit-input")) return;
    const li = e.target.closest("li.task-item");
    if (!li) return;
    // When blur happens, commit the edit
    exitEditMode(li, true);
  }, true); // use capture to get blur events

  // Filter buttons
  filterAllBtn.addEventListener("click", () => filterTasks("all"));
  filterActiveBtn.addEventListener("click", () => filterTasks("active"));
  filterCompletedBtn.addEventListener("click", () => filterTasks("completed"));

  // ---------- Initialization ----------
  loadTasks();

  // Expose a minimal API for potential external testing (optional)
  window.TodoApp = {
    addTask,
    editTask,
    deleteTask,
    toggleTask,
    filterTasks,
    saveTasks,
    loadTasks,
    getTasks: () => tasks.slice(),
    getCurrentFilter: () => currentFilter
  };
})();
