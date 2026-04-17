// ====================
// ELEMENTOS
// ====================
const el = {
  descricao: document.getElementById("descricao"),
  valor: document.getElementById("valor"),
  addBtn: document.getElementById("addGasto"),
  fecharMesBtn: document.getElementById("fecharMes"),
  limparHistoricoBtn: document.getElementById("limparHistorico"),

  lista: document.getElementById("gastoList"),
  historicoList: document.getElementById("historicoList"),

  saldo: document.getElementById("saldo"),
  gastoTotal: document.getElementById("gastoTotal"),
  saldoFinal: document.getElementById("saldoFinal"),
  mes: document.getElementById("mes"),
};

// ====================
// GASTOS
// ====================
function criarGasto(descricao, valor, done = false) {
  const li = document.createElement("li");

  li.innerHTML = `
    <div class="gasto-item ${done ? "pago" : ""}">
      <span class="texto">${descricao}</span>: 
      R$ <span class="valorI">${Number(valor).toFixed(2)}</span>
      <button class="deleteBtn">Excluir</button>
      <button class="okBtn">Paga</button>
    </div>
  `;

  el.lista?.appendChild(li);
}

function salvarGasto() {
  const gastos = [];

  document.querySelectorAll("#gastoList li").forEach((li) => {
    const texto = li.querySelector(".texto").textContent;
    const valor = Number(li.querySelector(".valorI").textContent);
    const done = li.querySelector(".gasto-item").classList.contains("pago");

    gastos.push({ texto, valor, done });
  });

  localStorage.setItem("gastoItens", JSON.stringify(gastos));
}

function carregarGastos() {
  const gastos = JSON.parse(localStorage.getItem("gastoItens")) || [];

  gastos.forEach((g) => criarGasto(g.texto, g.valor, g.done));
}

function adicionarGasto() {
  const descricao = el.descricao.value.trim();
  const valor = Number(el.valor.value);

  if (!descricao || isNaN(valor) || valor <= 0) {
    alert("Preencha corretamente.");
    return;
  }

  criarGasto(descricao, valor);
  salvarGasto();
  somarGastos();

  el.descricao.value = "";
  el.valor.value = "";
}

// ====================
// EVENTOS LISTA (DELEGATION)
// ====================
document.addEventListener("click", (event) => {
  const deleteBtn = event.target.closest(".deleteBtn");
  const okBtn = event.target.closest(".okBtn");

  if (deleteBtn) {
    deleteBtn.closest("li").remove();
  }

  if (okBtn) {
    okBtn.closest(".gasto-item").classList.toggle("pago");
  }

  if (deleteBtn || okBtn) {
    salvarGasto();
    somarGastos();
  }
});

// ====================
// SOMA
// ====================
function somarGastos() {
  const gastos = JSON.parse(localStorage.getItem("gastoItens")) || [];

  const total = gastos.reduce((acc, g) => acc + g.valor, 0);

  if (el.gastoTotal) el.gastoTotal.value = total.toFixed(2);

  const saldo = Number(el.saldo?.value);

  if (!isNaN(saldo) && el.saldoFinal) {
    el.saldoFinal.value = (saldo - total).toFixed(2);
  }
}

// ====================
// HISTÓRICO
// ====================
function salvarHistorico() {
  if (!el.saldo || !el.gastoTotal || !el.saldoFinal || !el.mes) return;

  const historico = JSON.parse(localStorage.getItem("historico")) || [];

  historico.push({
    mes: el.mes.value,
    saldoInicial: Number(el.saldo.value) || 0,
    gastoTotal: Number(el.gastoTotal.value) || 0,
    saldoFinal: Number(el.saldoFinal.value) || 0,
  });

  localStorage.setItem("historico", JSON.stringify(historico));
}

function carregarHistorico() {
  if (!el.historicoList) return;

  el.historicoList.innerHTML = "";

  const historico = JSON.parse(localStorage.getItem("historico")) || [];

  if (historico.length === 0) {
    el.historicoList.innerHTML = `<li style="opacity:0.6">Nenhum histórico disponível</li>`;
    return;
  }

  historico.forEach((item) => {
    const li = document.createElement("li");

    const saldoInicial = Number(item.saldoInicial) || 0;
    const gastoTotal = Number(item.gastoTotal) || 0;
    const saldoFinal = Number(item.saldoFinal) || 0;

    li.innerHTML = `
      <strong>${item.mes || "Mês não definido"}</strong>:
      Saldo Inicial: R$ ${saldoInicial.toFixed(2)} |
      Gastos: R$ ${gastoTotal.toFixed(2)} |
      Saldo Final: R$ ${saldoFinal.toFixed(2)}
    `;

    el.historicoList.appendChild(li);
  });
}

function fecharMes() {
  if (!confirm("Fechar mês?")) return;

  salvarHistorico();

  localStorage.removeItem("gastoItens");
  el.lista.innerHTML = "";

  if (el.gastoTotal) el.gastoTotal.value = "0.00";
  if (el.saldoFinal) el.saldoFinal.value = "0.00";

  carregarHistorico();
}

// ====================
// 🔥 NOVO: LIMPAR HISTÓRICO
// ====================
function limparHistorico() {
  if (!confirm("Apagar TODO o histórico?")) return;

  localStorage.removeItem("historico");

  if (el.historicoList) {
    el.historicoList.innerHTML = `<li style="opacity:0.6">Histórico apagado</li>`;
  }
}

// ====================
// INIT
// ====================
el.addBtn?.addEventListener("click", adicionarGasto);
el.fecharMesBtn?.addEventListener("click", fecharMes);
el.limparHistoricoBtn?.addEventListener("click", limparHistorico);
el.saldo?.addEventListener("input", somarGastos);

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter") adicionarGasto();
});

carregarGastos();
carregarHistorico();
somarGastos();
