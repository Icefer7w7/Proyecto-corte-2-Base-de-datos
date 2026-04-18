const API = '';
const SEMESTER_ID = 1;
const MAX_SEMESTER = 3;
const STORAGE_KEY = 'logged_student_usb';
let currentSemester = null;
let notasData = {};

function init() {
  initNavigation();
  initAuth();
  initCalculadora();
  buildSemesterGrid();
  const student = getLoggedStudent();
  if (student) {
    showNotasPage();
    loadNotas();
  }
}

document.addEventListener('DOMContentLoaded', init);

function initNavigation() {
  const links = document.querySelectorAll('.nav-links a[data-page]');
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.dataset.page;
      if (!page) return;
      if (page === 'notas' && !getLoggedStudent()) {
        showPage('inicio');
        showFormMessage('login-error', 'Debes iniciar sesión primero.');
        return;
      }
      showPage(page);
    });
  });
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

function initAuth() {
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  const btnLogout = document.getElementById('btn-logout');

  if (btnLogin) btnLogin.addEventListener('click', doLogin);
  if (btnRegister) btnRegister.addEventListener('click', doRegister);
  if (btnLogout) btnLogout.addEventListener('click', () => {
    clearLoggedStudent();
    showPage('inicio');
    showFormMessage('login-error', 'Has cerrado sesión.');
  });
}

async function doLogin() {
  hideFormMessages();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!email || !password) {
    showFormMessage('login-error', 'Completa el correo y la contraseña.');
    return;
  }

  try {
    const response = await fetch(`${API}/student`);
    if (!response.ok) {
      showFormMessage('login-error', 'No se pudo conectar al servidor.');
      return;
    }

    const students = await response.json();
    const match = Array.isArray(students)
      ? students.find(user => user.email === email && user.password === password)
      : null;

    if (!match) {
      showFormMessage('login-error', 'Usuario o contraseña incorrectos.');
      return;
    }

    saveLoggedStudent({ id: match.id, email: match.email });
    showNotasPage();
    loadNotas();
  } catch (error) {
    showFormMessage('login-error', 'Error de conexión con el servidor.');
  }
}

async function doRegister() {
  hideFormMessages();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value.trim();

  if (!email || !password) {
    showFormMessage('register-error', 'Completa el correo y la contraseña.');
    return;
  }

  try {
    const response = await fetch(`${API}/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      showFormMessage('register-error', error.error || 'No se pudo crear el usuario.');
      return;
    }

    const data = await response.json();
    saveLoggedStudent({ id: data.id, email });
    showFormMessage('register-success', 'Usuario creado correctamente. Redirigiendo a tus notas...');
    setTimeout(() => {
      showNotasPage();
      loadNotas();
    }, 600);
  } catch (error) {
    showFormMessage('register-error', 'Error de conexión con el servidor.');
  }
}

function buildSemesterGrid() {
  const grid = document.getElementById('semester-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 1; i <= MAX_SEMESTER; i += 1) {
    const button = document.createElement('button');
    button.className = 'sem-btn';
    button.type = 'button';
    button.dataset.sem = i;
    button.innerHTML = `${i}<span>Semestre</span>`;
    button.addEventListener('click', () => selectSemestre(i, button));
    grid.appendChild(button);
  }
}

function selectSemestre(num, button) {
  currentSemester = num;
  document.querySelectorAll('.sem-btn').forEach(btn => btn.classList.remove('active'));
  if (button) button.classList.add('active');
  const section = document.getElementById('cortes-section');
  const cards = document.getElementById('cortes-cards');
  const noNotes = document.getElementById('no-notes');
  if (!section || !cards || !noNotes) return;

  if (num !== SEMESTER_ID || !notasData[SEMESTER_ID]) {
    cards.innerHTML = '';
    section.classList.add('visible');
    noNotes.style.display = 'block';
    noNotes.textContent = num === SEMESTER_ID
      ? 'No se encontraron notas en este semestre.'
      : 'Solo el semestre 1 tiene notas en este demo.';
    return;
  }

  const { corte1, corte2, corte3 } = notasData[SEMESTER_ID];
  cards.innerHTML = [corte1, corte2, corte3].map((value, index) => `
    <div class="corte-card">
      <div class="corte-num">Corte ${index + 1}</div>
      <div class="corte-nota">${value !== null && value !== undefined ? Number(value).toFixed(1) : '-'}</div>
    </div>
  `).join('');
  section.classList.add('visible');
  noNotes.style.display = 'none';
}

async function loadNotas() {
  try {
    const response = await fetch(`${API}/grades/semester/${SEMESTER_ID}`);
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      notasData = {};
      return;
    }

    const valores = data.map(item => item.nota_corte);
    notasData[SEMESTER_ID] = {
      corte1: valores[0] ?? null,
      corte2: valores[1] ?? null,
      corte3: valores[2] ?? null,
    };
    const button = document.querySelector('[data-sem="1"]');
    selectSemestre(SEMESTER_ID, button);
  } catch (error) {
    console.warn('No se pudo cargar las notas del servidor.', error);
  }
}

function initCalculadora() {
  const btn = document.getElementById('btn-calcular');
  if (!btn) return;
  btn.addEventListener('click', calcularPromedio);
}

function calcularPromedio() {
  const nota1 = parseFloat(document.getElementById('nota1').value);
  const nota2 = parseFloat(document.getElementById('nota2').value);
  const nota3 = parseFloat(document.getElementById('nota3').value);
  const pct1 = parseFloat(document.getElementById('pct1').value);
  const pct2 = parseFloat(document.getElementById('pct2').value);
  const pct3 = parseFloat(document.getElementById('pct3').value);
  const errorEl = document.getElementById('calc-error');
  const resultEl = document.getElementById('promedio-valor');

  if ([nota1, nota2, nota3, pct1, pct2, pct3].some(value => Number.isNaN(value))) {
    setCalcError('Completa todas las notas y porcentajes.');
    return;
  }

  if ([nota1, nota2, nota3].some(n => n < 0 || n > 5)) {
    setCalcError('Las notas deben ser entre 0.0 y 5.0.');
    return;
  }

  const totalPct = pct1 + pct2 + pct3;
  if (Math.abs(totalPct - 100) > 0.01) {
    setCalcError('Los porcentajes deben sumar 100%.');
    return;
  }

  errorEl.style.display = 'none';
  const promedio = (nota1 * pct1 + nota2 * pct2 + nota3 * pct3) / 100;
  resultEl.textContent = promedio.toFixed(2);
  resultEl.style.color = promedio >= 3 ? '#2d1e6e' : '#c0392b';
}

function setCalcError(message) {
  const errorEl = document.getElementById('calc-error');
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

function showNotasPage() {
  const student = getLoggedStudent();
  if (!student) return;
  const welcome = document.getElementById('welcome-text');
  if (welcome) welcome.textContent = `Bienvenido ${student.email}. Selecciona el semestre 1 para ver tus notas.`;
  showPage('notas');
}

function getLoggedStudent() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function saveLoggedStudent(student) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(student));
}

function clearLoggedStudent() {
  sessionStorage.removeItem(STORAGE_KEY);
  notasData = {};
  currentSemester = null;
}

function showFormMessage(id, message) {
  hideFormMessages();
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.classList.add('active');
}

function hideFormMessages() {
  document.querySelectorAll('.form-feedback span').forEach(el => {
    el.textContent = '';
    el.classList.remove('active');
  });
}
