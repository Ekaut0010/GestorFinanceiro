//Variaveis
const gastoDescricao = document.getElementById("descricao");
const gastoValor = document.getElementById("valor");
const addGasto = document.getElementById("addGasto");

//função Enter para adicionar gasto
addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    adicionarGasto();
  }
});

// Criar Gasto
function criarGasto(descricao, valor = parseFloat(gastoValor.value)) {
  const gastoItem = document.createElement("li");
  gastoItem.innerHTML = `<div class="gasto-item"><span class="texto">${descricao}</span>: R$ <span class="valorI">${valor.toFixed(2)}</span><button class="deleteBtn">Excluir</button><button class="okBtn">Paga</button></div>`;
  document.getElementById("gastoList").appendChild(gastoItem);

  gastoDescricao.value = "";
  gastoValor.value = "";
}

//Salvar gasto
function salvarGasto() {
  const gastoItens = [];
  document.querySelectorAll("#gastoList li").forEach((li) => {
    const textoI = li.querySelector(".texto").textContent;
    const valorG = parseFloat(
      li.querySelector(".valorI").textContent.replace("R$ ", ""),
    );
    gastoItens.push({ texto: textoI, valor: valorG });
  });
  localStorage.setItem("gastoItens", JSON.stringify(gastoItens));
}

//carregar gastos salvos
function carregarGastos() {
  const gastoItensC = JSON.parse(localStorage.getItem("gastoItens")) || [];
  gastoItensC.forEach((gasto) => {
    criarGasto(gasto.texto, gasto.valor);
  });
}
//adicionar Gasto
function adicionarGasto() {
  const descricao = gastoDescricao.value.trim();
  const valor = parseFloat(gastoValor.value);

  if (descricao === "" || isNaN(valor) || valor <= 0) {
    alert("Por favor, insira uma descrição válida e um valor positivo.");
    return;
  }

  criarGasto(descricao, valor);
  salvarGasto();
  somarGastos();
}

//função para excluir gasto
document.addEventListener("click", (event) => {
  const deleteBtn = event.target.closest(".deleteBtn");
  if (deleteBtn) {
    const gastoItem = deleteBtn.closest("li");
    gastoItem.remove();
    salvarGasto();
    somarGastos();
  }
});

//Função somar gastos
function somarGastos() {
  const gastoItensSG = JSON.parse(localStorage.getItem("gastoItens")) || [];
  const totalGastos = gastoItensSG.reduce(
    (total, gasto) => total + gasto.valor,
    0,
  );
  document.getElementById("gastoTotal").value = totalGastos.toFixed(2);
  const saldo = parseFloat(document.getElementById("saldo").value);
  if (!isNaN(saldo)) {
    const saldoFinal = saldo - totalGastos;
    document.getElementById("saldoFinal").value = saldoFinal.toFixed(2);
  }
}
//Event Listener para o botão de adicionar gasto
addGasto.addEventListener("click", adicionarGasto);

//iniciar a aplicação carregando os gastos salvos
carregarGastos();
somarGastos();

//Event Listener para atualizar o saldo final quando o saldo for alterado
document.getElementById("saldo").addEventListener("input", somarGastos);
