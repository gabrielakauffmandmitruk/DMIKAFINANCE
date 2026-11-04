
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

 // ======================================
 // PLANEJAMENTO FINANCEIRO DO DMIKA
 // ======================================

const mesPlanejamento = document.getElementById("mesPlanejamento");
const formRendaPlanejada = document.getElementById("formRendaPlanejada");
const formOrcamento = document.getElementById("formOrcamento");
const listaOrcamento = document.getElementById("listaOrcamento");
const comparativoPlanejamento = document.getElementById("comparativoPlanejamento");

let planejamentos = JSON.parse(
    localStorage.getItem("dmika_planejamentos") || "{}"
);

let categoriaEmEdicao = null;

// Define o mês atual
const agoraPlanejamento = new Date();
const mesAtualPlanejamento =
    agoraPlanejamento.getFullYear() + "-" +
    String(agoraPlanejamento.getMonth() + 1).padStart(2, "0");

if (mesPlanejamento) {
    mesPlanejamento.value = mesAtualPlanejamento;
}

// Retorna os dados do mês selecionado
function obterPlanejamento() {
    const mes = mesPlanejamento.value;

    if (!planejamentos[mes]) {
        planejamentos[mes] = {
            renda: 0,
            categorias: []
        };
    }

    return planejamentos[mes];
}

// Salva tudo no navegador
function salvarPlanejamentos() {
    localStorage.setItem(
        "dmika_planejamentos",
        JSON.stringify(planejamentos)
    );
}

// Atualiza os cartões de resumo
function atualizarResumoPlanejamento() {
    const planejamento = obterPlanejamento();

    const renda = Number(planejamento.renda);

    const totalPlanejado = planejamento.categorias.reduce(
        (soma, item) => soma + Number(item.valor),
        0
    );

    const saldo = renda - totalPlanejado;

    document.getElementById("resumoRenda").textContent =
        formatarMoeda(renda);

    document.getElementById("resumoPlanejado").textContent =
        formatarMoeda(totalPlanejado);

    document.getElementById("resumoSaldo").textContent =
        formatarMoeda(saldo);
}

// Soma as despesas reais por categoria no mês
function obterDespesasReais(categoria) {
    const mes = mesPlanejamento.value;

    return despesas
        .filter(despesa =>
            despesa.categoria === categoria &&
            despesa.data &&
            despesa.data.substring(0, 7) === mes
        )
        .reduce((soma, despesa) => soma + Number(despesa.valor), 0);
}

// Mostra as categorias do orçamento
function mostrarOrcamento() {
    const planejamento = obterPlanejamento();

    listaOrcamento.innerHTML = "";

    if (planejamento.categorias.length === 0) {
        listaOrcamento.textContent =
            "Nenhuma categoria planejada ainda.";

        comparativoPlanejamento.textContent =
            "Nenhum orçamento cadastrado ainda.";

        atualizarResumoPlanejamento();
        return;
    }

    const tabela = document.createElement("div");

    const comparativo = document.createElement("div");

    planejamento.categorias.forEach(item => {
        const linha = document.createElement("div");
        linha.className = "movement";

        const informacoes = document.createElement("div");

        const nome = document.createElement("strong");
        nome.textContent = item.categoria;

        const valor = document.createElement("p");
        valor.textContent =
            "Planejado: " + formatarMoeda(item.valor);

        informacoes.append(nome, valor);

        const botoes = document.createElement("div");

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.textContent = "Editar";

        botaoEditar.addEventListener("click", function() {
            editarCategoriaPlanejada(item.id);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.textContent = "Excluir";

        botaoExcluir.addEventListener("click", function() {
            excluirCategoriaPlanejada(item.id);
        });

        botoes.append(botaoEditar, botaoExcluir);
        linha.append(informacoes, botoes);
        tabela.appendChild(linha);

        // Comparativo entre planejado e realizado
        const realizado = obterDespesasReais(item.categoria);
        const planejado = Number(item.valor);
        const diferenca = planejado - realizado;

        const linhaComparativo = document.createElement("div");
        linhaComparativo.className = "movement";

        const textoComparativo = document.createElement("div");

        const titulo = document.createElement("strong");
        titulo.textContent = item.categoria;

        const detalhe = document.createElement("p");
        detalhe.textContent =
            "Planejado: " + formatarMoeda(planejado) +
            " | Realizado: " + formatarMoeda(realizado);

        const resultado = document.createElement("p");
        resultado.textContent = diferenca >= 0
            ? "Ainda disponível: " + formatarMoeda(diferenca)
            : "Acima do orçamento: " + formatarMoeda(Math.abs(diferenca));

        textoComparativo.append(titulo, detalhe, resultado);
        linhaComparativo.appendChild(textoComparativo);
        comparativo.appendChild(linhaComparativo);
    });

    listaOrcamento.appendChild(tabela);
    comparativoPlanejamento.innerHTML = "";
    comparativoPlanejamento.appendChild(comparativo);

    atualizarResumoPlanejamento();
}

// Cadastra ou edita a renda prevista
if (formRendaPlanejada) {
    formRendaPlanejada.addEventListener("submit", function(event) {
        event.preventDefault();

        const renda = Number(
            document.getElementById("rendaPrevista").value
        );

        if (renda < 0) {
            alert("Informe uma renda válida.");
            return;
        }

        const planejamento = obterPlanejamento();

        planejamento.renda = renda;

        salvarPlanejamentos();
        mostrarOrcamento();

        formRendaPlanejada.reset();

        alert("Renda prevista salva com sucesso!");
    });
}

// Cadastra uma categoria no orçamento
if (formOrcamento) {
    formOrcamento.addEventListener("submit", function(event) {
        event.preventDefault();

        const categoria =
            document.getElementById("categoriaOrcamento").value;

        const valor = Number(
            document.getElementById("valorOrcamento").value
        );

        if (!categoria || valor < 0) {
            alert("Preencha os campos corretamente.");
            return;
        }

        const planejamento = obterPlanejamento();

        const categoriaExistente = planejamento.categorias.find(item =>
            item.categoria === categoria &&
            item.id !== categoriaEmEdicao
        );

        if (categoriaExistente) {
            alert("Essa categoria já existe neste mês. Edite o valor existente.");
            return;
        }

        const novaCategoria = {
            id: categoriaEmEdicao || Date.now(),
            categoria,
            valor
        };

        if (categoriaEmEdicao) {
            planejamento.categorias = planejamento.categorias.map(item =>
                item.id === categoriaEmEdicao ? novaCategoria : item
            );
        } else {
            planejamento.categorias.push(novaCategoria);
        }

        salvarPlanejamentos();

        categoriaEmEdicao = null;
        formOrcamento.reset();

        formOrcamento.querySelector('button[type="submit"]').textContent =
            "Adicionar ao orçamento";

        mostrarOrcamento();

        alert("Categoria salva no orçamento!");
    });
}

// Edita uma categoria
function editarCategoriaPlanejada(id) {
    const planejamento = obterPlanejamento();

    const item = planejamento.categorias.find(item => item.id === id);

    if (!item) return;

    categoriaEmEdicao = id;

    document.getElementById("categoriaOrcamento").value = item.categoria;
    document.getElementById("valorOrcamento").value = item.valor;

    formOrcamento.querySelector('button[type="submit"]').textContent =
        "Salvar alterações";

    formOrcamento.scrollIntoView({ behavior: "smooth" });
}

// Exclui uma categoria
function excluirCategoriaPlanejada(id) {
    if (!confirm("Deseja excluir esta categoria do orçamento?")) return;

    const planejamento = obterPlanejamento();

    planejamento.categorias = planejamento.categorias.filter(
        item => item.id !== id
    );

    salvarPlanejamentos();

    if (categoriaEmEdicao === id) {
        categoriaEmEdicao = null;
        formOrcamento.reset();

        formOrcamento.querySelector('button[type="submit"]').textContent =
            "Adicionar ao orçamento";
    }

    mostrarOrcamento();
}

// Atualiza a página quando o mês muda
if (mesPlanejamento) {
    mesPlanejamento.addEventListener("change", function() {
        categoriaEmEdicao = null;

        if (formOrcamento) {
            formOrcamento.reset();
            formOrcamento.querySelector('button[type="submit"]').textContent =
                "Adicionar ao orçamento";
        }

        const planejamento = obterPlanejamento();

        document.getElementById("rendaPrevista").value =
            planejamento.renda || "";

        mostrarOrcamento();
    });
}

// Inicializa a página
if (
    mesPlanejamento &&
    formRendaPlanejada &&
    formOrcamento &&
    listaOrcamento &&
    comparativoPlanejamento
) {
    const planejamento = obterPlanejamento();

    document.getElementById("rendaPrevista").value =
        planejamento.renda || "";

    mostrarOrcamento();
}

