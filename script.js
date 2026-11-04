
console.log("DMIKA iniciado com sucesso!");

// Identifica o formulário de receitas
const formReceita = document.getElementById("formReceita");
const listaReceitas = document.getElementById("listaReceitas");

// Guarda as receitas no navegador
let receitas = JSON.parse(localStorage.getItem("dmika_receitas") || "[]");

// Identifica se estamos editando uma receita
let receitaEmEdicao = null;

// Formata os valores em reais
function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Salva as receitas no navegador
function salvarReceitas() {
    localStorage.setItem("dmika_receitas", JSON.stringify(receitas));
}

// Atualiza os totais da página
function atualizarResumo() {
    const total = receitas.reduce((soma, receita) => soma + Number(receita.valor), 0);

    const fixas = receitas
        .filter(receita => receita.tipo === "Fixa")
        .reduce((soma, receita) => soma + Number(receita.valor), 0);

    const variaveis = receitas
        .filter(receita => receita.tipo === "Variável")
        .reduce((soma, receita) => soma + Number(receita.valor), 0);

    document.getElementById("totalReceitas").textContent = formatarMoeda(total);
    document.getElementById("totalFixas").textContent = formatarMoeda(fixas);
    document.getElementById("totalVariaveis").textContent = formatarMoeda(variaveis);
}

// Mostra as receitas cadastradas
function mostrarReceitas() {
    listaReceitas.innerHTML = "";

    if (receitas.length === 0) {
        listaReceitas.textContent = "Nenhuma receita cadastrada ainda.";
        atualizarResumo();
        return;
    }

    receitas.forEach(receita => {
        const item = document.createElement("div");
        item.className = "movement";

        const informacoes = document.createElement("div");

        const descricao = document.createElement("strong");
        descricao.textContent = receita.descricao;

        const detalhes = document.createElement("p");
        detalhes.textContent =
            `${receita.categoria} | ${receita.tipo} | ${receita.responsavel} | ${receita.data}`;

        const valor = document.createElement("strong");
        valor.textContent = formatarMoeda(receita.valor);
        valor.className = "positive";

        informacoes.append(descricao, detalhes, valor);

        const botoes = document.createElement("div");

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.textContent = "Editar";
        botaoEditar.addEventListener("click", () => editarReceita(receita.id));

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.addEventListener("click", () => excluirReceita(receita.id));

        botoes.append(botaoEditar, botaoExcluir);
        item.append(informacoes, botoes);
        listaReceitas.appendChild(item);
    });

    atualizarResumo();
}

// Cadastra uma nova receita ou salva uma edição
if (formReceita) {
    formReceita.addEventListener("submit", function(event) {
        event.preventDefault();

        const descricao = document.getElementById("descricao").value.trim();
        const valor = Number(document.getElementById("valor").value);
        const categoria = document.getElementById("categoria").value;
        const tipo = document.getElementById("tipo").value;
        const data = document.getElementById("data").value;
        const responsavel = document.getElementById("responsavel").value;

        if (!descricao || valor <= 0 || !categoria || !tipo || !data || !responsavel) {
            alert("Preencha todos os campos corretamente.");
            return;
        }

        const novaReceita = {
            id: receitaEmEdicao || Date.now(),
            descricao,
            valor,
            categoria,
            tipo,
            data,
            responsavel
        };

        if (receitaEmEdicao) {
            receitas = receitas.map(receita =>
                receita.id === receitaEmEdicao ? novaReceita : receita
            );
        } else {
            receitas.push(novaReceita);
        }

        salvarReceitas();
        mostrarReceitas();
        formReceita.reset();

        receitaEmEdicao = null;
        document.querySelector("#formReceita button[type='submit']").textContent =
            "Adicionar receita";

        document.getElementById("cancelarEdicao").hidden = true;

        alert("Receita salva com sucesso!");
    });
}

// Preenche o formulário para editar uma receita
function editarReceita(id) {
    const receita = receitas.find(item => item.id === id);

    if (!receita) return;

    receitaEmEdicao = id;

    document.getElementById("descricao").value = receita.descricao;
    document.getElementById("valor").value = receita.valor;
    document.getElementById("categoria").value = receita.categoria;
    document.getElementById("tipo").value = receita.tipo;
    document.getElementById("data").value = receita.data;
    document.getElementById("responsavel").value = receita.responsavel;

    document.querySelector("#formReceita button[type='submit']").textContent =
        "Salvar alterações";

    document.getElementById("cancelarEdicao").hidden = false;

    formReceita.scrollIntoView({ behavior: "smooth" });
}

// Exclui uma receita
function excluirReceita(id) {
    const confirmar = confirm("Tem certeza que deseja excluir esta receita?");

    if (!confirmar) return;

    receitas = receitas.filter(receita => receita.id !== id);

    salvarReceitas();
    mostrarReceitas();

    if (receitaEmEdicao === id) {
        cancelarEdicao();
    }
}

// Cancela uma edição
function cancelarEdicao() {
    receitaEmEdicao = null;
    formReceita.reset();

    document.querySelector("#formReceita button[type='submit']").textContent =
        "Adicionar receita";

    document.getElementById("cancelarEdicao").hidden = true;
}

// Cria o botão para cancelar edição
if (formReceita) {
    const botaoCancelar = document.createElement("button");
    botaoCancelar.type = "button";
    botaoCancelar.id = "cancelarEdicao";
    botaoCancelar.textContent = "Cancelar edição";
    botaoCancelar.hidden = true;
    botaoCancelar.addEventListener("click", cancelarEdicao);

    formReceita.appendChild(botaoCancelar);
}

// Mantém o seletor de mês funcionando nas páginas que o possuem
const seletorMes = document.getElementById("mes");

if (seletorMes) {
    seletorMes.addEventListener("change", function() {
        console.log("Mês selecionado:", seletorMes.value);
    });
}

// Carrega as receitas ao abrir a página
if (formReceita && listaReceitas) {
    mostrarReceitas();
}
