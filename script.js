
/* ==========================================
   DMIKA - SISTEMA FINANCEIRO
   RECEITAS, DESPESAS, METAS E PLANEJAMENTO
========================================== */

/* ==========================================
   1. FUNÇÕES GERAIS
========================================== */

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function carregarDados(chave) {
    try {
        return JSON.parse(localStorage.getItem(chave)) || [];
    } catch (erro) {
        return [];
    }
}

function salvarDados(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

function criarBotao(texto, classe, acao) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.textContent = texto;
    botao.className = classe || "";

    botao.addEventListener("click", acao);

    return botao;
}

function obterValor(id) {
    const campo = document.getElementById(id);
    return campo ? campo.value : "";
}

/* ==========================================
   2. RECEITAS
========================================== */

let receitas = carregarDados("dmika_receitas");
let receitaEmEdicao = null;

const formReceita = document.getElementById("formReceita");
const listaReceitas = document.getElementById("listaReceitas");

function atualizarReceitas() {
    const total = receitas.reduce(
        (soma, item) => soma + Number(item.valor), 0
    );

    const fixas = receitas
        .filter(item => item.tipo === "Fixa")
        .reduce((soma, item) => soma + Number(item.valor), 0);

    const variaveis = receitas
        .filter(item => item.tipo === "Variável")
        .reduce((soma, item) => soma + Number(item.valor), 0);

    const totalElemento = document.getElementById("totalReceitas");
    const fixasElemento = document.getElementById("totalFixas");
    const variaveisElemento = document.getElementById("totalVariaveis");

    if (totalElemento) totalElemento.textContent = formatarMoeda(total);
    if (fixasElemento) fixasElemento.textContent = formatarMoeda(fixas);
    if (variaveisElemento) variaveisElemento.textContent = formatarMoeda(variaveis);

    mostrarReceitas();
}

function mostrarReceitas() {
    if (!listaReceitas) return;

    listaReceitas.innerHTML = "";

    if (receitas.length === 0) {
        listaReceitas.textContent = "Nenhuma receita cadastrada.";
        return;
    }

    receitas.forEach(item => {
        const linha = document.createElement("div");
        linha.className = "movement";

        const info = document.createElement("div");

        const titulo = document.createElement("strong");
        titulo.textContent = item.descricao;

        const detalhe = document.createElement("p");
        detalhe.textContent =
            item.categoria + " | " +
            item.tipo + " | " +
            (item.responsavel || "Não informado");

        const valor = document.createElement("p");
        valor.textContent = formatarMoeda(item.valor);
        valor.className = "positive";

        info.append(titulo, detalhe, valor);

        const botoes = document.createElement("div");

        botoes.append(
            criarBotao("Editar", "", () => editarReceita(item.id)),
            criarBotao("Excluir", "", () => excluirReceita(item.id))
        );

        linha.append(info, botoes);
        listaReceitas.appendChild(linha);
    });
}

if (formReceita) {
    formReceita.addEventListener("submit", function(event) {
        event.preventDefault();

        const receita = {
            id: receitaEmEdicao || Date.now(),
            descricao: obterValor("descricao"),
            valor: Number(obterValor("valor")),
            categoria: obterValor("categoria"),
            tipo: obterValor("tipo"),
            data: obterValor("data"),
            responsavel: obterValor("responsavel")
        };

        if (
            !receita.descricao ||
            !receita.valor ||
            receita.valor <= 0
        ) {
            alert("Preencha os campos corretamente.");
            return;
        }

        if (receitaEmEdicao) {
            receitas = receitas.map(item =>
                item.id === receitaEmEdicao ? receita : item
            );
        } else {
            receitas.push(receita);
        }

        salvarDados("dmika_receitas", receitas);

        receitaEmEdicao = null;
        formReceita.reset();

        const botao = formReceita.querySelector('button[type="submit"]');
        if (botao) botao.textContent = "Cadastrar receita";

        atualizarReceitas();

        alert("Receita salva com sucesso!");
    });
}

function editarReceita(id) {
    const item = receitas.find(receita => receita.id === id);
    if (!item) return;

    receitaEmEdicao = id;

    document.getElementById("descricao").value = item.descricao;
    document.getElementById("valor").value = item.valor;
    document.getElementById("categoria").value = item.categoria;
    document.getElementById("tipo").value = item.tipo;
    document.getElementById("data").value = item.data;
    document.getElementById("responsavel").value = item.responsavel;

    const botao = formReceita.querySelector('button[type="submit"]');
    if (botao) botao.textContent = "Salvar alterações";

    formReceita.scrollIntoView({ behavior: "smooth" });
}

function excluirReceita(id) {
    if (!confirm("Deseja excluir esta receita?")) return;

    receitas = receitas.filter(item => item.id !== id);

    salvarDados("dmika_receitas", receitas);
    atualizarReceitas();
}

atualizarReceitas();

/* ==========================================
   3. DESPESAS
========================================== */

let despesas = carregarDados("dmika_despesas");
let despesaEmEdicao = null;

const formDespesa = document.getElementById("formDespesa");
const listaDespesas = document.getElementById("listaDespesas");

function atualizarDespesas() {
    const total = despesas.reduce(
        (soma, item) => soma + Number(item.valor), 0
    );

    const fixas = despesas
        .filter(item => item.tipo === "Fixa")
        .reduce((soma, item) => soma + Number(item.valor), 0);

    const variaveis = despesas
        .filter(item => item.tipo === "Variável")
        .reduce((soma, item) => soma + Number(item.valor), 0);

    const totalElemento = document.getElementById("totalDespesas");
    const fixasElemento = document.getElementById("totalDespesasFixas");
    const variaveisElemento = document.getElementById("totalDespesasVariaveis");

    if (totalElemento) totalElemento.textContent = formatarMoeda(total);
    if (fixasElemento) fixasElemento.textContent = formatarMoeda(fixas);
    if (variaveisElemento) variaveisElemento.textContent = formatarMoeda(variaveis);

    mostrarDespesas();
}

function mostrarDespesas() {
    if (!listaDespesas) return;

    listaDespesas.innerHTML = "";

    if (despesas.length === 0) {
        listaDespesas.textContent = "Nenhuma despesa cadastrada.";
        return;
    }

    despesas.forEach(item => {
        const linha = document.createElement("div");
        linha.className = "movement";

        const info = document.createElement("div");

        const titulo = document.createElement("strong");
        titulo.textContent = item.descricao;

        const detalhe = document.createElement("p");
        detalhe.textContent =
            item.categoria + " | " +
            item.tipo + " | " +
            (item.responsavel || "Não informado");

        const status = document.createElement("p");
        status.textContent =
            "Vencimento: " + (item.data || "Não informado") +
            " | Status: " + item.status;

        const valor = document.createElement("p");
        valor.textContent = formatarMoeda(item.valor);

        info.append(titulo, detalhe, status, valor);

        const botoes = document.createElement("div");

        botoes.append(
            criarBotao("Editar", "", () => editarDespesa(item.id)),
            criarBotao("Excluir", "", () => excluirDespesa(item.id))
        );

        linha.append(info, botoes);
        listaDespesas.appendChild(linha);
    });
}

if (formDespesa) {
    formDespesa.addEventListener("submit", function(event) {
        event.preventDefault();

        const despesa = {
            id: despesaEmEdicao || Date.now(),
            descricao: obterValor("descricaoDespesa"),
            valor: Number(obterValor("valorDespesa")),
            categoria: obterValor("categoriaDespesa"),
            tipo: obterValor("tipoDespesa"),
            data: obterValor("vencimentoDespesa"),
            status: obterValor("statusDespesa"),
            responsavel: obterValor("responsavelDespesa")
        };

        if (
            !despesa.descricao ||
            !despesa.valor ||
            despesa.valor <= 0
        ) {
            alert("Preencha os campos corretamente.");
            return;
        }

        if (despesaEmEdicao) {
            despesas = despesas.map(item =>
                item.id === despesaEmEdicao ? despesa : item
            );
        } else {
            despesas.push(despesa);
        }

        salvarDados("dmika_despesas", despesas);

        despesaEmEdicao = null;
        formDespesa.reset();

        const botao = formDespesa.querySelector('button[type="submit"]');
        if (botao) botao.textContent = "Cadastrar despesa";

        atualizarDespesas();

        alert("Despesa salva com sucesso!");
    });
}

function editarDespesa(id) {
    const item = despesas.find(despesa => despesa.id === id);
    if (!item) return;

    despesaEmEdicao = id;

    document.getElementById("descricaoDespesa").value = item.descricao;
    document.getElementById("valorDespesa").value = item.valor;
    document.getElementById("categoriaDespesa").value = item.categoria;
    document.getElementById("tipoDespesa").value = item.tipo;
    document.getElementById("vencimentoDespesa").value = item.data;
    document.getElementById("statusDespesa").value = item.status;
    document.getElementById("responsavelDespesa").value = item.responsavel;

    const botao = formDespesa.querySelector('button[type="submit"]');
    if (botao) botao.textContent = "Salvar alterações";

    formDespesa.scrollIntoView({ behavior: "smooth" });
}

function excluirDespesa(id) {
    if (!confirm("Deseja excluir esta despesa?")) return;

    despesas = despesas.filter(item => item.id !== id);

    salvarDados("dmika_despesas", despesas);
    atualizarDespesas();

    // Atualiza também o comparativo do planejamento.
    mostrarOrcamento();
}

atualizarDespesas();

/* ==========================================
   4. METAS
========================================== */

let metas = carregarDados("dmika_metas");
let metaEmEdicao = null;

const formMeta = document.getElementById("formMeta");
const listaMetas = document.getElementById("listaMetas");

function atualizarMetas() {
    const total = metas.reduce(
        (soma, item) => soma + Number(item.objetivo), 0
    );

    const guardado = metas.reduce(
        (soma, item) => soma + Number(item.guardado), 0
    );

    const falta = total - guardado;

    const totalElemento = document.getElementById("totalMetas");
    const guardadoElemento = document.getElementById("totalGuardadoMetas");
    const faltaElemento = document.getElementById("totalFaltaMetas");

    if (totalElemento) totalElemento.textContent = formatarMoeda(total);
    if (guardadoElemento) guardadoElemento.textContent = formatarMoeda(guardado);
    if (faltaElemento) faltaElemento.textContent = formatarMoeda(falta);

    mostrarMetas();
}

function mostrarMetas() {
    if (!listaMetas) return;

    listaMetas.innerHTML = "";

    if (metas.length === 0) {
        listaMetas.textContent = "Nenhuma meta cadastrada.";
        return;
    }

    metas.forEach(item => {
        const linha = document.createElement("div");
        linha.className = "movement";

        const info = document.createElement("div");

        const titulo = document.createElement("strong");
        titulo.textContent = item.nome;

        const detalhe = document.createElement("p");
        detalhe.textContent =
            "Responsável: " + item.responsavel +
            " | Prazo: " + (item.prazo || "Não definido");

        const valores = document.createElement("p");
        valores.textContent =
            "Guardado: " + formatarMoeda(item.guardado) +
            " de " + formatarMoeda(item.objetivo);

        const progresso = document.createElement("p");
        const percentual = item.objetivo > 0
            ? Math.min(100, (item.guardado / item.objetivo) * 100)
            : 0;

        progresso.textContent = "Progresso: " + percentual.toFixed(1) + "%";

        info.append(titulo, detalhe, valores, progresso);

        const botoes = document.createElement("div");

        botoes.append(
            criarBotao("Editar", "", () => editarMeta(item.id)),
            criarBotao("Excluir", "", () => excluirMeta(item.id))
        );

        linha.append(info, botoes);
        listaMetas.appendChild(linha);
    });
}

if (formMeta) {
    formMeta.addEventListener("submit", function(event) {
        event.preventDefault();

        const meta = {
            id: metaEmEdicao || Date.now(),
            nome: obterValor("nomeMeta"),
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

        if (metaEmEdicao) {
            metas = metas.map(item =>
                item.id === metaEmEdicao ? meta : item
            );
        } else {
            metas.push(meta);
        }

        salvarDados("dmika_metas", metas);

        metaEmEdicao = null;
        formMeta.reset();

        const botao = document.getElementById("botaoMeta");
        if (botao) botao.textContent = "Cadastrar meta";

        atualizarMetas();

        alert("Meta salva com sucesso!");
    });
}

function editarMeta(id) {
    const item = metas.find(meta => meta.id === id);
    if (!item) return;

    metaEmEdicao = id;

    document.getElementById("nomeMeta").value = item.nome;
    document.getElementById("valorObjetivo").value = item.objetivo;
    document.getElementById("valorGuardado").value = item.guardado;
    document.getElementById("prazoMeta").value = item.prazo;
    document.getElementById("responsavelMeta").value = item.responsavel;

    const botao = document.getElementById("botaoMeta");
    if (botao) botao.textContent = "Salvar alterações";

    formMeta.scrollIntoView({ behavior: "smooth" });
}

function excluirMeta(id) {
    if (!confirm("Deseja excluir esta meta?")) return;

    metas = metas.filter(item => item.id !== id);

    salvarDados("dmika_metas", metas);
    atualizarMetas();
}

atualizarMetas();

/* ==========================================
   5. PLANEJAMENTO FINANCEIRO
========================================== */

const mesPlanejamento = document.getElementById("mesPlanejamento");
const formRendaPlanejada = document.getElementById("formRendaPlanejada");
const formOrcamento = document.getElementById("formOrcamento");
const listaOrcamento = document.getElementById("listaOrcamento");
const comparativoPlanejamento = document.getElementById("comparativoPlanejamento");

let planejamentos = {};

try {
    planejamentos = JSON.parse(
        localStorage.getItem("dmika_planejamentos") || "{}"
    );
} catch (erro) {
    planejamentos = {};
}

let categoriaEmEdicao = null;

const agoraPlanejamento = new Date();

const mesAtualPlanejamento =
    agoraPlanejamento.getFullYear() + "-" +
    String(agoraPlanejamento.getMonth() + 1).padStart(2, "0");

if (mesPlanejamento && !mesPlanejamento.value) {
    mesPlanejamento.value = mesAtualPlanejamento;
}

function obterPlanejamento() {
    if (!mesPlanejamento) return null;

    const mes = mesPlanejamento.value;

    if (!planejamentos[mes]) {
        planejamentos[mes] = {
            renda: 0,
            categorias: []
        };
    }

    return planejamentos[mes];
}

function salvarPlanejamentos() {
    localStorage.setItem(
        "dmika_planejamentos",
        JSON.stringify(planejamentos)
    );
}

function atualizarResumoPlanejamento() {
    const planejamento = obterPlanejamento();
    if (!planejamento) return;

    const renda = Number(planejamento.renda);

    const totalPlanejado = planejamento.categorias.reduce(
        (soma, item) => soma + Number(item.valor), 0
    );

    const saldo = renda - totalPlanejado;

    const resumoRenda = document.getElementById("resumoRenda");
    const resumoPlanejado = document.getElementById("resumoPlanejado");
    const resumoSaldo = document.getElementById("resumoSaldo");

    if (resumoRenda) resumoRenda.textContent = formatarMoeda(renda);
    if (resumoPlanejado) resumoPlanejado.textContent = formatarMoeda(totalPlanejado);
    if (resumoSaldo) resumoSaldo.textContent = formatarMoeda(saldo);
}

function obterDespesasReais(categoria) {
    if (!mesPlanejamento) return 0;

    const mes = mesPlanejamento.value;

    return despesas
        .filter(despesa =>
            despesa.categoria === categoria &&
            despesa.data &&
            despesa.data.substring(0, 7) === mes
        )
        .reduce((soma, despesa) => soma + Number(despesa.valor), 0);
}

function mostrarOrcamento() {
    if (!listaOrcamento || !comparativoPlanejamento || !mesPlanejamento) {
        return;
    }

    const planejamento = obterPlanejamento();

    listaOrcamento.innerHTML = "";
    comparativoPlanejamento.innerHTML = "";

    if (planejamento.categorias.length === 0) {
        listaOrcamento.textContent = "Nenhuma categoria planejada ainda.";
        comparativoPlanejamento.textContent = "Nenhum orçamento cadastrado ainda.";

        atualizarResumoPlanejamento();
        return;
    }

    planejamento.categorias.forEach(item => {
        const linha = document.createElement("div");
        linha.className = "movement";

        const info = document.createElement("div");

        const titulo = document.createElement("strong");
        titulo.textContent = item.categoria;

        const valor = document.createElement("p");
        valor.textContent = "Planejado: " + formatarMoeda(item.valor);

        info.append(titulo, valor);

        const botoes = document.createElement("div");

        botoes.append(
            criarBotao("Editar", "", () => editarCategoriaPlanejada(item.id)),
            criarBotao("Excluir", "", () => excluirCategoriaPlanejada(item.id))
        );

        linha.append(info, botoes);
        listaOrcamento.appendChild(linha);

        // Comparação com as despesas cadastradas.

        const realizado = obterDespesasReais(item.categoria);
        const planejado = Number(item.valor);
        const diferenca = planejado - realizado;

        const linhaComparativo = document.createElement("div");
        linhaComparativo.className = "movement";

        const infoComparativo = document.createElement("div");

        const nome = document.createElement("strong");
        nome.textContent = item.categoria;

        const detalhe = document.createElement("p");
        detalhe.textContent =
            "Planejado: " + formatarMoeda(planejado) +
            " | Realizado: " + formatarMoeda(realizado);

        const resultado = document.createElement("p");

        resultado.textContent = diferenca >= 0
            ? "Ainda disponível: " + formatarMoeda(diferenca)
            : "Acima do orçamento: " + formatarMoeda(Math.abs(diferenca));

        infoComparativo.append(nome, detalhe, resultado);
        linhaComparativo.appendChild(infoComparativo);

        comparativoPlanejamento.appendChild(linhaComparativo);
    });

    atualizarResumoPlanejamento();
}

/* CADASTRO DE RENDA */

if (formRendaPlanejada) {
    formRendaPlanejada.addEventListener("submit", function(event) {
        event.preventDefault();

        const renda = Number(obterValor("rendaPrevista"));

        if (renda < 0 || obterValor("rendaPrevista") === "") {
            alert("Informe uma renda válida.");
            return;
        }

        const planejamento = obterPlanejamento();
        planejamento.renda = renda;

        salvarPlanejamentos();
        mostrarOrcamento();

        // Mantém o valor preenchido após salvar.
        document.getElementById("rendaPrevista").value = renda;

        alert("Renda prevista salva com sucesso!");
    });
}

/* CADASTRO DE CATEGORIA */

if (formOrcamento) {
    formOrcamento.addEventListener("submit", function(event) {
        event.preventDefault();

        const categoria = obterValor("categoriaOrcamento");
        const valor = Number(obterValor("valorOrcamento"));

        if (!categoria || obterValor("valorOrcamento") === "" || valor < 0) {
            alert("Preencha os campos corretamente.");
            return;
        }

        const planejamento = obterPlanejamento();

        const existente = planejamento.categorias.find(item =>
            item.categoria === categoria &&
            item.id !== categoriaEmEdicao
        );

        if (existente) {
            alert("Essa categoria já existe neste mês. Edite o valor existente.");
            return;
        }

        const novaCategoria = {
            id: categoriaEmEdicao || Date.now(),
            categoria: categoria,
            valor: valor
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

        const botao = formOrcamento.querySelector('button[type="submit"]');
        if (botao) botao.textContent = "Adicionar ao orçamento";

        mostrarOrcamento();

        alert("Categoria salva no orçamento!");
    });
}

/* EDITAR CATEGORIA */

function editarCategoriaPlanejada(id) {
    const planejamento = obterPlanejamento();

    const item = planejamento.categorias.find(item => item.id === id);
    if (!item) return;

    categoriaEmEdicao = id;

    document.getElementById("categoriaOrcamento").value = item.categoria;
    document.getElementById("valorOrcamento").value = item.valor;

    const botao = formOrcamento.querySelector('button[type="submit"]');
    if (botao) botao.textContent = "Salvar alterações";

    formOrcamento.scrollIntoView({ behavior: "smooth" });
}

/* EXCLUIR CATEGORIA */

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

        const botao = formOrcamento.querySelector('button[type="submit"]');
        if (botao) botao.textContent = "Adicionar ao orçamento";
    }

    mostrarOrcamento();
}

/* TROCA DE MÊS */

if (mesPlanejamento) {
    mesPlanejamento.addEventListener("change", function() {
        categoriaEmEdicao = null;

        if (formOrcamento) {
            formOrcamento.reset();

            const botao = formOrcamento.querySelector('button[type="submit"]');
            if (botao) botao.textContent = "Adicionar ao orçamento";
        }

        const planejamento = obterPlanejamento();

        const campoRenda = document.getElementById("rendaPrevista");

        if (campoRenda) {
            campoRenda.value = planejamento.renda || "";
        }

        mostrarOrcamento();
    });
}

/* INICIALIZAÇÃO DO PLANEJAMENTO */

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

/* ==========================================
   FIM DO SISTEMA DMIKA
========================================== */
