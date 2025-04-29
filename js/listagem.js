import { db } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// READ / CONSULTAR OS DADOS DO ALIMENTO

async function buscarAlimentos() {
  const dadosBanco = await getDocs(collection(db, "alimentos"));
  const alimentos = [];
  for (const doc of dadosBanco.docs) {
    alimentos.push({ id: doc.id, ...doc.data() });
  }
  return alimentos;
}

const listaAlimentosDiv = document.getElementById("listar-alimentos");

async function carregarListaDeAlimentos() {
  listaAlimentosDiv.innerHTML = "<p> Carregando lista de alimentos... </p>";
  try {
    const alimentos = await buscarAlimentos();
    console.log(alimentos);
    renderizarListaDeAlimentos(alimentos);
  } catch (error) {
    console.log("Erro ao carregar a lista de alimentos: ", error);
    listaAlimentosDiv.innerHTML =
      "<p> Erro ao carregar a lista de alimentos... </p>";
  }
}

function renderizarListaDeAlimentos(alimentos) {
  listaAlimentosDiv.innerHTML = "";

  if (alimentos.length === 0) {
    listaAlimentosDiv.innerHTML =
      "<p> Nenhum Alimento cadastrado ainda ;( </p> ";
    return;
  }
  for (let alimento of alimentos) {
    const alimentoDiv = document.createElement("div");
    alimentoDiv.classList.add("cardapio-item");
    alimentoDiv.innerHTML = `
            <strong> Nome: </strong> ${alimento.nome} <br>
            <strong> Preço: </strong> R$${alimento.preco} <br>
            <strong> Descrição: </strong> ${alimento.descricao} <br>
            <button class="btn-Excluir" data-id="${alimento.id}"> Excluir </button>
            <button class="btn-Editar" data-id="${alimento.id}"> Editar </button>
        `;
    listaAlimentosDiv.appendChild(alimentoDiv);
  }

  // Adicionar listeners de ação APÓS a renderização da lista
  adicionarListenersDeAcao();
}

// DELETE - EXCLUIR OS DADOS DO ALIMENTO

async function excluirAlimento(idAlimento) {
  try {
    const documentoDeletar = doc(db, "alimentos", idAlimento);
    await deleteDoc(documentoDeletar);
    console.log("Alimento com ID" + idAlimento + "foi excluído.");
    return true;
  } catch (erro) {
    console.log("Erro ao excluir o alimento", erro);
    alert("Ocorreu um erro ao excluir o alimento. Tente novamente");
    return false;
  }
}

async function lidarClique(eventoDeClique) {
  const btnExcluir = eventoDeClique.target.closest(".btn-Excluir");
  if (btnExcluir) {
    const certeza = await Swal.fire({
      icon: "warning",
      title: "Confirmação",
      text: "Deseja excluir este item?",
      showCancelButton: true,
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
    });

    console.log(certeza);

    if (certeza.isConfirmed) {
      const idAlimento = btnExcluir.dataset.id;
      const exclusaoBemSucedida = await excluirAlimento(idAlimento);

      if (exclusaoBemSucedida) {
        carregarListaDeAlimentos();
        Swal.fire({
          title: "Confirmação",
          text: "Alimento excluido com sucesso!",
          icon: "success",
        });
      }
    } else {
      Swal.fire({
        title: "Cancelamento",
        text: "Alimento não excluido!",
        icon: "error",
      });
    }
  }

  const btnEditar = eventoDeClique.target.closest(".btn-Editar");
  if (btnEditar) {
    const idAlimento = btnEditar.dataset.id;
    const alimento = await buscarAlimentoPorId(idAlimento);

    const edicao = getValoresEditar();

    edicao.editarNome.value = alimento.nome;
    edicao.editarPreco.value = alimento.preco;
    edicao.editarDescricao.value = alimento.descricao;
    edicao.editarId.value = alimento.id;

    edicao.cardapioEdicao.style.display = "block";
  }
}

// UPDATE - EDITAR OS DADOS DO ALIMENTO

function getValoresEditar() {
  return {
    editarNome: document.getElementById("editar-nome"),
    editarPreco: document.getElementById("editar-preco"),
    editarDescricao: document.getElementById("editar-descricao"),
    editarId: document.getElementById("editar-id"),
    cardapioEdicao: document.getElementById("cardapio-edicao"),
  };
}

async function buscarAlimentoPorId(id) {
  try {
    const alimentoDoc = doc(db, "alimentos", id);
    const snapshot = await getDoc(alimentoDoc);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    } else {
      console.log("Alimento não encontrado com o ID:", id);
      return null;
    }
  } catch (error) {
    console.log("Erro ao buscar alimento por ID:", error);
    alert("Erro ao buscar alimento para edição.");
    return null;
  }
}

document
  .getElementById("btn-salvar-edicao")
  .addEventListener("click", async () => {
    const edicao = getValoresEditar();
    const id = edicao.editarId.value;
    const novosDados = {
      nome: edicao.editarNome.value.trim(),
      preco: parseInt(edicao.editarPreco.value),
      descricao: edicao.editarDescricao.value.trim(),
    };

    try {
      const ref = doc(db, "alimentos", id);
      await setDoc(ref, novosDados);
      Swal.fire({
        icon: "success",
        title: "Alterado",
        text: "Item alterado com sucesso!",
    
      });
      edicao.cardapioEdicao.style.display = "none";
      carregarListaDeAlimentos();
    } catch (error) {
      console.log("Erro ao salvar edição:", error);
      Swal.fire({
        icon: "warning",
        title: "Confirmação",
        text: "Item não atualizado",
        showCancelButton: true,
      });
    }
  });

document.getElementById("btn-cancelar-edicao").addEventListener("click", () => {
  document.getElementById("cardapio-edicao").style.display = "none";
});

function adicionarListenersDeAcao() {
  listaAlimentosDiv.addEventListener("click", lidarClique);
}

document.addEventListener("DOMContentLoaded", carregarListaDeAlimentos);
