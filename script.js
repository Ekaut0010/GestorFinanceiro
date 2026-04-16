//Variaveis
const gastoDescricao = document.getElementById("descricao");
const gastoValor = document.getElementById("valor");
const addGasto = document.getElementById("addGasto");
//Event listener para botao addGasto
addGasto.addEventListener("click", function () {
  const li = document.createElement("li");
  li.innerHTML = `${gastoDescricao.value}: R$ ${gastoValor.value}`;

  document.getElementById("gastoList").appendChild(li);
});

//Função para adicionar gasto

//Função para mostrar histórico de gastos
