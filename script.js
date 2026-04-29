const state = {
  students: [],
  history: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
  searches: 0,
  successes: 0,
  settings: {
    darkMode: false,
    searchSpeed: 300,
    itemsPerPage: 10,
    animations: true,
    ...JSON.parse(localStorage.getItem('dashboardSettings') || '{}')
  }
};

const dom = {
  sidebarNav: document.getElementById('sidebarNav'),
  sections: document.querySelectorAll('.page-section'),
  pageTitle: document.getElementById('pageTitle'),
  menuBtn: document.getElementById('menuBtn'),
  sidebar: document.getElementById('sidebar'),
  themeToggle: document.getElementById('themeToggle'),
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  comparisonsCount: document.getElementById('comparisonsCount'),
  currentIndex: document.getElementById('currentIndex'),
  percentChecked: document.getElementById('percentChecked'),
  searchStatus: document.getElementById('searchStatus'),
  progressFill: document.getElementById('progressFill'),
  studentResultBody: document.getElementById('studentResultBody'),
  coursesTableWrap: document.getElementById('coursesTableWrap'),
  allStudentsFilter: document.getElementById('allStudentsFilter'),
  deptFilter: document.getElementById('deptFilter'),
  sortGpaBtn: document.getElementById('sortGpaBtn'),
  studentsTableWrap: document.getElementById('studentsTableWrap'),
  historyTableWrap: document.getElementById('historyTableWrap'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  departmentStats: document.getElementById('departmentStats'),
  analyticsCards: document.getElementById('analyticsCards'),
  darkModeSetting: document.getElementById('darkModeSetting'),
  searchSpeedSetting: document.getElementById('searchSpeedSetting'),
  searchSpeedValue: document.getElementById('searchSpeedValue'),
  itemsPerPageSetting: document.getElementById('itemsPerPageSetting'),
  animationsSetting: document.getElementById('animationsSetting'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn')
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadStudents() {
  try {
    const response = await fetch('students.json');
    if (!response.ok) throw new Error('students.json not found');
    const rawStudents = await response.json();
    state.students = rawStudents.map((student) => ({
      ...student,
      department: student.department || 'Computer Science',
      courses: student.courses || student.results || {}
    }));
    renderDeptFilter();
    renderAllStudents();
    renderHistory();
    renderDepartmentStats();
    renderAnalytics();
  } catch (error) {
    dom.studentResultBody.innerHTML = `<p style="color:#df2f58">Failed to load students.json: ${error.message}</p>`;
  }
}

function showSection(id) {
  dom.sections.forEach((s) => s.classList.toggle('active', s.id === id));
  [...dom.sidebarNav.querySelectorAll('.nav-item')].forEach((b) => b.classList.toggle('active', b.dataset.section === id));
  dom.pageTitle.textContent = [...dom.sidebarNav.querySelectorAll('.nav-item')].find((b) => b.dataset.section === id)?.textContent || 'Dashboard';
  dom.sidebar.classList.remove('open');
}

async function linearSearch(data, target) {
  const q = target.toLowerCase().trim();
  let comparisons = 0;

  for (let i = 0; i < data.length; i++) {
    comparisons++;
    const student = data[i];
    const name = student.name.toLowerCase();
    const matric = student.matricNo.toLowerCase();
    const matched = name.includes(q) || matric === q;

    const percent = Math.round(((i + 1) / data.length) * 100);
    dom.comparisonsCount.textContent = String(comparisons);
    dom.currentIndex.textContent = String(i);
    dom.percentChecked.textContent = `${percent}%`;
    dom.progressFill.style.width = `${percent}%`;
    dom.searchStatus.textContent = matched ? 'Found' : 'Checking...';

    if (state.settings.animations) {
      await sleep(Number(state.settings.searchSpeed));
    }

    if (matched) {
      return { student, comparisons, index: i, found: true };
    }
  }

  dom.searchStatus.textContent = 'Not Found';
  return { student: null, comparisons, index: -1, found: false };
}

function renderStudentResult(student) {
  if (!student) {
    dom.studentResultBody.innerHTML = '<p class="empty-state">Student not found in database.</p>';
    dom.coursesTableWrap.innerHTML = '<p class="empty-state">No course data available.</p>';
    return;
  }

  dom.studentResultBody.innerHTML = `
    <div class="grid two-col">
      <p><strong>Name:</strong> ${student.name}</p>
      <p><strong>Matric No:</strong> ${student.matricNo}</p>
      <p><strong>Department:</strong> ${student.department || 'Computer Science'}</p>
      <p><strong>GPA:</strong> ${student.gpa}</p>
      <p><strong>Status:</strong> ${student.status}</p>
    </div>
  `;

  const courseRows = Object.entries(student.courses)
    .map(([code, grade]) => `<tr><td>${code}</td><td>${grade ?? 'N/A'}</td></tr>`)
    .join('');

  dom.coursesTableWrap.innerHTML = `
    <table>
      <thead><tr><th>Course</th><th>Grade</th></tr></thead>
      <tbody>${courseRows}</tbody>
    </table>
  `;
}

function renderDeptFilter() {
  const departments = [...new Set(state.students.map((s) => s.department))].sort();
  dom.deptFilter.innerHTML = '<option value="all">All Departments</option>' + departments.map((d) => `<option value="${d}">${d}</option>`).join('');
}

function renderAllStudents() {
  const text = dom.allStudentsFilter.value?.toLowerCase().trim() || '';
  const dept = dom.deptFilter.value || 'all';
  const sorted = [...state.students].sort((a, b) => b.gpa - a.gpa);
  const filtered = sorted.filter((s) => {
    const matchesText = s.name.toLowerCase().includes(text) || s.matricNo.toLowerCase().includes(text);
    const matchesDept = dept === 'all' || s.department === dept;
    return matchesText && matchesDept;
  });

  const limited = filtered.slice(0, Number(state.settings.itemsPerPage));

  dom.studentsTableWrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th><th>Matric Number</th><th>Department</th><th>GPA</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${limited.map((s) => `<tr><td>${s.name}</td><td>${s.matricNo}</td><td>${s.department}</td><td>${s.gpa.toFixed(2)}</td><td>${s.status}</td></tr>`).join('') || '<tr><td colspan="5">No records found</td></tr>'}
      </tbody>
    </table>
  `;
}

function saveHistory(query, found) {
  const entry = {
    query,
    result: found ? 'Found' : 'Not Found',
    date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
  };
  state.history.unshift(entry);
  localStorage.setItem('searchHistory', JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  dom.historyTableWrap.innerHTML = `
    <table>
      <thead><tr><th>Query</th><th>Result</th><th>Date</th><th>Action</th></tr></thead>
      <tbody>
        ${state.history.map((h, i) => `<tr><td>${h.query}</td><td>${h.result}</td><td>${h.date}</td><td><button class="danger-btn" data-delete-history="${i}">Delete</button></td></tr>`).join('') || '<tr><td colspan="4">No search history available.</td></tr>'}
      </tbody>
    </table>
  `;
}

function renderDepartmentStats() {
  const total = state.students.length || 1;
  const counts = state.students.reduce((acc, student) => {
    acc[student.department] = (acc[student.department] || 0) + 1;
    return acc;
  }, {});

  dom.departmentStats.innerHTML = Object.entries(counts)
    .map(([dept, count]) => {
      const pct = ((count / total) * 100).toFixed(1);
      return `
        <div class="department-bar">
          <div class="space-between"><strong>${dept}</strong><span>${count} students (${pct}%)</span></div>
          <div class="bar"><i style="width:${pct}%"></i></div>
        </div>
      `;
    })
    .join('');
}

function renderAnalytics() {
  const total = state.students.length;
  const highest = Math.max(...state.students.map((s) => s.gpa));
  const average = state.students.reduce((sum, s) => sum + s.gpa, 0) / (total || 1);
  const deptCount = new Set(state.students.map((s) => s.department)).size;
  const successRate = state.searches ? ((state.successes / state.searches) * 100).toFixed(1) : '0.0';

  const cards = [
    ['Total Students', total],
    ['Highest GPA', highest.toFixed(2)],
    ['Average GPA', average.toFixed(2)],
    ['Departments', deptCount],
    ['Search Success Rate', `${successRate}%`]
  ];

  dom.analyticsCards.innerHTML = cards.map(([label, value]) => `<article class="card metric-card"><span>${label}</span><strong>${value}</strong></article>`).join('');
}

function applyTheme() {
  document.body.classList.toggle('dark', !!state.settings.darkMode);
  dom.themeToggle.textContent = state.settings.darkMode ? '☀️' : '🌙';
}

function loadSettingsUI() {
  dom.darkModeSetting.checked = !!state.settings.darkMode;
  dom.searchSpeedSetting.value = String(state.settings.searchSpeed);
  dom.searchSpeedValue.textContent = `${state.settings.searchSpeed}ms`;
  dom.itemsPerPageSetting.value = String(state.settings.itemsPerPage);
  dom.animationsSetting.checked = !!state.settings.animations;
}

function bindEvents() {
  dom.sidebarNav.addEventListener('click', (e) => {
    if (!e.target.matches('.nav-item')) return;
    showSection(e.target.dataset.section);
  });

  dom.menuBtn.addEventListener('click', () => dom.sidebar.classList.toggle('open'));

  dom.themeToggle.addEventListener('click', () => {
    state.settings.darkMode = !state.settings.darkMode;
    applyTheme();
  });

  dom.searchBtn.addEventListener('click', async () => {
    const query = dom.searchInput.value.trim();
    if (!query) return;
    dom.progressFill.style.width = '0%';
    dom.searchStatus.textContent = 'Searching...';
    state.searches++;

    const result = await linearSearch(state.students, query);
    if (result.found) state.successes++;

    renderStudentResult(result.student);
    saveHistory(query, result.found);
    renderAnalytics();
  });

  dom.allStudentsFilter.addEventListener('input', renderAllStudents);
  dom.deptFilter.addEventListener('change', renderAllStudents);
  dom.sortGpaBtn.addEventListener('click', renderAllStudents);

  dom.clearHistoryBtn.addEventListener('click', () => {
    state.history = [];
    localStorage.setItem('searchHistory', JSON.stringify(state.history));
    renderHistory();
  });

  dom.historyTableWrap.addEventListener('click', (e) => {
    const idx = e.target.getAttribute('data-delete-history');
    if (idx === null) return;
    state.history.splice(Number(idx), 1);
    localStorage.setItem('searchHistory', JSON.stringify(state.history));
    renderHistory();
  });

  dom.searchSpeedSetting.addEventListener('input', () => {
    dom.searchSpeedValue.textContent = `${dom.searchSpeedSetting.value}ms`;
  });

  dom.saveSettingsBtn.addEventListener('click', () => {
    state.settings = {
      darkMode: dom.darkModeSetting.checked,
      searchSpeed: Number(dom.searchSpeedSetting.value),
      itemsPerPage: Number(dom.itemsPerPageSetting.value),
      animations: dom.animationsSetting.checked
    };
    localStorage.setItem('dashboardSettings', JSON.stringify(state.settings));
    applyTheme();
    renderAllStudents();
  });
}

(async function init() {
  loadSettingsUI();
  applyTheme();
  bindEvents();
  await loadStudents();
})();
