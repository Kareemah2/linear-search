# Student Result Search System – Linear Search Visualization Dashboard

This project is a **single-page academic dashboard** built with **HTML, CSS, and vanilla JavaScript**.
It demonstrates how **Linear Search** works on real student records loaded from `students.json`.

## What this project does

- Loads student data dynamically using `fetch('students.json')`.
- Lets users search by:
  - Full name
  - Partial name
  - Matric number
- Visualizes linear search progress:
  - Number of comparisons
  - Current index
  - Percentage checked
  - Found / Not found state
- Displays selected student details and course results.
- Provides supporting dashboard sections:
  - All Students (filtering + GPA sorting)
  - About Linear Search
  - How It Works
  - Search History (localStorage)
  - Group Management (department distribution)
  - Analytics
  - Settings (dark mode, speed, pagination size, animations)

---

## Project structure

```text
.
├── index.html      # SPA layout and page sections
├── style.css       # Theme, layout, and component styles
├── script.js       # App state, linear search logic, rendering, events
└── students.json   # Student database
```

---

## How the code works

## 1) `index.html`

`index.html` contains:

- **Sidebar navigation** with buttons mapped to section IDs via `data-section`.
- **Top header** with page title, theme toggle, and avatar area.
- **Main content sections** (one per dashboard page).

Each section has a unique `id` (for example `search-result`, `all-students`, `analytics`) and JavaScript shows/hides sections to simulate SPA routing.

---

## 2) `style.css`

`style.css` defines:

- CSS variables for light/dark theme (`:root` and `body.dark`).
- Dashboard layout (`.app-shell`, `.sidebar`, `.main-area`).
- Shared components (`.card`, buttons, table styles, progress bar).
- Responsive behavior for smaller screens (sidebar drawer and stacked grids).

---

## 3) `script.js`

`script.js` is the main logic layer.

### A. State management

The `state` object stores:

- `students`: loaded records
- `history`: search history from `localStorage`
- `searches` / `successes`: analytics counters
- `settings`: user preferences (theme, speed, items per page, animations)

### B. Data loading and normalization

`loadStudents()`:

1. Fetches `students.json`.
2. Normalizes data so the app works with either:
   - `courses` field, or
   - `results` field (mapped into `courses`).
3. Applies default department (`Computer Science`) if missing.
4. Renders dependent UI blocks.

### C. Linear Search implementation

`linearSearch(data, target)`:

- Converts query to lowercase for case-insensitive search.
- Iterates student array from index `0` to `n-1`.
- On each step, compares query with:
  - `student.name` (partial match)
  - `student.matricNo` (exact match)
- Updates progress UI during iteration.
- Optionally delays each step based on settings for visualization.
- Stops immediately when a match is found (true linear search behavior).

### D. Rendering

Core renderers:

- `renderStudentResult(student)` – student details + dynamic courses table
- `renderAllStudents()` – filtered/sorted listing
- `renderHistory()` – search history table
- `renderDepartmentStats()` – department bars
- `renderAnalytics()` – total, highest GPA, average GPA, success rate

### E. Settings and persistence

- Search history is saved to `localStorage` under `searchHistory`.
- Settings are saved under `dashboardSettings`.
- Theme, speed, and pagination are restored on reload.

---

## How to run locally

Because the project uses `fetch('students.json')`, run it through a local server (not by double-clicking `index.html`).

Example with Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

## Feature walkthrough

### Search Result

- Enter a name/matric number and click **Run Linear Search**.
- Watch comparisons/index/progress update.
- View student details and course grades when found.

### All Students

- Filter by text.
- Filter by department.
- Sort by GPA (high to low).

### Search History

- Every search is saved with timestamp and result.
- Delete single entries or clear entire history.

### Settings

- Dark mode toggle
- Search speed slider
- Items per page
- Animation enable/disable

---

## Notes

- This project is frontend-only and uses browser storage.
- No backend/authentication is included.
- Dataset quality directly affects analytics output.
