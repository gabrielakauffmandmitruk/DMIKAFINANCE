// ======================================================
// DMIKA - GESTÃO FINANCEIRA INTELIGENTE
// Receitas, despesas, metas, planejamento,
// investimentos e visão geral.
// ======================================================


// ------------------------------------------------------
// 1. FUNÇÕES GERAIS
// ------------------------------------------------------

const CHAVES = {
    receitas: "dmika_receitas",
    despesas: "dmika_despesas",
    metas: "dmika_metas",
    planejamentos: "dmika_planejamentos",
    investimentos: "dmika_investimentos"
};

function carregarDados(chave, padrao = []) {
    try {
        const dados = localStorage.getItem(chave);
        if (dados === null) return padrao;
        return JSON.parse(dados);
    } catch (erro) {
        console.error("Erro ao carregar " + chave, erro);
        return padrao;
    }
}

function salvarDados(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
        return true;
    } catch (erro) {
        console.error("Erro ao salvar " + chave, erro);
        alert("Não foi possível salvar os dados. Verifique o armazenamento do navegador.");
        return false;
    }
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function gerarId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function obterElemento(id) {
    return document.getElementById(id);
}

function definirTexto(id, texto) {
    const elemento = obterElemento(id);
    if (elemento) elemento.textContent = texto;
}

function criarBotao(texto, classe, funcao) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = texto;

    if (classe) botao.className = classe;

    botao.addEventListener("click", funcao);
    return botao;
}

function criarElemento(tag, texto, classe) {
    const elemento = document.createElement(tag);

    if (texto !== undefined && texto !== null) {
        elemento.textContent = texto;
    }

    if (classe) elemento.className = classe;

    return elemento;
}

function formatarData(data) {
    if (!data) return "-";

    const partes = String(data).split("-");
    if (partes.length !== 3) return data;

    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function mesAtual() {
    const hoje = new Date();

    return hoje.getFullYear() + "-" +
        String(hoje.getMonth() + 1).padStart(2, "0");
}


// ------------------------------------------------------
// 2. RECEITAS
// ------------------------------------------------------

let receitaEmEdicao = null;

function iniciarReceitas() {
    const formulario = obterElemento("formReceita");
    if (!formulario) return;

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const descricao = obterElemento("descricao").value.trim();
        const valor = Number(obterElemento("valor").value);
        const categoria = obterElemento("categoria").value;
        const tipo = obterElemento("tipo").value;
        const data = obterElemento("data").value;
        const responsavel = obterElemento("responsavel").value;

        if (!descricao || valor <= 0 || !data) {
            alert("Preencha os campos corretamente.");
            return;
        }

        const receitas = carregarDados(CHAVES.receitas);

        if (!Array.isArray(receitas)) {
            alert("Não foi possível reconhecer os dados das receitas.");
            return;
        }

        if (receitaEmEdicao !== null) {
            const indice = receitas.findIndex(
                item => item.id === receitaEmEdicao
            );

            if (indice !== -1) {
                receitas[indice] = {
                    ...receitas[indice],
                    descricao,
                    valor,
                    categoria,
                    tipo,
                    data,
                    responsavel
                };
            }

            receitaEmEdicao = null;
        } else {
            receitas.push({
                id: gerarId(),
                descricao,
                valor,
                categoria,
                tipo,
                data,
                responsavel
            });
        }

        if (!salvarDados(CHAVES.receitas, receitas)) return;

        formulario.reset();
        atualizarReceitas();
        atualizarDashboard();
    });

    atualizarReceitas();
}

function atualizarReceitas() {
    const lista = obterElemento("listaReceitas");
    if (!lista) return;

    const receitas = carregarDados(CHAVES.receitas);
    const dados = Array.isArray(receitas) ? receitas : [];

    lista.innerHTML = "";

    if (dados.length === 0) {
        lista.textContent = "Nenhuma receita cadastrada ainda.";
    }

    dados.forEach(receita => {
        const linha = criarElemento("div", null, "item-lista");
        const informacoes = criarElemento("div");

        informacoes.appendChild(criarElemento("strong", receita.descricao));

        informacoes.appendChild(
            criarElemento("p", `${receita.categoria || "Sem categoria"} • ${receita.tipo || ""}`)
        );

        informacoes.appendChild(
            criarElemento("small", `${formatarData(receita.data)} • ${receita.responsavel || ""}`)
        );

        const valor = criarElemento("strong", formatarMoeda(receita.valor));
        const acoes = criarElemento("div", null, "acoes-item");

        acoes.appendChild(
            criarBotao("Editar", "btn-editar", () => editarReceita(receita.id))
        );

        acoes.appendChild(
            criarBotao("Excluir", "btn-excluir", () => excluirReceita(receita.id))
        );

        linha.append(informacoes, valor, acoes);
        lista.appendChild(linha);
    });

    const total = dados.reduce((soma, item) => soma + Number(item.valor || 0), 0);

    const fixas = dados
        .filter(item => item.tipo === "Fixa")
        .reduce((soma, item) => soma + Number(item.valor || 0), 0);

    const variaveis = dados
        .filter(item => item.tipo === "Variável")
        .reduce((soma, item) => soma + Number(item.valor || 0), 0);

    definirTexto("totalReceitas", formatarMoeda(total));
    definirTexto("totalFixas", formatarMoeda(fixas));
    definirTexto("totalVariaveis", formatarMoeda(variaveis));
}

function editarReceita(id) {
    const receitas = carregarDados(CHAVES.receitas);
    const receita = receitas.find(item => item.id === id);
    if (!receita) return;

    obterElemento("descricao").value = receita.descricao || "";
    obterElemento("valor").value = receita.valor || "";
    obterElemento("categoria").value = receita.categoria || "";
    obterElemento("tipo").value = receita.tipo || "";
    obterElemento("data").value = receita.data || "";
    obterElemento("responsavel").value = receita.responsavel || "";

    receitaEmEdicao = id;

    obterElemento("formReceita").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function excluirReceita(id) {
    if (!confirm("Deseja realmente excluir esta receita?")) return;

    const receitas = carregarDados(CHAVES.receitas);
    const atualizadas = receitas.filter(item => item.id !== id);

    if (!salvarDados(CHAVES.receitas, atualizadas)) return;

    receitaEmEdicao = null;
    atualizarReceitas();
    atualizarDashboard();
}


// ------------------------------------------------------
// 3. DESPESAS
// ------------------------------------------------------

let despesaEmEdicao = null;

function iniciarDespesas() {
    const formulario = obterElemento("formDespesa");
    if (!formulario) return;

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const descricao = obterElemento("descricaoDespesa").value.trim();
        const valor = Number(obterElemento("valorDespesa").value);
        const categoria = obterElemento("categoriaDespesa").value;
        const tipo = obterElemento("tipoDespesa").value;
        const vencimento = obterElemento("vencimentoDespesa").value;
        const status = obterElemento("statusDespesa").value;
        const responsavel = obterElemento("responsavelDespesa").value;

        if (!descricao || valor <= 0 || !vencimento) {
            alert("Preencha os campos corretamente.");
            return;
        }

        const despesas = carregarDados(CHAVES.despesas);

        if (!Array.isArray(despesas)) {
            alert("Não foi possível reconhecer os dados das despesas.");
            return;
        }

        if (despesaEmEdicao !== null) {
            const indice = despesas.findIndex(
                item => item.id === despesaEmEdicao
            );

            if (indice !== -1) {
                despesas[indice] = {
                    ...despesas[indice],
                    descricao,
                    valor,
                    categoria,
                    tipo,
                    data: vencimento,
                    vencimento,
                    status,
                    responsavel
                };
            }

            despesaEmEdicao = null;
        } else {
            despesas.push({
                id: gerarId(),
                descricao,
                valor,
                categoria,
                tipo,
                data: vencimento,
                vencimento,
                status,
                responsavel
            });
        }

        if (!salvarDados(CHAVES.despesas, despesas)) return;

        formulario.reset();
        atualizarDespesas();
        atualizarDashboard();
        atualizarPlanejamento();
    });

    atualizarDespesas();
}

function atualizarDespesas() {
    const lista = obterElemento("listaDespesas");
    if (!lista) return;

    const despesas = carregarDados(CHAVES.despesas);
    const dados = Array.isArray(despesas) ? despesas : [];

    lista.innerHTML = "";

    if (dados.length === 0) {
        lista.textContent = "Nenhuma despesa cadastrada ainda.";
    }

    dados.forEach(despesa => {
        const linha = criarElemento("div", null, "item-lista");
        const informacoes = criarElemento("div");

        informacoes.appendChild(criarElemento("strong", despesa.descricao));

        informacoes.appendChild(
            criarElemento("p", `${despesa.categoria || "Sem categoria"} • ${despesa.tipo || ""}`)
        );

        informacoes.appendChild(
            criarElemento("small", `${formatarData(despesa.data || despesa.vencimento)} • ${despesa.responsavel || ""}`)
        );

        const status = criarElemento("span", despesa.status || "Pendente");
        const valor = criarElemento("strong", formatarMoeda(despesa.valor));
        const acoes = criarElemento("div", null, "acoes-item");

        acoes.appendChild(
            criarBotao("Editar", "btn-editar", () => editarDespesa(despesa.id))
        );

        acoes.appendChild(
            criarBotao("Excluir", "btn-excluir", () => excluirDespesa(despesa.id))
        );

        linha.append(informacoes, status, valor, acoes);
        lista.appendChild(linha);
    });

    const total = dados.reduce((soma, item) => soma + Number(item.valor || 0), 0);

    const fixas = dados
        .filter(item => item.tipo === "Fixa")
        .reduce((soma, item) => soma + Number(item.valor || 0), 0);

    const variaveis = dados
        .filter(item => item.tipo === "Variável")
        .reduce((soma, item) => soma + Number(item.valor || 0), 0);

    definirTexto("totalDespesas", formatarMoeda(total));
    definirTexto("totalDespesasFixas", formatarMoeda(fixas));
    definirTexto("totalDespesasVariaveis", formatarMoeda(variaveis));
}

function editarDespesa(id) {
    const despesas = carregarDados(CHAVES.despesas);
    const despesa = despesas.find(item => item.id === id);
    if (!despesa) return;

    obterElemento("descricaoDespesa").value = despesa.descricao || "";
    obterElemento("valorDespesa").value = despesa.valor || "";
    obterElemento("categoriaDespesa").value = despesa.categoria || "";
    obterElemento("tipoDespesa").value = despesa.tipo || "";
    obterElemento("vencimentoDespesa").value = despesa.data || despesa.vencimento || "";
    obterElemento("statusDespesa").value = despesa.status || "Pendente";
    obterElemento("responsavelDespesa").value = despesa.responsavel || "";

    despesaEmEdicao = id;

    obterElemento("formDespesa").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function excluirDespesa(id) {
    if (!confirm("Deseja realmente excluir esta despesa?")) return;

    const despesas = carregarDados(CHAVES.despesas);
    const atualizadas = despesas.filter(item => item.id !== id);

    if (!salvarDados(CHAVES.despesas, atualizadas)) return;

    despesaEmEdicao = null;
    atualizarDespesas();
    atualizarDashboard();
    atualizarPlanejamento();
}


// ------------------------------------------------------
// 4. METAS
// ------------------------------------------------------

let metaEmEdicao = null;

function iniciarMetas() {
    const formulario = obterElemento("formMeta");
    if (!formulario) return;

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nome = obterElemento("nomeMeta").value.trim();
        const objetivo = Number(obterElemento("valorObjetivo").value);
        const guardado = Number(obterElemento("valorGuardado").value);
        const prazo = obterElemento("prazoMeta").value;
        const responsavel = obterElemento("responsavelMeta").value;

        if (!nome || objetivo <= 0 || guardado < 0) {
            alert("Preencha os campos corretamente.");
            return;
        }

        const metas = carregarDados(CHAVES.metas);

        if (!Array.isArray(metas)) {
            alert("Não foi possível reconhecer os dados das metas.");
            return;
        }

        if (metaEmEdicao !== null) {
            const indice = metas.findIndex(item => item.id === metaEmEdicao);

            if (indice !== -1) {
                metas[indice] = {
                    ...metas[indice],
                    nome,
                    objetivo,
                    guardado,
                    prazo,
                    responsavel
                };
            }

            metaEmEdicao = null;
        } else {
            metas.push({
                id: gerarId(),
                nome,
                objetivo,
                guardado,
                prazo,
                responsavel
            });
        }

        if (!salvarDados(CHAVES.metas, metas)) return;

        formulario.reset();
        atualizarMetas();
    });

    atualizarMetas();
}

function atualizarMetas() {
    const lista = obterElemento("listaMetas");
    if (!lista) return;

    const metas = carregarDados(CHAVES.metas);
    const dados = Array.isArray(metas) ? metas : [];

    lista.innerHTML = "";

    if (dados.length === 0) {
        lista.textContent = "Nenhuma meta cadastrada ainda.";
    }

    dados.forEach(meta => {
        const linha = criarElemento("div", null, "item-lista");
        const informacoes = criarElemento("div");

        informacoes.appendChild(criarElemento("strong", meta.nome));

        informacoes.appendChild(
            criarElemento("p", `Guardado: ${formatarMoeda(meta.guardado)} de ${formatarMoeda(meta.objetivo)}`)
        );

        informacoes.appendChild(
            criarElemento("small", `Prazo: ${formatarData(meta.prazo)} • ${meta.responsavel || ""}`)
        );

        const percentual = meta.objetivo > 0
            ? Math.min(100, Number(meta.guardado || 0) / Number(meta.objetivo) * 100)
            : 0;

        informacoes.appendChild(
            criarElemento("p", `${percentual.toFixed(1).replace(".", ",")}% concluído`)
        );

        const acoes = criarElemento("div", null, "acoes-item");

        acoes.appendChild(
            criarBotao("Editar", "btn-editar", () => editarMeta(meta.id))
        );

        acoes.appendChild(
            criarBotao("Excluir", "btn-excluir", () => excluirMeta(meta.id))
        );

        linha.append(informacoes, acoes);
        lista.appendChild(linha);
    });

    const total = dados.reduce((soma, item) => soma + Number(item.objetivo || 0), 0);
    const guardado = dados.reduce((soma, item) => soma + Number(item.guardado || 0), 0);

    definirTexto("totalMetas", formatarMoeda(total));
    definirTexto("totalGuardadoMetas", formatarMoeda(guardado));
    definirTexto("totalFaltaMetas", formatarMoeda(Math.max(0, total - guardado)));
}

function editarMeta(id) {
    const metas = carregarDados(CHAVES.metas);
    const meta = metas.find(item => item.id === id);
    if (!meta) return;

    obterElemento("nomeMeta").value = meta.nome || "";
    obterElemento("valorObjetivo").value = meta.objetivo || "";
    obterElemento("valorGuardado").value = meta.guardado || 0;
    obterElemento("prazoMeta").value = meta.prazo || "";
    obterElemento("responsavelMeta").value = meta.responsavel || "";

    metaEmEdicao = id;

    obterElemento("formMeta").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function excluirMeta(id) {
    if (!confirm("Deseja realmente excluir esta meta?")) return;

    const metas = carregarDados(CHAVES.metas);
    const atualizadas = metas.filter(item => item.id !== id);

    if (!salvarDados(CHAVES.metas, atualizadas)) return;

    metaEmEdicao = null;
    atualizarMetas();
}


// ------------------------------------------------------
// 5. PLANEJAMENTO FINANCEIRO
// ------------------------------------------------------

let orcamentoEmEdicao = null;

function obterPlanejamentos() {
    const dados = carregarDados(CHAVES.planejamentos, {});

    if (dados && typeof dados === "object" && !Array.isArray(dados)) {
        return dados;
    }

    return {};
}

function obterMesPlanejamento() {
    const campo = obterElemento("mesPlanejamento");

    if (!campo) return mesAtual();

    if (!campo.value) campo.value = mesAtual();

    return campo.value;
}

function obterPlanejamentoDoMes(mes) {
    const planejamentos = obterPlanejamentos();

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

function iniciarPlanejamento() {
    const campoMes = obterElemento("mesPlanejamento");
    const formularioRenda = obterElemento("formRendaPlanejada");
    const formularioOrcamento = obterElemento("formOrcamento");

    if (!campoMes && !formularioRenda && !formularioOrcamento) return;

    if (campoMes && !campoMes.value) campoMes.value = mesAtual();

    if (campoMes) {
        campoMes.addEventListener("change", function () {
            orcamentoEmEdicao = null;
            cancelarEdicaoOrcamento();
            atualizarPlanejamento();
        });
    }

    if (formularioRenda) {
        formularioRenda.addEventListener("submit", function (evento) {
            evento.preventDefault();

            const renda = Number(obterElemento("rendaPrevista").value);
            const mes = obterMesPlanejamento();

            if (renda < 0) {
                alert("Informe uma renda válida.");
                return;
            }

            const planejamentos = obterPlanejamentos();

            if (!planejamentos[mes]) {
                planejamentos[mes] = { renda: 0, categorias: [] };
            }

            planejamentos[mes].renda = renda;

            if (!salvarDados(CHAVES.planejamentos, planejamentos)) return;

            atualizarPlanejamento();
            atualizarDashboard();
            alert("Renda prevista salva!");
        });
    }

    if (formularioOrcamento) {
        formularioOrcamento.addEventListener("submit", function (evento) {
            evento.preventDefault();

            const categoria = obterElemento("categoriaOrcamento").value;
            const valor = Number(obterElemento("valorOrcamento").value);
            const mes = obterMesPlanejamento();

            if (!categoria || valor <= 0) {
                alert("Escolha uma categoria e informe um valor válido.");
                return;
            }

            const planejamentos = obterPlanejamentos();

            if (!planejamentos[mes]) {
                planejamentos[mes] = { renda: 0, categorias: [] };
            }

            if (!Array.isArray(planejamentos[mes].categorias)) {
                planejamentos[mes].categorias = [];
            }

            const categorias = planejamentos[mes].categorias;

            if (orcamentoEmEdicao !== null) {
                const indice = categorias.findIndex(item => item.id === orcamentoEmEdicao);

                if (indice !== -1) {
                    categorias[indice] = {
                        ...categorias[indice],
                        categoria,
                        valor
                    };
                }

                orcamentoEmEdicao = null;
            } else {
                categorias.push({
                    id: gerarId(),
                    categoria,
                    valor
                });
            }

            if (!salvarDados(CHAVES.planejamentos, planejamentos)) return;

            formularioOrcamento.reset();
            cancelarEdicaoOrcamento();
            atualizarPlanejamento();
            atualizarDashboard();
        });
    }

    const botaoCancelar = obterElemento("cancelarEdicaoOrcamento");

    if (botaoCancelar) {
        botaoCancelar.addEventListener("click", cancelarEdicaoOrcamento);
    }

    atualizarPlanejamento();
}

function atualizarPlanejamento() {
    const lista = obterElemento("listaOrcamento");
    if (!lista) return;

    const mes = obterMesPlanejamento();
    const planejamento = obterPlanejamentoDoMes(mes);

    definirTexto("resumoRenda", formatarMoeda(planejamento.renda));

    const categorias = planejamento.categorias;

    const totalPlanejado = categorias.reduce(
        (soma, item) => soma + Number(item.valor || 0), 0
    );

    definirTexto("resumoPlanejado", formatarMoeda(totalPlanejado));

    definirTexto(
        "resumoSaldo",
        formatarMoeda(Number(planejamento.renda || 0) - totalPlanejado)
    );

    const campoRenda = obterElemento("rendaPrevista");

    if (campoRenda && document.activeElement !== campoRenda) {
        campoRenda.value = planejamento.renda || "";
    }

    lista.innerHTML = "";

    if (categorias.length === 0) {
        lista.textContent = "Nenhuma categoria planejada ainda.";
    }

    categorias.forEach(item => {
        const linha = criarElemento("div", null, "item-lista");
        const informacoes = criarElemento("div");

        informacoes.appendChild(
            criarElemento("strong", item.categoria || item.nome || "Categoria")
        );

        informacoes.appendChild(criarElemento("p", formatarMoeda(item.valor)));

        const acoes = criarElemento("div", null, "acoes-item");

        acoes.appendChild(
            criarBotao("Editar", "btn-editar", () => editarOrcamento(item.id))
        );

        acoes.appendChild(
            criarBotao("Excluir", "btn-excluir", () => excluirOrcamento(item.id))
        );

        linha.append(informacoes, acoes);
        lista.appendChild(linha);
    });

    atualizarComparativoPlanejamento(mes, categorias);
}

function editarOrcamento(id) {
    const mes = obterMesPlanejamento();
    const planejamentos = obterPlanejamentos();

    if (!planejamentos[mes]) return;

    const categorias = planejamentos[mes].categorias || [];
    const item = categorias.find(categoria => categoria.id === id);
    if (!item) return;

    obterElemento("categoriaOrcamento").value = item.categoria || item.nome || "";
    obterElemento("valorOrcamento").value = item.valor || "";

    orcamentoEmEdicao = id;

    const botao = obterElemento("botaoOrcamento");
    if (botao) botao.textContent = "Salvar alterações";

    const cancelar = obterElemento("cancelarEdicaoOrcamento");
    if (cancelar) cancelar.hidden = false;

    obterElemento("formOrcamento").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function cancelarEdicaoOrcamento() {
    orcamentoEmEdicao = null;

    const formulario = obterElemento("formOrcamento");
    if (formulario) formulario.reset();

    const botao = obterElemento("botaoOrcamento");
    if (botao) botao.textContent = "Adicionar ao orçamento";

    const cancelar = obterElemento("cancelarEdicaoOrcamento");
    if (cancelar) cancelar.hidden = true;
}

function excluirOrcamento(id) {
    if (!confirm("Deseja excluir esta categoria do orçamento?")) return;

    const mes = obterMesPlanejamento();
    const planejamentos = obterPlanejamentos();

    if (!planejamentos[mes]) return;

    planejamentos[mes].categorias =
        (planejamentos[mes].categorias || []).filter(item => item.id !== id);

    if (!salvarDados(CHAVES.planejamentos, planejamentos)) return;

    atualizarPlanejamento();
    atualizarDashboard();
}

function atualizarComparativoPlanejamento(mes, categorias) {
    const comparativo = obterElemento("comparativoPlanejamento");
    if (!comparativo) return;

    const despesas = carregarDados(CHAVES.despesas);
    const dadosDespesas = Array.isArray(despesas) ? despesas : [];

    const despesasMes = dadosDespesas.filter(despesa => {
        const data = despesa.data || despesa.vencimento || "";
        return String(data).startsWith(mes);
    });

    comparativo.innerHTML = "";

    if (categorias.length === 0) {
        comparativo.textContent = "Nenhum orçamento cadastrado ainda.";
        return;
    }

    categorias.forEach(item => {
        const nomeCategoria = item.categoria || item.nome;
        const planejado = Number(item.valor || 0);

        const realizado = despesasMes
            .filter(despesa => despesa.categoria === nomeCategoria)
            .reduce((soma, despesa) => soma + Number(despesa.valor || 0), 0);

        const diferenca = planejado - realizado;

        const linha = criarElemento("div", null, "item-lista");
        const informacoes = criarElemento("div");

        informacoes.appendChild(criarElemento("strong", nomeCategoria));
        informacoes.appendChild(criarElemento("p", `Planejado: ${formatarMoeda(planejado)}`));
        informacoes.appendChild(criarElemento("p", `Realizado: ${formatarMoeda(realizado)}`));

        informacoes.appendChild(
            criarElemento(
                "small",
                diferenca >= 0
                    ? `Ainda disponível: ${formatarMoeda(diferenca)}`
                    : `Acima do planejado: ${formatarMoeda(Math.abs(diferenca))}`
            )
        );

        linha.appendChild(informacoes);
        comparativo.appendChild(linha);
    });
}


// ------------------------------------------------------
// 6. INVESTIMENTOS
// ------------------------------------------------------

let investimentoEmEdicao = null;

function iniciarInvestimentos() {
    const formulario = obterElemento("formInvestimento");
    if (!formulario) return;

    const botaoCancelar = obterElemento("cancelarEdicaoInvestimento");

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nome = obterElemento("nomeInvestimento").value.trim();
        const instituicao = obterElemento("instituicaoInvestimento").value.trim();
        const tipo = obterElemento("tipoInvestimento").value;
        const valorAplicado = Number(obterElemento("valorAplicado").value);
        const rendimento = Number(obterElemento("rendimentoAplicado").value);
        const data = obterElemento("dataInvestimento").value;
        const responsavel = obterElemento("responsavelInvestimento").value;

        if (
            !nome ||
            !instituicao ||
            !tipo ||
            valorAplicado <= 0 ||
            !Number.isFinite(rendimento) ||
            !data ||
            !responsavel
        ) {
            alert("Preencha todos os campos corretamente.");
            return;
        }

        const investimentos = carregarDados(CHAVES.investimentos);

        if (!Array.isArray(investimentos)) {
            alert("Não foi possível reconhecer os investimentos cadastrados.");
            return;
        }

        if (investimentoEmEdicao !== null) {
            const indice = investimentos.findIndex(
                item => item.id === investimentoEmEdicao
            );

            if (indice !== -1) {
                investimentos[indice] = {
                    ...investimentos[indice],
                    nome,
                    instituicao,
                    tipo,
                    valorAplicado,
                    rendimento,
                    data,
                    responsavel
                };
            }

            investimentoEmEdicao = null;
        } else {
            investimentos.push({
                id: gerarId(),
                nome,
                instituicao,
                tipo,
                valorAplicado,
                rendimento,
                data,
                responsavel
            });
        }

        if (!salvarDados(CHAVES.investimentos, investimentos)) return;

        formulario.reset();
        obterElemento("rendimentoAplicado").value = "0";

        if (botaoCancelar) botaoCancelar.hidden = true;

        atualizarInvestimentos();
        alert("Investimento salvo com sucesso!");
    });

    if (botaoCancelar) {
        botaoCancelar.addEventListener("click", cancelarEdicaoInvestimento);
    }

    atualizarInvestimentos();
}

function atualizarInvestimentos() {
    const lista = obterElemento("listaInvestimentos");
    if (!lista) return;

    const salvos = carregarDados(CHAVES.investimentos);
    const investimentos = Array.isArray(salvos) ? salvos : [];

    lista.innerHTML = "";

    if (investimentos.length === 0) {
        lista.textContent = "Nenhum investimento cadastrado ainda.";
    }

    let totalAplicado = 0;
    let totalRendimento = 0;

    investimentos.forEach(investimento => {
        const aplicado = Number(investimento.valorAplicado || 0);
        const rendimento = Number(investimento.rendimento || 0);
        const patrimonio = aplicado + rendimento;

        totalAplicado += aplicado;
        totalRendimento += rendimento;

        const linha = criarElemento("div", null, "item-lista");
        const informacoes = criarElemento("div");

        informacoes.appendChild(
            criarElemento("strong", investimento.nome)
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                `${investimento.tipo} • ${investimento.instituicao}`
            )
        );

        informacoes.appendChild(
            criarElemento(
                "small",
                `${formatarData(investimento.data)} • ${investimento.responsavel}`
            )
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                `Aplicado: ${formatarMoeda(aplicado)}`
            )
        );

        informacoes.appendChild(
            criarElemento(
                "p",
                `Rendimento: ${formatarMoeda(rendimento)}`
            )
        );

        informacoes.appendChild(
            criarElemento(
                "strong",
                `Patrimônio: ${formatarMoeda(patrimonio)}`
            )
        );

        const acoes = criarElemento("div", null, "acoes-item");

        acoes.appendChild(
            criarBotao(
                "Editar",
                "btn-editar",
                () => editarInvestimento(investimento.id)
            )
        );

        acoes.appendChild(
            criarBotao(
                "Excluir",
                "btn-excluir",
                () => excluirInvestimento(investimento.id)
            )
        );

        linha.append(informacoes, acoes);
        lista.appendChild(linha);
    });

    definirTexto("totalInvestido", formatarMoeda(totalAplicado));
    definirTexto("rendimentoInvestimentos", formatarMoeda(totalRendimento));
    definirTexto(
        "patrimonioInvestimentos",
        formatarMoeda(totalAplicado + totalRendimento)
    );
}

function editarInvestimento(id) {
    const investimentos = carregarDados(CHAVES.investimentos);
    const investimento = investimentos.find(item => item.id === id);

    if (!investimento) return;

    obterElemento("nomeInvestimento").value = investimento.nome || "";
    obterElemento("instituicaoInvestimento").value = investimento.instituicao || "";
    obterElemento("tipoInvestimento").value = investimento.tipo || "";
    obterElemento("valorAplicado").value = investimento.valorAplicado || "";
    obterElemento("rendimentoAplicado").value = investimento.rendimento ?? 0;
    obterElemento("dataInvestimento").value = investimento.data || "";
    obterElemento("responsavelInvestimento").value = investimento.responsavel || "";

    investimentoEmEdicao = id;

    const botao = obterElemento("botaoInvestimento");
    if (botao) botao.textContent = "Salvar alterações";

    const cancelar = obterElemento("cancelarEdicaoInvestimento");
    if (cancelar) cancelar.hidden = false;

    obterElemento("formInvestimento").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function cancelarEdicaoInvestimento() {
    investimentoEmEdicao = null;

    const formulario = obterElemento("formInvestimento");
    if (formulario) formulario.reset();

    const rendimento = obterElemento("rendimentoAplicado");
    if (rendimento) rendimento.value = "0";

    const botao = obterElemento("botaoInvestimento");
    if (botao) botao.textContent = "Adicionar investimento";

    const cancelar = obterElemento("cancelarEdicaoInvestimento");
    if (cancelar) cancelar.hidden = true;
}

function excluirInvestimento(id) {
    if (!confirm("Deseja realmente excluir este investimento?")) return;

    const investimentos = carregarDados(CHAVES.investimentos);

    const atualizados = investimentos.filter(
        item => item.id !== id
    );

    if (!salvarDados(CHAVES.investimentos, atualizados)) return;

    if (investimentoEmEdicao === id) {
        cancelarEdicaoInvestimento();
    }

    atualizarInvestimentos();
}


// ------------------------------------------------------
// 7. VISÃO GERAL / DASHBOARD
// ------------------------------------------------------

function atualizarDashboard() {
    const seletorMes = obterElemento("mesDashboard");
    if (!seletorMes) return;

    if (!seletorMes.value) seletorMes.value = mesAtual();

    const mes = seletorMes.value;

    const receitasSalvas = carregarDados(CHAVES.receitas);
    const despesasSalvas = carregarDados(CHAVES.despesas);

    const receitas = Array.isArray(receitasSalvas) ? receitasSalvas : [];
    const despesas = Array.isArray(despesasSalvas) ? despesasSalvas : [];

    const receitasMes = receitas.filter(receita =>
        String(receita.data || "").startsWith(mes)
    );

    const despesasMes = despesas.filter(despesa => {
        const data = despesa.data || despesa.vencimento || "";
        return String(data).startsWith(mes);
    });

    const totalReceitas = receitasMes.reduce(
        (soma, item) => soma + Number(item.valor || 0), 0
    );

    const totalDespesas = despesasMes.reduce(
        (soma, item) => soma + Number(item.valor || 0), 0
    );

    const despesasPagas = despesasMes
        .filter(despesa =>
            String(despesa.status || "").toLowerCase() === "paga"
        )
        .reduce((soma, item) => soma + Number(item.valor || 0), 0);

    const saldo = totalReceitas - despesasPagas;

    definirTexto("receitasDashboard", formatarMoeda(totalReceitas));
    definirTexto("despesasDashboard", formatarMoeda(totalDespesas));
    definirTexto("saldoDashboard", formatarMoeda(saldo));

    const barra = obterElemento("barraDashboard");

    const percentual = totalReceitas > 0
        ? Math.min(100, despesasPagas / totalReceitas * 100)
        : 0;

    if (barra) barra.style.width = percentual + "%";

    definirTexto(
        "resumoPercentualDashboard",
        totalReceitas > 0
            ? percentual.toFixed(1).replace(".", ",") +
              "% da receita já utilizada em despesas pagas."
            : "Cadastre receitas para visualizar o resumo."
    );

    const planejamentos = obterPlanejamentos();

    const planejamento = planejamentos[mes] || {
        renda: 0,
        categorias: []
    };

    const rendaPrevista = Number(planejamento.renda || 0);

    const categorias = Array.isArray(planejamento.categorias)
        ? planejamento.categorias
        : [];

    const totalPlanejado = categorias.reduce(
        (soma, item) => soma + Number(item.valor || 0), 0
    );

    definirTexto("rendaDashboard", formatarMoeda(rendaPrevista));
    definirTexto("orcamentoDashboard", formatarMoeda(totalPlanejado));

    definirTexto(
        "saldoPrevistoDashboard",
        formatarMoeda(rendaPrevista - totalPlanejado)
    );

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
            tipo: "despesa",
            status: item.status
        }))
    ];

    movimentacoes.sort((a, b) =>
        String(b.data || "").localeCompare(String(a.data || ""))
    );

    const ultimas = movimentacoes.slice(0, 5);

    if (ultimas.length === 0) {
        lista.textContent = "Nenhuma movimentação cadastrada neste mês.";
        return;
    }

    ultimas.forEach(item => {
        const linha = criarElemento("div", null, "movement");

        const descricao = criarElemento(
            "span",
            (item.tipo === "receita" ? "💰 " : "💸 ") +
            (item.descricao || "Movimentação")
        );

        const valor = criarElemento(
            "strong",
            (item.tipo === "receita" ? "+ " : "- ") +
            formatarMoeda(item.valor)
        );

        if (item.tipo === "receita") valor.className = "positive";

        linha.append(descricao, valor);
        lista.appendChild(linha);
    });
}


// ------------------------------------------------------
// 8. INICIALIZAÇÃO
// ------------------------------------------------------

iniciarReceitas();
iniciarDespesas();
iniciarMetas();
iniciarPlanejamento();
iniciarInvestimentos();

const campoMesDashboard = obterElemento("mesDashboard");

if (campoMesDashboard) {
    if (!campoMesDashboard.value) campoMesDashboard.value = mesAtual();

    campoMesDashboard.addEventListener("change", atualizarDashboard);
}

atualizarDashboard();

window.addEventListener("storage", function (evento) {
    if (!evento.key || Object.values(CHAVES).includes(evento.key)) {
        atualizarReceitas();
        atualizarDespesas();
        atualizarMetas();
        atualizarPlanejamento();
        atualizarInvestimentos();
        atualizarDashboard();
    }
});

console.log("DMIKA: sistema carregado com sucesso!");
