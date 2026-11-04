
// ==========================================
// DMIKA - SISTEMA DE GESTAO FINANCEIRA
// Receitas, Despesas, Metas e Planejamento
// ==========================================


// ==========================================
// FUNCOES GERAIS
// ==========================================

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

function criarBotao(texto, acao) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = texto;
    botao.addEventListener("click", acao);
    return botao;
}

function criarElemento(tag, texto) {
    const elemento = document.createElement(tag);
    elemento.textContent = texto;
    return elemento;
}


// ==========================================
// RECEITAS
// ==========================================

let receitas = carregarDados("dmika_receitas");
let receitaEmEdicao = null;

const formReceita = document.getElementById("formReceita");

function salvarReceitas() {
    salvarDados("dmika_receitas", receitas);
}

function mostrarReceitas() {
    const lista = document.getElementById("listaReceitas");
    if (!lista) return;

    lista.innerHTML = "";

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

    if (receitas.length === 0) {
        lista.textContent = "Nenhuma receita cadastrada ainda.";
        return;
    }

    receitas.forEach(receita => {
        const item = document.createElement("div");
        item.className = "meaning";

        item.appendChild(criarElemento("h3", receita.descricao));
        item.appendChild(criarElemento("p", "Valor: " + formatarMoeda(receita.valor)));
        item.appendChild(criarElemento("p", "Categoria: " + receita.categoria));
        item.appendChild(criarElemento("p", "Tipo: " + receita.tipo));
        item.appendChild(criarElemento("p", "Data: " + receita.data));
        item.appendChild(criarElemento("p", "Responsável: " + receita.responsavel));

        item.appendChild(criarBotao("Editar", () => editarReceita(receita.id)));
        item.appendChild(criarBotao("Excluir", () => excluirReceita(receita.id)));

        lista.appendChild(item);
    });
}

if (formReceita) {
    formReceita.addEventListener("submit", function(event) {
        event.preventDefault();

        const novaReceita = {
            id: receitaEmEdicao || Date.now(),
            descricao: document.getElementById("descricao").value.trim(),
            valor: Number(document.getElementById("valor").value),
            categoria: document.getElementById("categoria").value,
            tipo: document.getElementById("tipo").value,
            data: document.getElementById("data").value,
            responsavel: document.getElementById("responsavel").value
        };

        if (!novaReceita.descricao || novaReceita.valor <= 0) {
            alert("Preencha os campos corretamente.");
            return;
        }

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

        const botao = formReceita.querySelector('button[type="submit"]');
        if (botao) botao.textContent = "Adicionar receita";

        alert("Receita salva com sucesso!");
    });
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

    const botao = formReceita.querySelector('button[type="submit"]');
    if (botao) botao.textContent = "Salvar alterações";

    formReceita.scrollIntoView({ behavior: "smooth" });
}

function excluirReceita(id) {
    if (!confirm("Deseja realmente excluir esta receita?")) return;

    receitas = receitas.filter(item => item.id !== id);
    salvarReceitas();
    mostrarReceitas();

    if (receitaEmEdicao === id) {
        receitaEmEdicao = null;
        formReceita.reset();
    }
}

mostrarReceitas();


// ==========================================
// DESPESAS
// ==========================================

let despesas = carregarDados("dmika_despesas");
let despesaEmEdicao = null;

const formDespesa = document.getElementById("formDespesa");

function salvarDespesas() {
    salvarDados("dmika_despesas", despesas);
}

function mostrarDespesas() {
    const lista = document.getElementById("listaDespesas");
    if (!lista) return;

    lista.innerHTML = "";

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

    if (despesas.length === 0) {
        lista.textContent = "Nenhuma despesa cadastrada ainda.";
        return;
    }

    despesas.forEach(despesa => {
        const item = document.createElement("div");
        item.className = "meaning";

        item.appendChild(criarElemento("h3", despesa.descricao));
        item.appendChild(criarElemento("p", "Valor: " + formatarMoeda(despesa.valor)));
        item.appendChild(criarElemento("p", "Categoria: " + despesa.categoria));
        item.appendChild(criarElemento("p", "Tipo: " + despesa.tipo));
        item.appendChild(criarElemento("p", "Vencimento: " + (despesa.data || despesa.vencimento || "")));
        item.appendChild(criarElemento("p", "Status: " + despesa.status));
        item.appendChild(criarElemento("p", "Responsável: " + despesa.responsavel));

        item.appendChild(criarBotao("Editar", () => editarDespesa(despesa.id)));
        item.appendChild(criarBotao("Excluir", () => excluirDespesa(despesa.id)));

        lista.appendChild(item);
    });
}

if (formDespesa) {
    formDespesa.addEventListener("submit", function(event) {
        event.preventDefault();

        const dataVencimento = document.getElementById("vencimentoDespesa").value;

        const novaDespesa = {
            id: despesaEmEdicao || Date.now(),
            descricao: document.getElementById("descricaoDespesa").value.trim(),
            valor: Number(document.getElementById("valorDespesa").value),
            categoria: document.getElementById("categoriaDespesa").value,
            tipo: document.getElementById("tipoDespesa").value,
            data: dataVencimento,
            vencimento: dataVencimento,
            status: document.getElementById("statusDespesa").value,
            responsavel: document.getElementById("responsavelDespesa").value
        };

        if (!novaDespesa.descricao || novaDespesa.valor <= 0) {
            alert("Preencha os campos corretamente.");
            return;
        }

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

        const botao = document.getElementById("botaoDespesa");
        if (botao) botao.textContent = "Adicionar despesa";

        alert("Despesa salva com sucesso!");

        atualizarPlanejamentoSeExistir();
    });
}

function editarDespesa(id) {
    const despesa = despesas.find(item => item.id === id);
    if (!despesa) return;

    despesaEmEdicao = id;

    document.getElementById("descricaoDespesa").value = despesa.descricao;
    document.getElementById("valorDespesa").value = despesa.valor;
    document.getElementById("categoriaDespesa").value = despesa.categoria;
    document.getElementById("tipoDespesa").value = despesa.tipo;
    document.getElementById("vencimentoDespesa").value = despesa.data || despesa.vencimento || "";
    document.getElementById("statusDespesa").value = despesa.status;
    document.getElementById("responsavelDespesa").value = despesa.responsavel;

    const botao = document.getElementById("botaoDespesa");
    if (botao) botao.textContent = "Salvar alterações";

    formDespesa.scrollIntoView({ behavior: "smooth" });
}

function excluirDespesa(id) {
    if (!confirm("Deseja realmente excluir esta despesa?")) return;

    despesas = despesas.filter(item => item.id !== id);
    salvarDespesas();
    mostrarDespesas();

    if (despesaEmEdicao === id) {
        despesaEmEdicao = null;
        formDespesa.reset();

        const botao = document.getElementById("botaoDespesa");
        if (botao) botao.textContent = "Adicionar despesa";
    }

    atualizarPlanejamentoSeExistir();
}

mostrarDespesas();


// ==========================================
// METAS
// ==========================================

let metas = carregarDados("dmika_metas");
let metaEmEdicao = null;

const formMeta = document.getElementById("formMeta");

function salvarMetas() {
    salvarDados("dmika_metas", metas);
}

function mostrarMetas() {
    const lista = document.getElementById("listaMetas");
    if (!lista) return;

    lista.innerHTML = "";

    const total = metas.reduce(
        (soma, meta) => soma + Number(meta.objetivo), 0
    );

    const guardado = metas.reduce(
        (soma, meta) => soma + Number(meta.guardado), 0
    );

    const falta = metas.reduce(
        (soma, meta) => soma + Math.max(
            0, Number(meta.objetivo) - Number(meta.guardado)
        ),
        0
    );

    const totalElemento = document.getElementById("totalMetas");
    const guardadoElemento = document.getElementById("totalGuardadoMetas");
    const faltaElemento = document.getElementById("totalFaltaMetas");

    if (totalElemento) totalElemento.textContent = formatarMoeda(total);
    if (guardadoElemento) guardadoElemento.textContent = formatarMoeda(guardado);
    if (faltaElemento) faltaElemento.textContent = formatarMoeda(falta);

    if (metas.length === 0) {
        lista.textContent = "Nenhuma meta cadastrada ainda.";
        return;
    }

    metas.forEach(meta => {
        const item = document.createElement("div");
        item.className = "meaning";

        const objetivo = Number(meta.objetivo);
        const valorGuardado = Number(meta.guardado);
        const percentual = objetivo > 0
            ? Math.min(100, valorGuardado / objetivo * 100)
            : 0;

        item.appendChild(criarElemento("h3", meta.nome));
        item.appendChild(criarElemento("p", "Objetivo: " + formatarMoeda(objetivo)));
        item.appendChild(criarElemento("p", "Guardado: " + formatarMoeda(valorGuardado)));
        item.appendChild(criarElemento(
            "p",
            "Prazo: " + (meta.prazo || "").split("-").reverse().join("/")
        ));
        item.appendChild(criarElemento("p", "Responsável: " + meta.responsavel));

        const barra = document.createElement("div");
        barra.className = "progress";

        const progresso = document.createElement("div");
        progresso.style.width = percentual + "%";
        barra.appendChild(progresso);

        item.appendChild(barra);
        item.appendChild(criarElemento(
            "p",
            percentual.toFixed(1).replace(".", ",") + "% concluído"
        ));

        item.appendChild(criarBotao("Editar", () => editarMeta(meta.id)));
        item.appendChild(criarBotao("Excluir", () => excluirMeta(meta.id)));

        lista.appendChild(item);
    });
}

if (formMeta) {
    formMeta.addEventListener("submit", function(event) {
        event.preventDefault();

        const novaMeta = {
            id: metaEmEdicao || Date.now(),
            nome: document.getElementById("nomeMeta").value.trim(),
            objetivo: Number(document.getElementById("valorObjetivo").value),
            guardado: Number(document.getElementById("valorGuardado").value),
            prazo: document.getElementById("prazoMeta").value,
            responsavel: document.getElementById("responsavelMeta").value
        };

        if (!novaMeta.nome || novaMeta.objetivo <= 0 || novaMeta.guardado < 0) {
            alert("Preencha os campos corretamente.");
            return;
        }

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

        const botao = document.getElementById("botaoMeta");
        if (botao) botao.textContent = "Adicionar meta";

        alert("Meta salva com sucesso!");
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

    const botao = document.getElementById("botaoMeta");
    if (botao) botao.textContent = "Salvar alterações";

    formMeta.scrollIntoView({ behavior: "smooth" });
}

function excluirMeta(id) {
    if (!confirm("Deseja realmente excluir esta meta?")) return;

    metas = metas.filter(item => item.id !== id);
    salvarMetas();
    mostrarMetas();

    if (metaEmEdicao === id) {
        metaEmEdicao = null;
        formMeta.reset();

        const botao = document.getElementById("botaoMeta");
        if (botao) botao.textContent = "Adicionar meta";
    }
}

mostrarMetas();


// ==========================================
// PLANEJAMENTO FINANCEIRO
// ==========================================

let planejamentos = carregarDados("dmika_planejamentos");
let orcamentoEmEdicao = null;

const formRendaPlanejada = document.getElementById("formRendaPlanejada");
const formOrcamento = document.getElementById("formOrcamento");
const seletorMes = document.getElementById("mesPlanejamento");

function obterMesAtual() {
    const agora = new Date();
    return agora.getFullYear() + "-" +
        String(agora.getMonth() + 1).padStart(2, "0");
}

function mesSelecionado() {
    return seletorMes && seletorMes.value
        ? seletorMes.value
        : obterMesAtual();
}

function obterPlanejamento() {
    let planejamento = planejamentos.find(
        item => item.mes === mesSelecionado()
    );

    if (!planejamento) {
        planejamento = {
            mes: mesSelecionado(),
            renda: 0,
            categorias: []
        };

        planejamentos.push(planejamento);
    }

    if (!Array.isArray(planejamento.categorias)) {
        planejamento.categorias = [];
    }

    return planejamento;
}

function salvarPlanejamentos() {
    salvarDados("dmika_planejamentos", planejamentos);
}

function obterDespesasReais(categoria, mes) {
    return despesas
        .filter(despesa => {
            const data = despesa.data || despesa.vencimento || "";

            return despesa.categoria === categoria &&
                data.substring(0, 7) === mes;
        })
        .reduce((soma, despesa) => soma + Number(despesa.valor), 0);
}

function atualizarResumoPlanejamento() {
    const planejamento = obterPlanejamento();

    const renda = Number(planejamento.renda || 0);

    const totalPlanejado = planejamento.categorias.reduce(
        (soma, item) => soma + Number(item.valor), 0
    );

    const saldo = renda - totalPlanejado;

    const rendaElemento = document.getElementById("resumoRenda");
    const planejadoElemento = document.getElementById("resumoPlanejado");
    const saldoElemento = document.getElementById("resumoSaldo");

    if (rendaElemento) rendaElemento.textContent = formatarMoeda(renda);
    if (planejadoElemento) planejadoElemento.textContent = formatarMoeda(totalPlanejado);
    if (saldoElemento) saldoElemento.textContent = formatarMoeda(saldo);

    if (saldoElemento) {
        saldoElemento.style.color = saldo < 0 ? "#ff6b6b" : "";
    }
}

function mostrarOrcamento() {
    const lista = document.getElementById("listaOrcamento");
    const comparativo = document.getElementById("comparativoPlanejamento");

    if (!lista || !comparativo) return;

    const planejamento = obterPlanejamento();
    const mes = mesSelecionado();

    lista.innerHTML = "";
    comparativo.innerHTML = "";

    if (planejamento.categorias.length === 0) {
        lista.textContent = "Nenhuma categoria planejada ainda.";
        comparativo.textContent = "Nenhum orçamento cadastrado ainda.";
    } else {
        planejamento.categorias.forEach(categoria => {
            const item = document.createElement("div");
            item.className = "meaning";

            item.appendChild(criarElemento("h3", categoria.categoria));
            item.appendChild(criarElemento(
                "p",
                "Valor planejado: " + formatarMoeda(categoria.valor)
            ));

            item.appendChild(criarBotao(
                "Editar",
                () => editarOrcamento(categoria.id)
            ));

            item.appendChild(criarBotao(
                "Excluir",
                () => excluirOrcamento(categoria.id)
            ));

            lista.appendChild(item);

            const realizado = obterDespesasReais(categoria.categoria, mes);
            const diferenca = Number(categoria.valor) - realizado;

            const comparacao = document.createElement("div");
            comparacao.className = "meaning";

            comparacao.appendChild(criarElemento("h3", categoria.categoria));
            comparacao.appendChild(criarElemento(
                "p",
                "Planejado: " + formatarMoeda(categoria.valor)
            ));
            comparacao.appendChild(criarElemento(
                "p",
                "Realizado: " + formatarMoeda(realizado)
            ));
            comparacao.appendChild(criarElemento(
                "p",
                diferenca >= 0
                    ? "Ainda disponível: " + formatarMoeda(diferenca)
                    : "Acima do planejado: " + formatarMoeda(Math.abs(diferenca))
            ));

            comparativo.appendChild(comparacao);
        });
    }

    atualizarResumoPlanejamento();
}

if (formRendaPlanejada) {
    formRendaPlanejada.addEventListener("submit", function(event) {
        event.preventDefault();

        const valor = Number(
            document.getElementById("rendaPrevista").value
        );

        if (valor < 0) {
            alert("Informe um valor válido.");
            return;
        }

        const planejamento = obterPlanejamento();
        planejamento.renda = valor;

        salvarPlanejamentos();
        atualizarResumoPlanejamento();

        alert("Renda prevista salva com sucesso!");
    });
}

if (formOrcamento) {
    formOrcamento.addEventListener("submit", function(event) {
        event.preventDefault();

        const categoria = document.getElementById("categoriaOrcamento").value;
        const valor = Number(document.getElementById("valorOrcamento").value);

        if (!categoria || valor <= 0) {
            alert("Selecione uma categoria e informe um valor válido.");
            return;
        }

        const planejamento = obterPlanejamento();

        const novoOrcamento = {
            id: orcamentoEmEdicao || Date.now(),
            categoria: categoria,
            valor: valor
        };

        if (orcamentoEmEdicao) {
            planejamento.categorias = planejamento.categorias.map(item =>
                item.id === orcamentoEmEdicao ? novoOrcamento : item
            );
        } else {
            planejamento.categorias.push(novoOrcamento);
        }

        salvarPlanejamentos();

        formOrcamento.reset();
        orcamentoEmEdicao = null;

        const botao = document.getElementById("botaoOrcamento");
        const cancelar = document.getElementById("cancelarEdicaoOrcamento");

        if (botao) botao.textContent = "Adicionar ao orçamento";
        if (cancelar) cancelar.hidden = true;

        mostrarOrcamento();

        alert("Orçamento salvo com sucesso!");
    });
}

function editarOrcamento(id) {
    const planejamento = obterPlanejamento();

    const categoria = planejamento.categorias.find(
        item => item.id === id
    );

    if (!categoria) return;

    orcamentoEmEdicao = id;

    document.getElementById("categoriaOrcamento").value = categoria.categoria;
    document.getElementById("valorOrcamento").value = categoria.valor;

    const botao = document.getElementById("botaoOrcamento");
    const cancelar = document.getElementById("cancelarEdicaoOrcamento");

    if (botao) botao.textContent = "Salvar alterações";
    if (cancelar) cancelar.hidden = false;

    formOrcamento.scrollIntoView({ behavior: "smooth" });
}

function excluirOrcamento(id) {
    if (!confirm("Deseja realmente excluir este orçamento?")) return;

    const planejamento = obterPlanejamento();

    planejamento.categorias = planejamento.categorias.filter(
        item => item.id !== id
    );

    salvarPlanejamentos();

    if (orcamentoEmEdicao === id) {
        cancelarEdicaoOrcamento();
    }

    mostrarOrcamento();
}

function cancelarEdicaoOrcamento() {
    orcamentoEmEdicao = null;

    if (formOrcamento) formOrcamento.reset();

    const botao = document.getElementById("botaoOrcamento");
    const cancelar = document.getElementById("cancelarEdicaoOrcamento");

    if (botao) botao.textContent = "Adicionar ao orçamento";
    if (cancelar) cancelar.hidden = true;
}

const botaoCancelarOrcamento = document.getElementById(
    "cancelarEdicaoOrcamento"
);

if (botaoCancelarOrcamento) {
    botaoCancelarOrcamento.addEventListener(
        "click",
        cancelarEdicaoOrcamento
    );
}

if (seletorMes) {
    seletorMes.value = obterMesAtual();

    seletorMes.addEventListener("change", function() {
        const planejamento = obterPlanejamento();

        const campoRenda = document.getElementById("rendaPrevista");
        if (campoRenda) campoRenda.value = planejamento.renda || "";

        cancelarEdicaoOrcamento();
        mostrarOrcamento();
    });
}

function atualizarPlanejamentoSeExistir() {
    if (document.getElementById("listaOrcamento")) {
        mostrarOrcamento();
    }
}

if (document.getElementById("listaOrcamento")) {
    const planejamentoInicial = obterPlanejamento();

    const campoRenda = document.getElementById("rendaPrevista");
    if (campoRenda) {
        campoRenda.value = planejamentoInicial.renda || "";
    }

    mostrarOrcamento();
}
