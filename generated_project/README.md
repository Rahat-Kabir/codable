# SimpleTodoApp

**A lightweight, accessible, and responsive Todo List web application built with plain HTML, CSS, and JavaScript.**

---

## 📖 Overview
SimpleTodoApp provides a clean interface for managing daily tasks. It supports creating, editing, completing, deleting, and filtering tasks, with data persisted in the browser's `localStorage`. The app is fully keyboard‑accessible, responsive on mobile devices, and follows modern accessibility best‑practices (ARIA roles, live regions, focus management).

---

## 🛠️ Tech Stack
| Layer | Technology |
|-------|------------|
| **Markup** | HTML5 |
| **Styling** | CSS3 (custom properties, responsive media queries) |
| **Logic** | Vanilla JavaScript (ES6+) |
| **Persistence** | `localStorage` |
| **Accessibility** | ARIA attributes, `aria-live`, `role="application"`, focus outlines |

---

## ✨ Features
- **Add tasks** – type a description and press **Enter** or click **Add**.
- **Edit tasks** – click the **Edit** button, modify the text, press **Enter** or click outside to save; **Esc** cancels.
- **Complete tasks** – toggle the checkbox; completed items are shown with a line‑through style.
- **Delete tasks** – click the **Delete** button.
- **Filter view** – switch between **All**, **Active**, and **Completed** tasks.
- **Keyboard shortcuts**
  - `Enter` – add a new task when the input is focused.
  - `Ctrl+Enter` – add a task from anywhere.
  - `Esc` – cancel edit mode.
- **Live item counter** – shows how many tasks are left.
- **Responsive design** – works on desktop and mobile widths.
- **Persistence** – tasks survive page reloads via `localStorage`.
- **Accessibility** – ARIA roles, live regions, proper focus handling, and visible focus outlines.

---

## 🚀 Installation / Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/simpletodoapp.git
   cd simpletodoapp
   ```
2. **Open the app** – simply open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari). No build step or server is required.
   ```bash
   # On macOS / Linux you can use:
   open index.html
   # On Windows:
   start index.html
   ```

---

## 📚 Usage Guide
### Adding a Task
- Type a description into the **"What needs to be done?"** input field.
- Press **Enter** or click the **Add** button (or use `Ctrl+Enter`).

### Editing a Task
- Click the **Edit** button next to a task.
- The label is replaced by an input field pre‑filled with the current text.
- Modify the text and press **Enter** or click outside the input to **save**.
- Press **Esc** while the edit input is focused to **cancel** without saving.

### Completing a Task
- Click the checkbox on the left of a task.
- Completed tasks receive a line‑through style and are counted as *done*.

### Deleting a Task
- Click the **Delete** button on the right of a task.

### Filtering Tasks
- Use the three filter buttons in the footer:
  - **All** – shows every task.
  - **Active** – shows only tasks that are not completed.
  - **Completed** – shows only completed tasks.
- The active filter is indicated by a highlighted button (ARIA `aria‑pressed="true"`).

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Enter` (while input focused) | Add task |
| `Ctrl + Enter` (anywhere) | Add task |
| `Esc` (while editing) | Cancel edit |

---

## 📁 File Structure
```
SimpleTodoApp/
├─ index.html      # Main HTML markup – defines the UI and ARIA roles
├─ style.css       # Styling, theming variables, responsive layout
├─ script.js       # Core JavaScript – data model, CRUD, rendering, persistence, shortcuts
└─ README.md       # Documentation (you are reading it!)
```
- **`index.html`** – Contains the semantic structure of the app, a hidden `<li>` template for tasks, and ARIA attributes for screen‑reader friendliness.
- **`style.css`** – Uses CSS custom properties for colors, spacing, and typography. Includes a responsive breakpoint at 600 px and utility classes (`.hidden`).
- **`script.js`** – Implements a `Task` class, an in‑memory array, `localStorage` persistence, UI rendering, event delegation, edit mode handling, filter logic, and keyboard shortcuts. Exposes a minimal `window.TodoApp` API for potential testing.

---

## 🤝 Contributing
Contributions are welcome! If you would like to improve the app:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome‑feature`).
3. Make your changes, ensuring the existing functionality remains intact.
4. Add or update any relevant documentation.
5. Submit a pull request describing the changes.

Please follow these guidelines:
- Keep the code **vanilla** – no external libraries unless absolutely necessary.
- Preserve accessibility features (ARIA attributes, focus outlines).
- Write clear commit messages.
- Ensure the app works across major browsers.

---

## 📄 License
[MIT License](LICENSE) – *Replace with actual license file when ready.*

---

## 📸 Screenshots
### Desktop View
![Desktop view placeholder](./screenshots/desktop.png)

### Mobile View
![Mobile view placeholder](./screenshots/mobile.png)

*(Add actual screenshots to the `screenshots/` folder and replace the placeholders above.)*

---

*Happy task‑tracking!*