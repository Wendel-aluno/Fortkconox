// ============================================
// FORTKCONOX – JavaScript Global Mobile System
// ============================================

// ------ SISTEMA DE USUÁRIO (LocalStorage) ------
function saveUser(name, email) {
  localStorage.setItem("fk_user", JSON.stringify({ name, email }));
}

function getUser() {
  const data = localStorage.getItem("fk_user");
  return data ? JSON.parse(data) : null;
}

function login(email, password) {
  if (!email || !password) {
    alert("Preencha e-mail e senha.");
    return;
  }
  saveUser("Usuário Fortkconox", email);
  window.location.href = "3.html";
}

function register(name, email, password, confirm) {
  if (!name || !email || !password || !confirm) {
    alert("Preencha todos os campos.");
    return;
  }
  if (password !== confirm) {
    alert("As senhas não coincidem!");
    return;
  }

  saveUser(name, email);
  alert("Cadastro realizado com sucesso!");
  window.location.href = "3.html";
}

function logout() {
  localStorage.removeItem("fk_user");
  window.location.href = "2.html";
}

function showUser() {
  const user = getUser();
  const span = document.querySelector("#userName");
  if (span && user) span.textContent = user.name;
}

// ---------------- CÂMERAS -----------------
function simulateCameras() {
  const cams = document.querySelectorAll(".placeholder");
  cams.forEach((cam, i) => {
    cam.onclick = () => {
      // substitui placeholder por um vídeo simulado
      cam.innerHTML = `
        <video autoplay muted loop style="width:100%; height:130px; border-radius:10px;">
          <source src="https://cdn.pixabay.com/vimeo/309052879/cctv-16671.mp4?width=640" type="video/mp4">
        </video>
      `;
    };
  });
}

function openCamera(id) {
  const titles = ["Entrada Principal", "Corredor", "Garagem"];
  alert("📡 Abrindo Câmera: " + titles[id - 1]);
}

// ---------------- ONDAS -----------------
function setupWaves() {
  const slider = document.querySelector("#waveRange");
  const value = document.querySelector("#waveValue");
  const circle = document.querySelector("#waveCircle");

  if (!slider) return;

  function update() {
    value.textContent = slider.value + " m";
    // transforma círculo visual
    if (circle) {
      const scale = Math.max(0.4, slider.value / 50);
      circle.style.transform = `scale(${scale})`;
      circle.style.background = `rgba(49,149,222,${Math.min(0.55, slider.value / 180)})`;
      circle.style.boxShadow = `0 0 ${10 + slider.value/8}px rgba(49,149,222,0.12)`;
    }
  }

  update();
  slider.oninput = update;
}

// ---------------- ALARMES -----------------
function setupAlarms() {
  const on = document.querySelector("#alarmOn");
  const off = document.querySelector("#alarmOff");
  if (!on) return;

  const sound = new Audio("https://www.soundjay.com/misc/sounds/fire-alarm-1.mp3");

  on.onclick = () => {
    sound.loop = true;
    sound.play();
    if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
    showToast("🚨 Alarme ativado!");
  };

  off.onclick = () => {
    sound.pause();
    showToast("⛔ Alarme desativado.");
  };
}

// ---------------- IA MOVIMENTO -----------------
function setupMotion() {
  const slider = document.querySelector("#motionRange");
  const value = document.querySelector("#motionValue");
  const detect = document.querySelector("#motionDetect");

  if (!slider) return;

  value.textContent = slider.value;

  slider.oninput = () => {
    value.textContent = slider.value;
  };

  // Simulação de deteção (loop)
  setInterval(() => {
    if (!detect) return;
    if (slider.value > 6) {
      detect.textContent = "⚠ Movimento detectado!";
      detect.style.color = "#ff6b6b";
    } else {
      detect.textContent = "Nenhum movimento detectado.";
      detect.style.color = "#3195de";
    }
  }, 1500);
}

// ---------------- PERFIL -----------------
function setupProfile() {
  const user = getUser();
  const name = document.querySelector("#profileName");
  const email = document.querySelector("#profileEmail");

  if (user && name && email) {
    name.value = user.name;
    email.value = user.email;
  }

  const save = document.querySelector("#saveProfile");
  if (save) {
    save.onclick = () => {
      saveUser(name.value, email.value);
      showToast("✅ Perfil atualizado!");
    };
  }
}
// ---------------- BARRERAS / CATRACAS -----------------

// estado persistente: { open: bool, autoCloseSec: number, log: [entries], lastTempCode: {code,expires} }
function getBarriersState() {
  const s = localStorage.getItem("fk_barriers");
  return s ? JSON.parse(s) : { open: false, autoCloseSec: 0, log: [], lastTempCode: null };
}
function saveBarriersState(state) {
  localStorage.setItem("fk_barriers", JSON.stringify(state));
}

// atualização visual do painel
function renderBarriers() {
  const state = getBarriersState();
  const statusEl = document.getElementById("gateStatus");
  const autoInfo = document.getElementById("autoCloseInfo");
  const logEl = document.getElementById("accessLog");
  const lastCodeEl = document.getElementById("lastTempCode");
  const toggleBtn = document.getElementById("gateToggle");

  if (statusEl) {
    statusEl.innerHTML = `Catraca: <strong>${state.open ? 'Aberta' : 'Fechada'}</strong>`;
  }
  if (autoInfo) {
    autoInfo.innerHTML = `Fechamento automático: <strong>${state.autoCloseSec > 0 ? state.autoCloseSec + ' s' : 'Desativado'}</strong>`;
  }
  if (toggleBtn) {
    toggleBtn.textContent = state.open ? 'Fechar Catraca' : 'Abrir Catraca';
    toggleBtn.className = state.open ? 'ghost' : 'btn-big';
  }
  if (lastCodeEl) {
    if (state.lastTempCode && new Date(state.lastTempCode.expires) > new Date()) {
      lastCodeEl.textContent = `Código: ${state.lastTempCode.code} · Expira: ${new Date(state.lastTempCode.expires).toLocaleString()}`;
    } else {
      lastCodeEl.textContent = 'Nenhum código gerado.';
    }
  }

  // render log
  if (logEl) {
    logEl.innerHTML = '';
    const arr = (state.log || []).slice().reverse(); // show latest first
    if (arr.length === 0) {
      logEl.innerHTML = '<div style="color:var(--muted)">Nenhum registro.</div>';
    } else {
      arr.forEach(item => {
        const row = document.createElement('div');
        row.style.padding = '8px';
        row.style.borderBottom = '1px solid rgba(255,255,255,0.02)';
        row.innerHTML = `<div style="display:flex;justify-content:space-between"><div style="font-size:13px">${item.action}</div><div style="color:var(--muted);font-size:12px">${new Date(item.time).toLocaleString()}</div></div><div style="color:var(--muted);font-size:13px;margin-top:6px">${item.meta || ''}</div>`;
        logEl.appendChild(row);
      });
    }
  }
}

// função para alternar estado da catraca
let autoCloseTimer = null;
function toggleGate(forceOpen = false) {
  const state = getBarriersState();
  // se for forçar, abre mesmo se já aberta (re-registra)
  state.open = forceOpen ? true : !state.open;
  // registrar no log
  const entry = { action: state.open ? 'Abertura' : 'Fechamento', time: new Date().toISOString(), meta: forceOpen ? 'Forçado' : '' };
  state.log = state.log || [];
  state.log.push(entry);
  saveBarriersState(state);
  renderBarriers();

  // se abriu e há autoCloseSec, agendar fechamento
  if (state.open && state.autoCloseSec && state.autoCloseSec > 0) {
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(() => {
      // fechar automaticamente
      const st = getBarriersState();
      st.open = false;
      st.log = st.log || [];
      st.log.push({ action: 'Fechamento automático', time: new Date().toISOString(), meta: `Após ${state.autoCloseSec}s` });
      saveBarriersState(st);
      renderBarriers();
      showToast('Catraca fechada automaticamente.');
    }, state.autoCloseSec * 1000);
    showToast(`Catraca aberta. Fechará automaticamente em ${state.autoCloseSec} s.`);
  } else if (!state.open) {
    // se fechou manualmente, cancelar timer
    if (autoCloseTimer) { clearTimeout(autoCloseTimer); autoCloseTimer = null; }
  }
}

// gerar código temporário (alfa-numérico simples) válido por X minutos
function generateTempCode(minutes = 30) {
  const code = Math.random().toString(36).substr(2, 6).toUpperCase();
  const expires = new Date(Date.now() + minutes * 60000).toISOString();
  const state = getBarriersState();
  state.lastTempCode = { code, expires };
  state.log = state.log || [];
  state.log.push({ action: 'Gerou código temporário', time: new Date().toISOString(), meta: `Código ${code} • ${minutes} min` });
  saveBarriersState(state);
  renderBarriers();
  showToast(`Código gerado: ${code} (válido ${minutes} min)`);
  return { code, expires };
}

// limpar histórico
function clearBarriersLog() {
  const state = getBarriersState();
  state.log = [];
  saveBarriersState(state);
  renderBarriers();
  showToast('Histórico limpo.');
}

// salvar auto-close
function saveAutoClose(seconds) {
  const state = getBarriersState();
  state.autoCloseSec = parseInt(seconds, 10) || 0;
  saveBarriersState(state);
  renderBarriers();
  showToast('Configuração salva.');
}

// inicializador para a página barriers.html
function setupBarriers() {
  // elementos
  const toggleBtn = document.getElementById('gateToggle');
  const forceBtn = document.getElementById('forceOpen');
  const genBtn = document.getElementById('generateCode');
  const durInput = document.getElementById('tempCodeDuration');
  const clearBtn = document.getElementById('clearLog');
  const saveAuto = document.getElementById('saveAutoClose');
  const autoInput = document.getElementById('autoCloseSeconds');

  // ligar eventos
  if (toggleBtn) toggleBtn.onclick = () => toggleGate(false);
  if (forceBtn) forceBtn.onclick = () => toggleGate(true);
  if (genBtn) genBtn.onclick = () => {
    const min = parseInt((durInput && durInput.value) || 30, 10);
    generateTempCode(min > 0 ? min : 30);
  };
  if (clearBtn) clearBtn.onclick = () => { if (confirm('Limpar histórico?')) clearBarriersLog(); };
  if (saveAuto) saveAuto.onclick = () => saveAutoClose(autoInput.value);

  // carregar estado e mostrar
  const state = getBarriersState();
  // se tinha um código expirado, removemos
  if (state.lastTempCode && new Date(state.lastTempCode.expires) <= new Date()) {
    state.lastTempCode = null;
    saveBarriersState(state);
  }
  renderBarriers();
}

// -------------- UTILIDADES ----------------
function showToast(message, ms = 1800) {
  let t = document.querySelector("#fk-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "fk-toast";
    t.style.position = "fixed";
    t.style.left = "50%";
    t.style.transform = "translateX(-50%)";
    t.style.bottom = "40px";
    t.style.background = "#111";
    t.style.color = "#fff";
    t.style.padding = "10px 16px";
    t.style.borderRadius = "10px";
    t.style.boxShadow = "0 6px 20px rgba(0,0,0,0.6)";
    t.style.zIndex = "9999";
    document.body.appendChild(t);
  }
  t.textContent = message;
  t.style.opacity = "1";
  setTimeout(() => { t.style.opacity = "0"; }, ms);
}

// -------- EXECUTAR QUANDO A PÁGINA CARREGA ----------
document.addEventListener("DOMContentLoaded", () => {
  showUser();
  simulateCameras();
  setupWaves();
  setupAlarms();
  setupMotion();
  setupProfile();
  setupBarriers(); // <-- novo
});
