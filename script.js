
/* ==========================================================
   DMIKA — GESTÃO FINANCEIRA INTELIGENTE
   SCRIPT COMPLETO
   Visão geral, Receitas, Despesas, Planejamento,
   Metas, Investimentos e Relatórios.

   IMPORTANTE:
   Este arquivo NÃO apaga nem limpa o localStorage.
========================================================== */

/* ==========================================================
   1. CONFIGURAÇÕES E FUNÇÕES GERAIS
========================================================== */

const CHAVES = {
    receitas: "dmika_receitas",
    despesas: "dmika_despesas",
    metas: "dmika_metas",
    planejamentos: "dmika_planejamentos",
    investimentos: "dmika_investimentos"
};

function obterElemento(id) {
    return document.getElementById(id);
}

function obterValor(id) {
    const campo = obterElemento(id);
    return campo ? campo.value : "";
}

function definirTexto(id, texto) {
    const elemento = obterElemento(id);
    if (elemento) elemento.textContent = texto;
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function carregarDados(chave, padrao = []) {
    try {
        const dados = localStorage.getItem(chave);

        if (dados === null) {
            return padrao;
        }

        const resultado = JSON.parse(dados);

        return resultado ?? padrao;
    } catch (erro) {
        console.error("Erro ao carregar:", chave, erro);
        return padrao;
    }
}

function salvarDados(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
        return true;
    } catch (erro) {
        console.error("Erro ao salvar:", chave, erro);
        alert("Não foi possível salvar os dados.");
        return false;
    }
}

function gerarId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function criarElemento(tag, texto = "", classe = "") {
    const elemento = document.createElement(tag);

    if (texto !== null && texto !== undefined) {
        elemento.textContent = texto;
    }

    if (classe) {
        elemento.className = classe;
    }

    return elemento;
}

function criarBotao(texto, acao) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.textContent = texto;
    botao.addEventListener("click", acao);

    return botao;
}

function obterMesAtual() {
    const agora = new Date();

    return (
        agora.getFullYear() +
        "-" +
        String(agora.getMonth() + 1).padStart(2, "0")
    );
}

/* ==========================================================
   2. CARREGAMENTO DOS DADOS
========================================================== */

let receitas = carregarDados(CHAVES.receitas);
let despesas = carregarDados(CHAVES.despesas);
let metas = carregarDados(CHAVES.metas);
let investimentos = carregarDados(CHAVES.investimentos);
let planejamentos = carregarDados(CHAVES.planejamentos, {});

if (!Array.isArray(receitas)) receitas = [];
if (!Array.isArray(despesas)) despesas = [];
if (!Array.isArray(metas)) metas = [];
if (!Array.isArray(investimentos)) investimentos = [];

if (
    !planejamentos ||
    typeof planejamentos !== "object" ||
    Array.isArray(planejamentos)
) {
    planejamentos = {};
}

/* ==========================================================
   3. RECEITAS
========================================================== */

let receitaEmEdicao = null;

function iniciarReceitas() {
    const formulario = obterElemento("formReceita");

    if (formulario) {
        formulario.addEventListener("submit", salvarReceita);
    }

    atualizarReceitas();
}

function salvarReceita(event) {
    event.preventDefault();

    const receita = {
        id: receitaEmEdicao || gerarId(),
        descricao: obterValor("descricao").trim(),
        valor: Number(obterValor("valor")),
        categoria: obterValor("categoria"),
        tipo: obterValor("tipo"),
        data: obterValor("data"),
        responsavel: obterValor("responsavel")
    };

    if (
        !receita.descricao ||
        !receita.valor ||
        receita.valor <= 0 ||
        !receita.data
    ) {
        alert("Preencha os campos corretamente.");
        return;
    }

    if (receitaEmEdicao !== null) {
        receitas = receitas.map(item =>
            item.id === receitaEmEdicao ? receita : item
        );
    } else {
        receitas.push(receita);
    }

    if (!salvarDados(CHAVES.receitas, receitas)) return;

    receitaEmEdicao = null;

    obterElemento("formReceita").reset();

    const botao = obterElemento("formReceita")
        .querySelector('button[type="submit"]');

    if (botao) botao.textContent = "Adicionar receita";

    atualizarReceitas();
    atualizarDashboard();
    atualizarRelatorios();

    alert("Receita salva com sucesso!");
}

function atualizarReceitas() {
    const total = receitas.reduce(
        (soma, item) => soma + Number(item.valor || 0),
        0
    );

    const fixas = receitas
        .filter(item => item.tipo === "Fixa")
        .reduce((soma, item) => soma + Number(item.valor || 0), 0);

    const variaveis = receitas
        .filter(item => item.tipo === "Variável")
        .reduce((soma, item) => soma + Number(item.valor || 0), 0);

    definirTexto("totalReceitas", formatarMoeda(total));
    definirTexto("totalFixas", formatarMoeda(fixas));
    definirTexto("totalVariaveis", formatarMoeda(variaveis));

    mostrarReceitas();
}

function mostrarReceitas() {
    const lista = obterElemento("listaReceitas");

    if (!lista) return;

    lista.innerHTML = "";

    if (receitas.length === 0) {
        lista.textContent = "Nenhuma receita cadastrada.";
        return;
    }

    receitas.forEach(item => {
        const linha = criarElemento("div", null, "movement");
        const informacoes = criarElemento("div");

        informacoes.appendChild(
            criarElemento("strong", item.descricao)
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                (item.categoria || "") +
                " | " +
                (item.tipo || "") +
                " | " +
                (item.responsavel || "Não informado")
            )
        );

        informacoes.appendChild(
            criarElemento("p", "Data: " + (item.data || "Não informada"))
        );

        informacoes.appendChild(
            criarElemento(
                "strong",
                formatarMoeda(item.valor),
                "positive"
            )
        );

        const botoes = criarElemento("div");

        botoes.append(
            criarBotao("Editar", () => editarReceita(item.id)),
            criarBotao("Excluir", () => excluirReceita(item.id))
        );

        linha.append(informacoes, botoes);
        lista.appendChild(linha);
    });
}

function editarReceita(id) {
    const item = receitas.find(receita => receita.id === id);

    if (!item) return;

    receitaEmEdicao = id;

    obterElemento("descricao").value = item.descricao;
    obterElemento("valor").value = item.valor;
    obterElemento("categoria").value = item.categoria;
    obterElemento("tipo").value = item.tipo;
    obterElemento("data").value = item.data;
    obterElemento("responsavel").value = item.responsavel;

    const botao = obterElemento("formReceita")
        .querySelector('button[type="submit"]');

    if (botao) botao.textContent = "Salvar alterações";

    obterElemento("formReceita").scrollIntoView({
        behavior: "smooth"
    });
}

function excluirReceita(id) {
    if (!confirm("Deseja excluir esta receita?")) return;

    receitas = receitas.filter(item => item.id !== id);

    salvarDados(CHAVES.receitas, receitas);

    atualizarReceitas();
    atualizarDashboard();
    atualizarRelatorios();
}

/* ==========================================================
   4. DESPESAS
========================================================== */

let despesaEmEdicao = null;

function iniciarDespesas() {
    const formulario = obterElemento("formDespesa");

    if (formulario) {
        formulario.addEventListener("submit", salvarDespesa);
    }

    atualizarDespesas();
}

function salvarDespesa(event) {
    event.preventDefault();

    const despesa = {
        id: despesaEmEdicao || gerarId(),
        descricao: obterValor("descricaoDespesa").trim(),
        valor: Number(obterValor("valorDespesa")),
        categoria: obterValor("categoriaDespesa"),
        tipo: obterValor("tipoDespesa"),
        data: obterValor("vencimentoDespesa"),
        vencimento: obterValor("vencimentoDespesa"),
        status: obterValor("statusDespesa"),
        responsavel: obterValor("responsavelDespesa")
    };

    if (
        !despesa.descricao ||
        !despesa.valor ||
        despesa.valor <= 0 ||
        !despesa.data
    ) {
        alert("Preencha os campos corretamente.");
        return;
    }

    if (despesaEmEdicao !== null) {
        despesas = despesas.map(item =>
            item.id === despesaEmEdicao ? despesa : item
        );
    } else {
        despesas.push(despesa);
    }

    if (!salvarDados(CHAVES.despesas, despesas)) return;

    despesaEmEdicao = null;

    obterElemento("formDespesa").reset();

    const botao = obterElemento("botaoDespesa");
    if (botao) botao.textContent = "Adicionar despesa";

    atualizarDespesas();
    atualizarDashboard();
    atualizarRelatorios();
    mostrarOrcamento();

    alert("Despesa salva com sucesso!");
}

function atualizarDespesas() {
    const total = despesas.reduce(
        (soma, item) => soma + Number(item.valor || 0),
        0
    );

    const fixas = despesas
        .filter(item => item.tipo === "Fixa")
        .reduce((soma, item) => soma + Number(item.valor || 0), 0);

    const variaveis = despesas
        .filter(item => item.tipo === "Variável")
        .reduce((soma, item) => soma + Number(item.valor || 0), 0);

    definirTexto("totalDespesas", formatarMoeda(total));
    definirTexto("totalDespesasFixas", formatarMoeda(fixas));
    definirTexto("totalDespesasVariaveis", formatarMoeda(variaveis));

    mostrarDespesas();
}

function mostrarDespesas() {
    const lista = obterElemento("listaDespesas");

    if (!lista) return;

    lista.innerHTML = "";

    if (despesas.length === 0) {
        lista.textContent = "Nenhuma despesa cadastrada.";
        return;
    }

    despesas.forEach(item => {
        const linha = criarElemento("div", null, "movement");
        const informacoes = criarElemento("div");

        informacoes.appendChild(
            criarElemento("strong", item.descricao)
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                (item.categoria || "") +
                " | " +
                (item.tipo || "") +
                " | " +
                (item.responsavel || "Não informado")
            )
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                "Vencimento: " +
                (item.data || item.vencimento || "Não informado") +
                " | Status: " +
                (item.status || "Não informado")
            )
        );

        informacoes.appendChild(
            criarElemento("strong", formatarMoeda(item.valor))
        );

        const botoes = criarElemento("div");

        botoes.append(
            criarBotao("Editar", () => editarDespesa(item.id)),
            criarBotao("Excluir", () => excluirDespesa(item.id))
        );

        linha.append(informacoes, botoes);
        lista.appendChild(linha);
    });
}

function editarDespesa(id) {
    const item = despesas.find(despesa => despesa.id === id);

    if (!item) return;

    despesaEmEdicao = id;

    obterElemento("descricaoDespesa").value = item.descricao;
    obterElemento("valorDespesa").value = item.valor;
    obterElemento("categoriaDespesa").value = item.categoria;
    obterElemento("tipoDespesa").value = item.tipo;
    obterElemento("vencimentoDespesa").value =
        item.data || item.vencimento || "";
    obterElemento("statusDespesa").value = item.status;
    obterElemento("responsavelDespesa").value = item.responsavel;

    const botao = obterElemento("botaoDespesa");

    if (botao) botao.textContent = "Salvar alterações";

    obterElemento("formDespesa").scrollIntoView({
        behavior: "smooth"
    });
}

function excluirDespesa(id) {
    if (!confirm("Deseja excluir esta despesa?")) return;

    despesas = despesas.filter(item => item.id !== id);

    salvarDados(CHAVES.despesas, despesas);

    atualizarDespesas();
    atualizarDashboard();
    atualizarRelatorios();
    mostrarOrcamento();
}

/* ==========================================================
   5. METAS
========================================================== */

let metaEmEdicao = null;

function iniciarMetas() {
    const formulario = obterElemento("formMeta");

    if (formulario) {
        formulario.addEventListener("submit", salvarMeta);
    }

    atualizarMetas();
}

function salvarMeta(event) {
    event.preventDefault();

    const meta = {
        id: metaEmEdicao || gerarId(),
        nome: obterValor("nomeMeta").trim(),
        objetivo: Number(obterValor("valorObjetivo")),
        guardado: Number(obterValor("valorGuardado")),
        prazo: obterValor("prazoMeta"),
        responsavel: obterValor("responsavelMeta")
    };

    if (
        !meta.nome ||
        meta.objetivo <= 0 ||
        meta.guardado < 0
    ) {
        alert("Preencha os campos corretamente.");
        return;
    }

    if (metaEmEdicao !== null) {
        metas = metas.map(item =>
            item.id === metaEmEdicao ? meta : item
        );
    } else {
        metas.push(meta);
    }

    if (!salvarDados(CHAVES.metas, metas)) return;

    metaEmEdicao = null;

    obterElemento("formMeta").reset();

    const botao = obterElemento("botaoMeta");
    if (botao) botao.textContent = "Adicionar meta";

    atualizarMetas();

    alert("Meta salva com sucesso!");
}

function atualizarMetas() {
    const total = metas.reduce(
        (soma, item) => soma + Number(item.objetivo || 0),
        0
    );

    const guardado = metas.reduce(
        (soma, item) => soma + Number(item.guardado || 0),
        0
    );

    definirTexto("totalMetas", formatarMoeda(total));
    definirTexto("totalGuardadoMetas", formatarMoeda(guardado));
    definirTexto("totalFaltaMetas", formatarMoeda(total - guardado));

    mostrarMetas();
}

function mostrarMetas() {
    const lista = obterElemento("listaMetas");

    if (!lista) return;

    lista.innerHTML = "";

    if (metas.length === 0) {
        lista.textContent = "Nenhuma meta cadastrada.";
        return;
    }

    metas.forEach(item => {
        const linha = criarElemento("div", null, "movement");
        const informacoes = criarElemento("div");

        const percentual = item.objetivo > 0
            ? Math.min(
                100,
                Number(item.guardado || 0) /
                Number(item.objetivo) * 100
            )
            : 0;

        informacoes.appendChild(
            criarElemento("strong", item.nome)
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                "Responsável: " + (item.responsavel || "Não informado")
            )
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                "Prazo: " + (item.prazo || "Não definido")
            )
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                "Guardado: " +
                formatarMoeda(item.guardado) +
                " de " +
                formatarMoeda(item.objetivo)
            )
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                "Progresso: " + percentual.toFixed(1) + "%"
            )
        );

        const botoes = criarElemento("div");

        botoes.append(
            criarBotao("Editar", () => editarMeta(item.id)),
            criarBotao("Excluir", () => excluirMeta(item.id))
        );

        linha.append(informacoes, botoes);
        lista.appendChild(linha);
    });
}

function editarMeta(id) {
    const item = metas.find(meta => meta.id === id);

    if (!item) return;

    metaEmEdicao = id;

    obterElemento("nomeMeta").value = item.nome;
    obterElemento("valorObjetivo").value = item.objetivo;
    obterElemento("valorGuardado").value = item.guardado;
    obterElemento("prazoMeta").value = item.prazo;
    obterElemento("responsavelMeta").value = item.responsavel;

    const botao = obterElemento("botaoMeta");
    if (botao) botao.textContent = "Salvar alterações";

    obterElemento("formMeta").scrollIntoView({
        behavior: "smooth"
    });
}

function excluirMeta(id) {
    if (!confirm("Deseja excluir esta meta?")) return;

    metas = metas.filter(item => item.id !== id);

    salvarDados(CHAVES.metas, metas);

    atualizarMetas();
}

/* ==========================================================
   6. PLANEJAMENTO FINANCEIRO
========================================================== */

let categoriaEmEdicao = null;

function obterPlanejamento() {
    const campoMes = obterElemento("mesPlanejamento");

    if (!campoMes) return null;

    const mes = campoMes.value;

    if (!mes) return null;

    if (!planejamentos[mes]) {
        planejamentos[mes] = {
            renda: 0,
            categorias: []
        };
    }

    if (!Array.isArray(planejamentos[mes].categorias)) {
        planejamentos[mes].categorias = [];
    }

    return planejamentos[mes];
}

function salvarPlanejamentos() {
    return salvarDados(CHAVES.planejamentos, planejamentos);
}

function iniciarPlanejamento() {
    const campoMes = obterElemento("mesPlanejamento");
    const formularioRenda = obterElemento("formRendaPlanejada");
    const formularioOrcamento = obterElemento("formOrcamento");

    if (campoMes && !campoMes.value) {
        campoMes.value = obterMesAtual();
    }

    if (formularioRenda) {
        formularioRenda.addEventListener("submit", salvarRendaPlanejada);
    }

    if (formularioOrcamento) {
        formularioOrcamento.addEventListener("submit", salvarCategoriaPlanejada);
    }

    if (campoMes) {
        campoMes.addEventListener("change", trocarMesPlanejamento);
    }

    trocarMesPlanejamento();
}

function salvarRendaPlanejada(event) {
    event.preventDefault();

    const valor = Number(obterValor("rendaPrevista"));

    if (
        obterValor("rendaPrevista") === "" ||
        valor < 0
    ) {
        alert("Informe uma renda válida.");
        return;
    }

    const planejamento = obterPlanejamento();

    if (!planejamento) return;

    planejamento.renda = valor;

    salvarPlanejamentos();
    mostrarOrcamento();
    atualizarDashboard();

    alert("Renda prevista salva com sucesso!");
}

function salvarCategoriaPlanejada(event) {
    event.preventDefault();

    const categoria = obterValor("categoriaOrcamento");
    const valor = Number(obterValor("valorOrcamento"));

    if (
        !categoria ||
        obterValor("valorOrcamento") === "" ||
        valor < 0
    ) {
        alert("Preencha os campos corretamente.");
        return;
    }

    const planejamento = obterPlanejamento();

    if (!planejamento) return;

    const existente = planejamento.categorias.find(item =>
        item.categoria === categoria &&
        item.id !== categoriaEmEdicao
    );

    if (existente) {
        alert("Essa categoria já existe neste mês. Edite o valor existente.");
        return;
    }

    const novaCategoria = {
        id: categoriaEmEdicao || gerarId(),
        categoria: categoria,
        valor: valor
    };

    if (categoriaEmEdicao !== null) {
        planejamento.categorias = planejamento.categorias.map(item =>
            item.id === categoriaEmEdicao ? novaCategoria : item
        );
    } else {
        planejamento.categorias.push(novaCategoria);
    }

    if (!salvarPlanejamentos()) return;

    categoriaEmEdicao = null;

    obterElemento("formOrcamento").reset();

    const botao = obterElemento("formOrcamento")
        .querySelector('button[type="submit"]');

    if (botao) botao.textContent = "Adicionar ao orçamento";

    mostrarOrcamento();
    atualizarDashboard();

    alert("Categoria salva no orçamento!");
}

function obterDespesasReais(categoria) {
    const campoMes = obterElemento("mesPlanejamento");

    if (!campoMes) return 0;

    const mes = campoMes.value;

    return despesas
        .filter(item =>
            item.categoria === categoria &&
            String(item.data || item.vencimento || "").startsWith(mes)
        )
        .reduce((soma, item) => soma + Number(item.valor || 0), 0);
}

function atualizarResumoPlanejamento() {
    const planejamento = obterPlanejamento();

    if (!planejamento) return;

    const renda = Number(planejamento.renda || 0);

    const totalPlanejado = planejamento.categorias.reduce(
        (soma, item) => soma + Number(item.valor || 0),
        0
    );

    definirTexto("resumoRenda", formatarMoeda(renda));
    definirTexto("resumoPlanejado", formatarMoeda(totalPlanejado));
    definirTexto("resumoSaldo", formatarMoeda(renda - totalPlanejado));
}

function mostrarOrcamento() {
    const lista = obterElemento("listaOrcamento");
    const comparativo = obterElemento("comparativoPlanejamento");

    if (!lista || !comparativo) return;

    const planejamento = obterPlanejamento();

    if (!planejamento) return;

    lista.innerHTML = "";
    comparativo.innerHTML = "";

    if (planejamento.categorias.length === 0) {
        lista.textContent = "Nenhuma categoria planejada ainda.";
        comparativo.textContent = "Nenhum orçamento cadastrado ainda.";

        atualizarResumoPlanejamento();
        return;
    }

    planejamento.categorias.forEach(item => {
        const linha = criarElemento("div", null, "movement");
        const informacoes = criarElemento("div");

        informacoes.appendChild(
            criarElemento("strong", item.categoria)
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                "Planejado: " + formatarMoeda(item.valor)
            )
        );

        const botoes = criarElemento("div");

        botoes.append(
            criarBotao(
                "Editar",
                () => editarCategoriaPlanejada(item.id)
            ),
            criarBotao(
                "Excluir",
                () => excluirCategoriaPlanejada(item.id)
            )
        );

        linha.append(informacoes, botoes);
        lista.appendChild(linha);

        const realizado = obterDespesasReais(item.categoria);
        const diferenca = Number(item.valor) - realizado;

        const linhaComparativo = criarElemento("div", null, "movement");
        const infoComparativo = criarElemento("div");

        infoComparativo.appendChild(
            criarElemento("strong", item.categoria)
        );

        infoComparativo.appendChild(
            criarElemento(
                "p",
                "Planejado: " +
                formatarMoeda(item.valor) +
                " | Realizado: " +
                formatarMoeda(realizado)
            )
        );

        infoComparativo.appendChild(
            criarElemento(
                "p",
                diferenca >= 0
                    ? "Ainda disponível: " + formatarMoeda(diferenca)
                    : "Acima do orçamento: " + formatarMoeda(Math.abs(diferenca))
            )
        );

        linhaComparativo.appendChild(infoComparativo);
        comparativo.appendChild(linhaComparativo);
    });

    atualizarResumoPlanejamento();
}

function editarCategoriaPlanejada(id) {
    const planejamento = obterPlanejamento();

    if (!planejamento) return;

    const item = planejamento.categorias.find(
        categoria => categoria.id === id
    );

    if (!item) return;

    categoriaEmEdicao = id;

    obterElemento("categoriaOrcamento").value = item.categoria;
    obterElemento("valorOrcamento").value = item.valor;

    const botao = obterElemento("formOrcamento")
        .querySelector('button[type="submit"]');

    if (botao) botao.textContent = "Salvar alterações";

    obterElemento("formOrcamento").scrollIntoView({
        behavior: "smooth"
    });
}

function excluirCategoriaPlanejada(id) {
    if (!confirm("Deseja excluir esta categoria do orçamento?")) return;

    const planejamento = obterPlanejamento();

    if (!planejamento) return;

    planejamento.categorias = planejamento.categorias.filter(
        item => item.id !== id
    );

    if (!salvarPlanejamentos()) return;

    if (categoriaEmEdicao === id) {
        categoriaEmEdicao = null;

        const formulario = obterElemento("formOrcamento");

        if (formulario) formulario.reset();

        const botao = formulario?.querySelector('button[type="submit"]');

        if (botao) botao.textContent = "Adicionar ao orçamento";
    }

    mostrarOrcamento();
    atualizarDashboard();
}

function trocarMesPlanejamento() {
    const planejamento = obterPlanejamento();

    if (!planejamento) return;

    categoriaEmEdicao = null;

    const formulario = obterElemento("formOrcamento");

    if (formulario) {
        formulario.reset();

        const botao = formulario.querySelector('button[type="submit"]');

        if (botao) botao.textContent = "Adicionar ao orçamento";
    }

    const campoRenda = obterElemento("rendaPrevista");

    if (campoRenda) {
        campoRenda.value = planejamento.renda || "";
    }

    mostrarOrcamento();
    atualizarDashboard();
}

/* ==========================================================
   7. INVESTIMENTOS
========================================================== */

let investimentoEmEdicao = null;

function iniciarInvestimentos() {
    const formulario = obterElemento("formInvestimento");

    if (formulario) {
        formulario.addEventListener("submit", salvarInvestimento);
    }

    const cancelar = obterElemento("cancelarEdicaoInvestimento");

    if (cancelar) {
        cancelar.addEventListener("click", cancelarEdicaoInvestimento);
    }

    atualizarInvestimentos();
}

function salvarInvestimento(event) {
    event.preventDefault();

    const investimento = {
        id: investimentoEmEdicao || gerarId(),
        nome: obterValor("nomeInvestimento").trim(),
        instituicao: obterValor("instituicaoInvestimento").trim(),
        tipo: obterValor("tipoInvestimento"),
        valorAplicado: Number(obterValor("valorAplicado")),
        rendimento: Number(obterValor("rendimentoAplicado")),
        data: obterValor("dataInvestimento"),
        responsavel: obterValor("responsavelInvestimento")
    };

    if (
        !investimento.nome ||
        !investimento.instituicao ||
        !investimento.tipo ||
        investimento.valorAplicado <= 0 ||
        !investimento.data
    ) {
        alert("Preencha os campos corretamente.");
        return;
    }

    if (investimentoEmEdicao !== null) {
        investimentos = investimentos.map(item =>
            item.id === investimentoEmEdicao ? investimento : item
        );
    } else {
        investimentos.push(investimento);
    }

    if (!salvarDados(CHAVES.investimentos, investimentos)) return;

    cancelarEdicaoInvestimento();
    atualizarInvestimentos();
    atualizarRelatorios();

    alert("Investimento salvo com sucesso!");
}

function atualizarInvestimentos() {
    const totalAplicado = investimentos.reduce(
        (soma, item) => soma + Number(item.valorAplicado || 0),
        0
    );

    const rendimento = investimentos.reduce(
        (soma, item) => soma + Number(item.rendimento || 0),
        0
    );

    definirTexto("totalInvestido", formatarMoeda(totalAplicado));
    definirTexto("rendimentoInvestimentos", formatarMoeda(rendimento));
    definirTexto(
        "patrimonioInvestimentos",
        formatarMoeda(totalAplicado + rendimento)
    );

    mostrarInvestimentos();
}

function mostrarInvestimentos() {
    const lista = obterElemento("listaInvestimentos");

    if (!lista) return;

    lista.innerHTML = "";

    if (investimentos.length === 0) {
        lista.textContent = "Nenhum investimento cadastrado.";
        return;
    }

    investimentos.forEach(item => {
        const linha = criarElemento("div", null, "movement");
        const informacoes = criarElemento("div");

        informacoes.appendChild(
            criarElemento("strong", item.nome)
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                (item.tipo || "") +
                " | " +
                (item.instituicao || "")
            )
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                "Responsável: " + (item.responsavel || "Não informado")
            )
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                "Aplicado: " + formatarMoeda(item.valorAplicado)
            )
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                "Rendimento: " + formatarMoeda(item.rendimento)
            )
        );

        informacoes.appendChild(
            criarElemento(
                "strong",
                "Patrimônio: " +
                formatarMoeda(
                    Number(item.valorAplicado || 0) +
                    Number(item.rendimento || 0)
                )
            )
        );

        const botoes = criarElemento("div");

        botoes.append(
            criarBotao("Editar", () => editarInvestimento(item.id)),
            criarBotao("Excluir", () => excluirInvestimento(item.id))
        );

        linha.append(informacoes, botoes);
        lista.appendChild(linha);
    });
}

function editarInvestimento(id) {
    const item = investimentos.find(
        investimento => investimento.id === id
    );

    if (!item) return;

    investimentoEmEdicao = id;

    obterElemento("nomeInvestimento").value = item.nome;
    obterElemento("instituicaoInvestimento").value = item.instituicao;
    obterElemento("tipoInvestimento").value = item.tipo;
    obterElemento("valorAplicado").value = item.valorAplicado;
    obterElemento("rendimentoAplicado").value = item.rendimento;
    obterElemento("dataInvestimento").value = item.data;
    obterElemento("responsavelInvestimento").value = item.responsavel;

    const botao = obterElemento("botaoInvestimento");
    const cancelar = obterElemento("cancelarEdicaoInvestimento");

    if (botao) botao.textContent = "Salvar alterações";
    if (cancelar) cancelar.style.display = "inline-block";

    obterElemento("formInvestimento").scrollIntoView({
        behavior: "smooth"
    });
}

function cancelarEdicaoInvestimento() {
    investimentoEmEdicao = null;

    const formulario = obterElemento("formInvestimento");

    if (formulario) formulario.reset();

    const botao = obterElemento("botaoInvestimento");
    const cancelar = obterElemento("cancelarEdicaoInvestimento");

    if (botao) botao.textContent = "Adicionar investimento";
    if (cancelar) cancelar.style.display = "none";
}

function excluirInvestimento(id) {
    if (!confirm("Deseja excluir este investimento?")) return;

    investimentos = investimentos.filter(item => item.id !== id);

    salvarDados(CHAVES.investimentos, investimentos);

    atualizarInvestimentos();
    atualizarRelatorios();
}

/* ==========================================================
   8. VISÃO GERAL / DASHBOARD
========================================================== */

function iniciarDashboard() {
    const campoMes = obterElemento("mesDashboard");

    if (campoMes && !campoMes.value) {
        campoMes.value = obterMesAtual();
    }

    if (campoMes) {
        campoMes.addEventListener("change", atualizarDashboard);
    }

    atualizarDashboard();
}

function atualizarDashboard() {
    const campoMes = obterElemento("mesDashboard");

    if (!campoMes) return;

    const mes = campoMes.value || obterMesAtual();

    const receitasMes = receitas.filter(item =>
        String(item.data || "").startsWith(mes)
    );

    const despesasMes = despesas.filter(item =>
        String(item.data || item.vencimento || "").startsWith(mes)
    );

    const totalReceitas = receitasMes.reduce(
        (soma, item) => soma + Number(item.valor || 0),
        0
    );

    const totalDespesas = despesasMes.reduce(
        (soma, item) => soma + Number(item.valor || 0),
        0
    );

    const saldo = totalReceitas - totalDespesas;

    definirTexto("receitasDashboard", formatarMoeda(totalReceitas));
    definirTexto("despesasDashboard", formatarMoeda(totalDespesas));
    definirTexto("saldoDashboard", formatarMoeda(saldo));

    const percentual = totalReceitas > 0
        ? Math.min(100, (totalDespesas / totalReceitas) * 100)
        : 0;

    const barra = obterElemento("barraDashboard");

    if (barra) {
        barra.style.width = percentual + "%";
    }

    definirTexto(
        "resumoPercentualDashboard",
        percentual.toFixed(1) + "% da renda utilizada"
    );

    atualizarResumoPlanejamentoDashboard(mes);
    atualizarMovimentacoesDashboard(receitasMes, despesasMes);
}

function atualizarResumoPlanejamentoDashboard(mes) {
    const planejamento = planejamentos[mes] || {
        renda: 0,
        categorias: []
    };

    const renda = Number(planejamento.renda || 0);

    const orcamento = (planejamento.categorias || []).reduce(
        (soma, item) => soma + Number(item.valor || 0),
        0
    );

    definirTexto("rendaDashboard", formatarMoeda(renda));
    definirTexto("orcamentoDashboard", formatarMoeda(orcamento));
    definirTexto(
        "saldoPrevistoDashboard",
        formatarMoeda(renda - orcamento)
    );
}

function atualizarMovimentacoesDashboard(receitasMes, despesasMes) {
    const lista = obterElemento("movimentacoesDashboard");

    if (!lista) return;

    lista.innerHTML = "";

    const movimentacoes = [
        ...receitasMes.map(item => ({
            descricao: item.descricao,
            valor: Number(item.valor || 0),
            data: item.data,
            tipo: "receita"
        })),

        ...despesasMes.map(item => ({
            descricao: item.descricao,
            valor: Number(item.valor || 0),
            data: item.data || item.vencimento,
            tipo: "despesa"
        }))
    ];

    movimentacoes.sort((a, b) =>
        String(b.data || "").localeCompare(String(a.data || ""))
    );

    if (movimentacoes.length === 0) {
        lista.textContent = "Nenhuma movimentação neste mês.";
        return;
    }

    movimentacoes.slice(0, 10).forEach(item => {
        const linha = criarElemento("div", null, "movement");

        const nome = criarElemento(
            "span",
            item.descricao + " | " + (item.data || "")
        );

        const valor = criarElemento(
            "strong",
            (item.tipo === "receita" ? "+ " : "- ") +
            formatarMoeda(item.valor),
            item.tipo === "receita" ? "positive" : ""
        );

        linha.append(nome, valor);
        lista.appendChild(linha);
    });
}

/* ==========================================================
   9. RELATÓRIOS
========================================================== */

function iniciarRelatorios() {
    const seletorAno = obterElemento("anoRelatorio");

    if (seletorAno) {
        seletorAno.addEventListener("change", atualizarRelatorios);
    }

    atualizarRelatorios();
}

function atualizarRelatorios() {
    const seletorAno = obterElemento("anoRelatorio");

    if (!seletorAno) return;

    const ano = seletorAno.value;

    const receitasAno = receitas.filter(item =>
        String(item.data || "").startsWith(ano)
    );

    const despesasAno = despesas.filter(item =>
        String(item.data || item.vencimento || "").startsWith(ano)
    );

    const totalReceitas = receitasAno.reduce(
        (soma, item) => soma + Number(item.valor || 0),
        0
    );

    const totalDespesas = despesasAno.reduce(
        (soma, item) => soma + Number(item.valor || 0),
        0
    );

    definirTexto(
        "totalReceitasRelatorio",
        formatarMoeda(totalReceitas)
    );

    definirTexto(
        "totalDespesasRelatorio",
        formatarMoeda(totalDespesas)
    );

    definirTexto(
        "saldoRelatorio",
        formatarMoeda(totalReceitas - totalDespesas)
    );

    atualizarResumoMensalRelatorio(ano);
    atualizarCategoriasRelatorio(ano);
    atualizarInvestimentosRelatorio();
}

function atualizarResumoMensalRelatorio(ano) {
    const lista = obterElemento("resumoMensalRelatorio");

    if (!lista) return;

    lista.innerHTML = "";

    const nomesMeses = [
        "Janeiro", "Fevereiro", "Março", "Abril",
        "Maio", "Junho", "Julho", "Agosto",
        "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    nomesMeses.forEach((nome, indice) => {
        const mes = String(indice + 1).padStart(2, "0");
        const referencia = ano + "-" + mes;

        const totalReceitas = receitas
            .filter(item => String(item.data || "").startsWith(referencia))
            .reduce((soma, item) => soma + Number(item.valor || 0), 0);

        const totalDespesas = despesas
            .filter(item =>
                String(item.data || item.vencimento || "").startsWith(referencia)
            )
            .reduce((soma, item) => soma + Number(item.valor || 0), 0);

        const linha = criarElemento("div", null, "movement");
        const informacoes = criarElemento("div");

        informacoes.appendChild(criarElemento("strong", nome));

        informacoes.appendChild(
            criarElemento(
                "p",
                "Receitas: " + formatarMoeda(totalReceitas)
            )
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                "Despesas: " + formatarMoeda(totalDespesas)
            )
        );

        informacoes.appendChild(
            criarElemento(
                "strong",
                "Saldo: " + formatarMoeda(totalReceitas - totalDespesas)
            )
        );

        linha.appendChild(informacoes);
        lista.appendChild(linha);
    });
}

function atualizarCategoriasRelatorio(ano) {
    const lista = obterElemento("categoriasRelatorio");

    if (!lista) return;

    lista.innerHTML = "";

    const despesasAno = despesas.filter(item =>
        String(item.data || item.vencimento || "").startsWith(ano)
    );

    const totais = {};

    despesasAno.forEach(item => {
        const categoria = item.categoria || "Sem categoria";

        totais[categoria] =
            (totais[categoria] || 0) + Number(item.valor || 0);
    });

    const categorias = Object.entries(totais)
        .sort((a, b) => b[1] - a[1]);

    if (categorias.length === 0) {
        lista.textContent = "Nenhuma despesa cadastrada neste ano.";
        return;
    }

    categorias.forEach(([categoria, valor]) => {
        const linha = criarElemento("div", null, "movement");

        linha.append(
            criarElemento("span", categoria),
            criarElemento("strong", formatarMoeda(valor))
        );

        lista.appendChild(linha);
    });
}

function atualizarInvestimentosRelatorio() {
    const totalAplicado = investimentos.reduce(
        (soma, item) => soma + Number(item.valorAplicado || 0),
        0
    );

    const rendimento = investimentos.reduce(
        (soma, item) => soma + Number(item.rendimento || 0),
        0
    );

    definirTexto(
        "totalAplicadoRelatorio",
        formatarMoeda(totalAplicado)
    );

    definirTexto(
        "rendimentoRelatorio",
        formatarMoeda(rendimento)
    );

    definirTexto(
        "patrimonioRelatorio",
        formatarMoeda(totalAplicado + rendimento)
    );
}

/* ==========================================================
   10. INICIALIZAÇÃO GERAL
========================================================== */

function iniciarDMIKA() {
    iniciarReceitas();
    iniciarDespesas();
    iniciarMetas();
    iniciarPlanejamento();
    iniciarInvestimentos();
    iniciarDashboard();
    iniciarRelatorios();

    console.log("DMIKA iniciado com sucesso.");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarDMIKA);
} else {
    iniciarDMIKA();
}

/* ==========================================================
   FIM DO SCRIPT DMIKA
========================================================== */
