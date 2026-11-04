
console.log("DMIKA iniciado com sucesso!");

// ======================================
// CONFIGURAÇÃO GERAL
// ======================================

const seletorMes = document.getElementById("mes");

if (seletorMes) {
    seletorMes.addEventListener("change", function() {
        console.log("Mês selecionado:", seletorMes.value);
    });
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function criarBotao(texto, funcao) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = texto;
    botao.addEventListener("click", funcao);
    return botao;
}

// ======================================
// RECEITAS
// ======================================

const formReceita = document.getElementById("formReceita");
const listaReceitas = document.getElementById("listaReceitas");

let receitas = JSON.parse(localStorage.getItem("dmika_receitas") || "[]");
let receitaEmEdicao = null;

function salvarReceitas() {
    localStorage.setItem("dmika_receitas", JSON.stringify(receitas));
}

function atualizarResumoReceitas() {
    const total = receitas.reduce(
        (soma, item) => soma + Number(item.valor), 0
    );

    const fixas = receitas
        .filter(item => item.tipo === "Fixa")
        .reduce((soma, item) => soma + Number(item.valor), 0);

    const variaveis = receitas
        .filter(item => item.tipo === "Variável")
        .reduce((soma, item) => soma + Number(item.valor), 0);

    document.getElementById("totalReceitas").textContent = formatarMoeda(total);
    document.getElementById("totalFixas").textContent = formatarMoeda(fixas);
    document.getElementById("totalVariaveis").textContent = formatarMoeda(variaveis);
}

function mostrarReceitas() {
    listaReceitas.innerHTML = "";

    if (receitas.length === 0) {
        listaReceitas.textContent = "Nenhuma receita cadastrada ainda.";
        atualizarResumoReceitas();
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

        informacoes.append(descricao, detalhes, valor);

        const botoes = document.createElement("div");

        botoes.append(
            criarBotao("Editar", () => editarReceita(receita.id)),
            criarBotao("Excluir", () => excluirReceita(receita.id))
        );

        item.append(informacoes, botoes);
        listaReceitas.appendChild(item);
    });

    atualizarResumoReceitas();
}

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

    document.getElementById("botaoReceita").textContent = "Salvar alterações";
    document.getElementById("cancelarEdicaoReceita").hidden = false;

    formReceita.scrollIntoView({ behavior: "smooth" });
}

function excluirReceita(id) {
    if (!confirm("Deseja realmente excluir esta receita?")) return;

    receitas = receitas.filter(item => item.id !== id);
    salvarReceitas();
    mostrarReceitas();

    if (receitaEmEdicao === id) cancelarEdicaoReceita();
}

function cancelarEdicaoReceita() {
    receitaEmEdicao = null;
    formReceita.reset();
    document.getElementById("botaoReceita").textContent = "Adicionar receita";
    document.getElementById("cancelarEdicaoReceita").hidden = true;
}

if (formReceita && listaReceitas) {
    const botaoReceita = formReceita.querySelector('button[type="submit"]');
    botaoReceita.id = "botaoReceita";

    const cancelar = criarBotao("Cancelar edição", cancelarEdicaoReceita);
    cancelar.id = "cancelarEdicaoReceita";
    cancelar.hidden = true;
    formReceita.appendChild(cancelar);

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
            receitas = receitas.map(item =>
                item.id === receitaEmEdicao ? novaReceita : item
            );
        } else {
            receitas.push(novaReceita);
        }

        salvarReceitas();
        mostrarReceitas();
        formReceita.reset();
        receitaEmEdicao = null;
        document.getElementById("botaoReceita").textContent = "Adicionar receita";
        document.getElementById("cancelarEdicaoReceita").hidden = true;

        alert("Receita salva com sucesso!");
    });

    mostrarReceitas();
}

// ======================================
// DESPESAS
// ======================================

const formDespesa = document.getElementById("formDespesa");
const listaDespesas = document.getElementById("listaDespesas");

let despesas = JSON.parse(localStorage.getItem("dmika_despesas") || "[]");
let despesaEmEdicao = null;

function salvarDespesas() {
    localStorage.setItem("dmika_despesas", JSON.stringify(despesas));
}

function atualizarResumoDespesas() {
    const total = despesas.reduce(
        (soma, item) => soma + Number(item.valor), 0
    );

    const fixas = despesas
        .filter(item => item.tipo === "Fixa")
        .reduce((soma, item) => soma + Number(item.valor), 0);

    const variaveis = despesas
        .filter(item => item.tipo === "Variável")
        .reduce((soma, item) => soma + Number(item.valor), 0);

    document.getElementById("totalDespesas").textContent = formatarMoeda(total);
    document.getElementById("totalDespesasFixas").textContent = formatarMoeda(fixas);
    document.getElementById("totalDespesasVariaveis").textContent = formatarMoeda(variaveis);
}

function mostrarDespesas() {
    listaDespesas.innerHTML = "";

    if (despesas.length === 0) {
        listaDespesas.textContent = "Nenhuma despesa cadastrada ainda.";
        atualizarResumoDespesas();
        return;
    }

    despesas.forEach(despesa => {
        const item = document.createElement("div");
        item.className = "movement";

        const informacoes = document.createElement("div");

        const descricao = document.createElement("strong");
        descricao.textContent = despesa.descricao;

        const detalhes = document.createElement("p");
        detalhes.textContent =
            `${despesa.categoria} | ${despesa.tipo} | ${despesa.responsavel} | Vencimento: ${despesa.data}`;

        const status = document.createElement("p");
        status.textContent = "Status: " + despesa.status;

        const valor = document.createElement("strong");
        valor.textContent = formatarMoeda(despesa.valor);

        informacoes.append(descricao, detalhes, status, valor);

        const botoes = document.createElement("div");

        botoes.append(
            criarBotao("Editar", () => editarDespesa(despesa.id)),
            criarBotao("Excluir", () => excluirDespesa(despesa.id))
        );

        item.append(informacoes, botoes);
        listaDespesas.appendChild(item);
    });

    atualizarResumoDespesas();
}

function editarDespesa(id) {
    const despesa = despesas.find(item => item.id === id);
    if (!despesa) return;

    despesaEmEdicao = id;

    document.getElementById("descricaoDespesa").value = despesa.descricao;
    document.getElementById("valorDespesa").value = despesa.valor;
    document.getElementById("categoriaDespesa").value = despesa.categoria;
    document.getElementById("tipoDespesa").value = despesa.tipo;
    document.getElementById("vencimentoDespesa").value = despesa.data;
    document.getElementById("statusDespesa").value = despesa.status;
    document.getElementById("responsavelDespesa").value = despesa.responsavel;

    document.getElementById("botaoDespesa").textContent = "Salvar alterações";
    document.getElementById("cancelarEdicaoDespesa").hidden = false;

    formDespesa.scrollIntoView({ behavior: "smooth" });
}

function excluirDespesa(id) {
    if (!confirm("Deseja realmente excluir esta despesa?")) return;

    despesas = despesas.filter(item => item.id !== id);
    salvarDespesas();
    mostrarDespesas();

    if (despesaEmEdicao === id) cancelarEdicaoDespesa();
}

function cancelarEdicaoDespesa() {
    despesaEmEdicao = null;
    formDespesa.reset();
    document.getElementById("botaoDespesa").textContent = "Adicionar despesa";
    document.getElementById("cancelarEdicaoDespesa").hidden = true;
}

if (formDespesa && listaDespesas) {
    const cancelar = criarBotao("Cancelar edição", cancelarEdicaoDespesa);
    cancelar.id = "cancelarEdicaoDespesa";
    cancelar.hidden = true;
    formDespesa.appendChild(cancelar);

    formDespesa.addEventListener("submit", function(event) {
        event.preventDefault();

        const descricao = document.getElementById("descricaoDespesa").value.trim();
        const valor = Number(document.getElementById("valorDespesa").value);
        const categoria = document.getElementById("categoriaDespesa").value;
        const tipo = document.getElementById("tipoDespesa").value;
        const data = document.getElementById("vencimentoDespesa").value;
        const status = document.getElementById("statusDespesa").value;
        const responsavel = document.getElementById("responsavelDespesa").value;

        if (!descricao || valor <= 0 || !categoria || !tipo || !data || !status || !responsavel) {
            alert("Preencha todos os campos corretamente.");
            return;
        }

        const novaDespesa = {
            id: despesaEmEdicao || Date.now(),
            descricao,
            valor,
            categoria,
            tipo,
            data,
            status,
            responsavel
        };

        if (despesaEmEdicao) {
            despesas = despesas.map(item =>
                item.id === despesaEmEdicao ? novaDespesa : item
            );
        } else {
            despesas.push(novaDespesa);
        }

        salvarDespesas();
        mostrarDespesas();
        formDespesa.reset();
        despesaEmEdicao = null;
        document.getElementById("botaoDespesa").textContent = "Adicionar despesa";
        document.getElementById("cancelarEdicaoDespesa").hidden = true;

        alert("Despesa salva com sucesso!");
    });

    mostrarDespesas();
}

// ======================================
// METAS
// ======================================

const formMeta = document.getElementById("formMeta");
const listaMetasMeta = document.getElementById("listaMetas");

let metas = JSON.parse(localStorage.getItem("dmika_metas") || "[]");
let metaEmEdicao = null;

function salvarMetas() {
    localStorage.setItem("dmika_metas", JSON.stringify(metas));
}

function atualizarResumoMetas() {
    const total = metas.reduce(
        (soma, meta) => soma + Number(meta.objetivo), 0
    );

    const guardado = metas.reduce(
        (soma, meta) => soma + Number(meta.guardado), 0
    );

    const falta = metas.reduce(
        (soma, meta) => soma + Math.max(0, Number(meta.objetivo) - Number(meta.guardado)), 0
    );

    document.getElementById("totalMetas").textContent = formatarMoeda(total);
    document.getElementById("totalGuardadoMetas").textContent = formatarMoeda(guardado);
    document.getElementById("totalFaltaMetas").textContent = formatarMoeda(falta);
}

function mostrarMetas() {
    listaMetasMeta.innerHTML = "";
    atualizarResumoMetas();

    if (metas.length === 0) {
        listaMetasMeta.textContent = "Nenhuma meta cadastrada ainda.";
        return;
    }

    metas.forEach(meta => {
        const objetivo = Number(meta.objetivo);
        const guardado = Number(meta.guardado);
        const percentual = Math.min(100, (guardado / objetivo) * 100);

        const item = document.createElement("div");
        item.className = "meaning";

        const titulo = document.createElement("strong");
        titulo.textContent = meta.nome;

        const valorObjetivo = document.createElement("p");
        valorObjetivo.textContent = "Objetivo: " + formatarMoeda(objetivo);

        const valorGuardado = document.createElement("p");
        valorGuardado.textContent = "Guardado: " + formatarMoeda(guardado);

        const prazo = document.createElement("p");
        prazo.textContent = "Prazo: " + meta.prazo.split("-").reverse().join("/");

        const responsavel = document.createElement("p");
        responsavel.textContent = "Responsável: " + meta.responsavel;

        const barra = document.createElement("div");
        barra.className = "progress";

        const progresso = document.createElement("div");
        progresso.style.width = percentual + "%";
        barra.appendChild(progresso);

        const percentualTexto = document.createElement("span");
        percentualTexto.textContent =
            percentual.toFixed(1).replace(".", ",") + "% concluído";

        const botoes = document.createElement("div");

        botoes.append(
            criarBotao("Editar", () => editarMeta(meta.id)),
            criarBotao("Excluir", () => excluirMeta(meta.id))
        );

        item.append(
            titulo,
            valorObjetivo,
            valorGuardado,
            prazo,
            responsavel,
            barra,
            percentualTexto,
            botoes
        );

        listaMetasMeta.appendChild(item);
    });
}

function editarMeta(id) {
    const meta = metas.find(item => item.id === id);
    if (!meta) return;

    metaEmEdicao = id;

    document.getElementById("nomeMeta").value = meta.nome;
    document.getElementById("valorObjetivo").value = meta.objetivo;
    document.getElementById("valorGuardado").value = meta.guardado;
    document.getElementById("prazoMeta").value = meta.prazo;
    document.getElementById("responsavelMeta").value = meta.responsavel;

    document.getElementById("botaoMeta").textContent = "Salvar alterações";
    document.getElementById("cancelarEdicaoMeta").hidden = false;

    formMeta.scrollIntoView({ behavior: "smooth" });
}

function excluirMeta(id) {
    if (!confirm("Deseja realmente excluir esta meta?")) return;

    metas = metas.filter(item => item.id !== id);
    salvarMetas();
    mostrarMetas();

    if (metaEmEdicao === id) cancelarEdicaoMeta();
}

function cancelarEdicaoMeta() {
    metaEmEdicao = null;
    formMeta.reset();
    document.getElementById("botaoMeta").textContent = "Adicionar meta";
    document.getElementById("cancelarEdicaoMeta").hidden = true;
}

if (formMeta && listaMetasMeta) {
    const cancelar = criarBotao("Cancelar edição", cancelarEdicaoMeta);
    cancelar.id = "cancelarEdicaoMeta";
    cancelar.hidden = true;
    formMeta.appendChild(cancelar);

    formMeta.addEventListener("submit", function(event) {
        event.preventDefault();

        const nome = document.getElementById("nomeMeta").value.trim();
        const objetivo = Number(document.getElementById("valorObjetivo").value);
        const guardado = Number(document.getElementById("valorGuardado").value);
        const prazo = document.getElementById("prazoMeta").value;
        const responsavel = document.getElementById("responsavelMeta").value;

        if (!nome || objetivo <= 0 || guardado < 0 || !prazo || !responsavel) {
            alert("Preencha todos os campos corretamente.");
            return;
        }

        const novaMeta = {
            id: metaEmEdicao || Date.now(),
            nome,
            objetivo,
            guardado,
            prazo,
            responsavel
        };

        if (metaEmEdicao) {
            metas = metas.map(item =>
                item.id === metaEmEdicao ? novaMeta : item
            );
        } else {
            metas.push(novaMeta);
        }

        salvarMetas();
        mostrarMetas();
        formMeta.reset();
        metaEmEdicao = null;

        document.getElementById("botaoMeta").textContent = "Adicionar meta";
        document.getElementById("cancelarEdicaoMeta").hidden = true;

        alert("Meta salva com sucesso!");
    });

    mostrarMetas();
}
