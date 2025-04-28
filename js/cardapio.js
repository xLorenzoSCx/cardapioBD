import { db } from './firebaseConfig.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// CREATE - CADASTRAR DADOS DO ALIMENTO

function getInputs() {
    return {
        nome: document.getElementById('nome'),
        preco: document.getElementById('preco'),
        descricao: document.getElementById('descricao')
    };
}

function getValores({ nome, preco, descricao }) {
    return {
        nome: nome.value.trim(),
        preco: parseInt(preco.value),
        descricao: descricao.value.trim()
    };
}

function limpar({ nome, preco, descricao }) {
    nome.value = ''
    preco.value = ''
    descricao.value = ''
}

document.getElementById("btnEnviar").addEventListener('click', async function () {
    const Inputs = getInputs();
    const dados = getValores(Inputs)

    console.log("Inputs:", Inputs)
    console.log("Dados", dados)

    if (!dados.preco || !dados.nome || !dados.descricao) {
        alert("Preencha todos os campos.");
        return
    }
    try {
        const ref = await addDoc(collection(db, "alimentos"), dados);
        console.log("ID do documento", ref.id);
        limpar(Inputs)
        alert("Alimento cadastrado com sucesso! ID: " + ref.id);
    } catch (e) {
        console.log("Erro: ", e)
    }
});