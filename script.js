// ====================
// ELEMENTOS
// ====================
const el = {
  descricao: document.getElementById("descricao"),
  valor: document.getElementById("valor"),
  categoria: document.getElementById("categoria"),

  addBtn: document.getElementById("addGasto"),
  fecharMesBtn: document.getElementById("fecharMes"),
  limparHistoricoBtn: document.getElementById("limparHistorico"),

  lista: document.getElementById("gastoList"),
  historicoList: document.getElementById("historicoList"),

  saldo: document.getElementById("saldo"),
  gastoTotal: document.getElementById("gastoTotal"),
  saldoFinal: document.getElementById("saldoFinal"),
  mes: document.getElementById("mes"),

  cardSaldoFinal: document.getElementById("cardSaldoFinal"),
  cardRenda: document.getElementById("cardRenda"),
  cardGastos: document.getElementById("cardGastos"),

  menuToggle: document.getElementById("menuToggle"),
  menu: document.getElementById("menu"),
  header: document.querySelector(".header"),
  intro: document.querySelector(".intro"),
  titles: document.querySelectorAll(".section-title"),
};

// ====================
// STORAGE
// ====================
const STORAGE_KEYS = {
  gastos: "gastoItens",
  historico: "historico",
  renda: "renda",
};

function getGastos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.gastos)) || [];
}

function setGastos(gastos) {
  localStorage.setItem(STORAGE_KEYS.gastos, JSON.stringify(gastos));
}

function getHistorico() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.historico)) || [];
}

function setHistorico(historico) {
  localStorage.setItem(STORAGE_KEYS.historico, JSON.stringify(historico));
}

// ====================
// UTIL
// ====================
function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getRenda() {
  return Number(localStorage.getItem(STORAGE_KEYS.renda)) || 0;
}

function setRenda(valor) {
  localStorage.setItem(STORAGE_KEYS.renda, String(valor));
}

// ====================
// GASTOS
// ====================
function criarGasto(descricao, valor, categoria, done = false) {
  const li = document.createElement("li");
  li.className = "gasto-item" + (done ? " pago" : "");

  li.innerHTML = `
    <div class="gasto-left">
      <span class="texto">${descricao}</span>
      <span class="categoria categoria-${categoria.toLowerCase()}">${categoria}</span>
    </div>
    <div class="gasto-right">
      <span class="valor">R$ ${Number(valor).toFixed(2)}</span>
      <div class="actions">
        <button class="okBtn">✔</button>
        <button class="editBtn">✏</button>
        <button class="deleteBtn">✖</button>
      </div>
    </div>
  `;

  el.lista?.appendChild(li);
}

function renderGastos() {
  if (!el.lista) return;
  el.lista.innerHTML = "";
  getGastos().forEach((g) => criarGasto(g.texto, g.valor, g.categoria, g.done));
}

// FIX: lia do `li` diretamente em vez de `li.querySelector(".gasto-item")`
// (o `li` em si possui a classe gasto-item, não um filho dele)
function salvarGastosDaTela() {
  if (!el.lista) return;

  const gastos = [];

  document.querySelectorAll("#gastoList li").forEach((li) => {
    gastos.push({
      texto: li.querySelector(".texto").textContent,
      valor: Number(
        li.querySelector(".valor").textContent.replace("R$", "").trim(),
      ),
      categoria: li.querySelector(".categoria").textContent,
      done: li.classList.contains("pago"),
    });
  });

  setGastos(gastos);
}

function adicionarGasto() {
  const descricao = el.descricao?.value.trim();
  const valor = Number(el.valor?.value);
  const categoria = el.categoria?.value || "Outros";

  if (!descricao || Number.isNaN(valor) || valor <= 0) {
    alert("Preencha corretamente.");
    return;
  }

  const gastos = getGastos();
  gastos.push({ texto: descricao, valor, categoria, done: false });
  setGastos(gastos);

  renderGastos();
  somarGastos();

  el.descricao.value = "";
  el.valor.value = "";
  if (el.categoria) el.categoria.selectedIndex = 0;
}

// FIX: era `.valorI` (typo) — corrigido para `.valor`
function editarGasto(li) {
  const textoEl = li.querySelector(".texto");
  const valorEl = li.querySelector(".valor");
  const categoriaEl = li.querySelector(".categoria");

  const novoTexto = prompt("Editar descrição:", textoEl.textContent);
  const novoValor = prompt(
    "Editar valor:",
    valorEl.textContent.replace("R$", "").trim(),
  );
  const novaCategoria = prompt("Editar categoria:", categoriaEl.textContent);

  if (novoTexto !== null && novoTexto.trim() !== "") {
    textoEl.textContent = novoTexto.trim();
  }

  if (novoValor !== null && novoValor.trim() !== "") {
    const valorNumero = Number(novoValor.replace(",", "."));
    if (!Number.isNaN(valorNumero) && valorNumero > 0) {
      valorEl.textContent = `R$ ${valorNumero.toFixed(2)}`;
    }
  }

  if (novaCategoria !== null && novaCategoria.trim() !== "") {
    categoriaEl.textContent = novaCategoria.trim();
  }

  salvarGastosDaTela();
  somarGastos();
}

// ====================
// SOMA
// ====================
function somarGastos() {
  const gastos = getGastos();
  const total = gastos.reduce((acc, g) => acc + Number(g.valor), 0);
  const saldo = getRenda();
  const saldoFinal = saldo - total;

  if (el.gastoTotal) el.gastoTotal.value = total.toFixed(2);

  if (el.saldoFinal) {
    el.saldoFinal.value = saldoFinal.toFixed(2);
    el.saldoFinal.classList.remove("positive", "negative");
    if (saldoFinal > 0) el.saldoFinal.classList.add("positive");
    if (saldoFinal < 0) el.saldoFinal.classList.add("negative");
  }

  if (el.cardGastos) el.cardGastos.textContent = formatarMoeda(total);
  if (el.cardRenda) el.cardRenda.textContent = formatarMoeda(saldo);
  if (el.cardSaldoFinal)
    el.cardSaldoFinal.textContent = formatarMoeda(saldoFinal);

  // FIX: gráfico atualizado aqui em vez de chamar somarGastos dentro de renderGrafico
  renderGrafico();
}

// ====================
// RENDA
// ====================
// FIX: carregarRenda agora define o valor numérico puro no input,
// evitando que "R$ 1.000,00" quebre o parse no evento `input`
function carregarRenda() {
  if (!el.saldo) return;
  const renda = getRenda();
  if (renda > 0) el.saldo.value = renda;
}

function configurarEventosRenda() {
  if (!el.saldo) return;

  el.saldo.addEventListener("input", (e) => {
    const valor = Number(e.target.value) || 0;
    setRenda(valor);
    somarGastos();
  });

  el.saldo.addEventListener("blur", (e) => {
    const valor = getRenda();
    e.target.value = formatarMoeda(valor);
  });

  el.saldo.addEventListener("focus", (e) => {
    e.target.value = getRenda() || "";
  });
}

// ====================
// HISTÓRICO
// ====================
function salvarHistorico() {
  if (!el.mes) return;

  const renda = getRenda();
  const gastoTotal = Number(el.gastoTotal?.value) || 0;
  const saldoFinal = renda - gastoTotal;

  const historico = getHistorico();
  historico.push({
    mes: el.mes.value,
    saldoInicial: renda,
    gastoTotal,
    saldoFinal,
  });

  setHistorico(historico);
}

function carregarHistorico() {
  if (!el.historicoList) return;
  el.historicoList.innerHTML = "";

  const historico = getHistorico();

  if (historico.length === 0) {
    el.historicoList.innerHTML = `<li style="opacity:0.6">Nenhum histórico disponível</li>`;
    return;
  }

  historico.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${item.mes || "Mês não definido"}</strong>:
      Saldo Inicial: R$ ${(Number(item.saldoInicial) || 0).toFixed(2)} |
      Gastos: R$ ${(Number(item.gastoTotal) || 0).toFixed(2)} |
      Saldo Final: R$ ${(Number(item.saldoFinal) || 0).toFixed(2)}
    `;
    el.historicoList.appendChild(li);
  });
}

function fecharMes() {
  if (!confirm("Fechar mês?")) return;

  salvarHistorico();
  localStorage.removeItem(STORAGE_KEYS.gastos);
  renderGastos();

  if (el.gastoTotal) el.gastoTotal.value = "0.00";
  if (el.saldoFinal) el.saldoFinal.value = "0.00";

  carregarHistorico();
  somarGastos();
}

function limparHistorico() {
  if (!confirm("Apagar TODO o histórico?")) return;
  localStorage.removeItem(STORAGE_KEYS.historico);
  if (el.historicoList) {
    el.historicoList.innerHTML = `<li style="opacity:0.6">Histórico apagado</li>`;
  }
}

// ====================
// HEADER
// ====================
function configurarHeader() {
  if (!el.header) return;

  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    if (currentScroll > lastScroll && currentScroll > 50) {
      el.header.classList.add("hidden");
    } else {
      el.header.classList.remove("hidden");
    }
    lastScroll = currentScroll;
  });

  el.menuToggle?.addEventListener("click", () => {
    el.menu?.classList.toggle("active");
  });
}

// ====================
// INTRO
// ====================
function configurarIntro() {
  if (!el.intro) return;

  window.addEventListener("load", () => {
    setTimeout(() => el.intro.classList.add("show"), 200);
  });

  window.addEventListener("scroll", () => {
    el.intro.classList.toggle("fade-out", window.scrollY > 80);
  });
}

// ====================
// TÍTULOS
// ====================
function configurarTitulos() {
  if (!el.titles.length) return;

  window.addEventListener("load", () => {
    el.titles.forEach((title, i) => {
      setTimeout(() => title.classList.add("show"), 200 + i * 150);
    });
  });

  window.addEventListener("scroll", () => {
    el.titles.forEach((title) => {
      title.classList.toggle("fade-out", window.scrollY > 80);
    });
  });
}

// ====================
// TOUCH
// ====================
function configurarSwipe() {
  let startX = 0;

  document.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  document.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    const item = e.target.closest(".gasto-item");
    if (!item) return;

    if (startX - endX > 50) item.classList.add("swiped");
    if (endX - startX > 50) item.classList.remove("swiped");
  });
}

// ====================
// EVENTOS LISTA
// ====================
// FIX: delegação corrigida — o `li` possui a classe `gasto-item`,
// portanto buscamos o `li` pai e operamos nele diretamente
function configurarEventosLista() {
  document.addEventListener("click", (e) => {
    const li = e.target.closest("#gastoList li");
    if (!li) return;

    if (e.target.closest(".deleteBtn")) {
      li.remove();
      salvarGastosDaTela();
      somarGastos();
      return;
    }

    if (e.target.closest(".okBtn")) {
      li.classList.toggle("pago");
      salvarGastosDaTela();
      somarGastos();
      return;
    }

    if (e.target.closest(".editBtn")) {
      editarGasto(li);
    }
  });
}

// ====================
// GRÁFICO
// ====================
function gerarResumoCategorias() {
  const resumo = {};
  getGastos().forEach((g) => {
    resumo[g.categoria] = (resumo[g.categoria] || 0) + g.valor;
  });
  return resumo;
}

let chart;

// FIX: renderGrafico não chama mais somarGastos (evita loop/re-criação desnecessária)
function renderGrafico() {
  const ctx = document.getElementById("graficoGastos");
  if (!ctx) return;

  const resumo = gerarResumoCategorias();
  const labels = Object.keys(resumo);
  const valores = Object.values(resumo);

  const cores = [
    "#22c55e",
    "#3b82f6",
    "#a855f7",
    "#f59e0b",
    "#ef4444",
    "#6366f1",
    "#6b7280",
  ];

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ data: valores, backgroundColor: cores, borderWidth: 0 }],
    },
    options: {
      plugins: {
        legend: { labels: { color: "#fff" } },
      },
    },
  });
}
// ====================
// TEMA CLARO / ESCURO
// ====================

// Adicione este HTML dentro do .menu (no seu HTML):
//
// <button class="theme-toggle" id="themeToggle" aria-label="Alternar tema">
//   <span class="toggle-label">☀️ Tema claro</span>
//   <span class="toggle-pill"></span>
// </button>

const THEME_KEY = "tema";

function aplicarTema(tema) {
  if (tema === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }
  atualizarToggleLabel();
}

function atualizarToggleLabel() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const label = btn.querySelector(".toggle-label");
  const isLight = document.body.classList.contains("light");

  if (label) label.textContent = isLight ? "🌙 Tema escuro" : "☀️ Tema claro";
}

function configurarTema() {
  const temaSalvo = localStorage.getItem(THEME_KEY) || "dark";
  aplicarTema(temaSalvo);

  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const isLight = document.body.classList.contains("light");
    const novoTema = isLight ? "dark" : "light";
    localStorage.setItem(THEME_KEY, novoTema);
    aplicarTema(novoTema);
  });
}

// ====================
// INIT
// ====================
function init() {
  el.addBtn?.addEventListener("click", adicionarGasto);
  el.fecharMesBtn?.addEventListener("click", fecharMes);
  el.limparHistoricoBtn?.addEventListener("click", limparHistorico);

  el.valor?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") adicionarGasto();
  });

  configurarEventosRenda();
  configurarEventosLista();
  configurarHeader();
  configurarIntro();
  configurarTitulos();
  configurarSwipe();
  configurarTema();
  renderGastos();
  carregarHistorico();
  carregarRenda();
  somarGastos(); // já chama renderGrafico internamente
}

init();
