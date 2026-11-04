
// =====================================================
// DMIKA - SISTEMA FINANCEIRO INTEGRADO
// Receitas | Despesas | Metas | Planejamento | Dashboard
// Armazenamento local: localStorage
// =====================================================

document.addEventListener("DOMContentLoaded", iniciarDMIKA);

function iniciarDMIKA() {

    // -------------------------------------------------
    // 1. FUNÇÕES GERAIS
    // -------------------------------------------------

    const CHAVES = {
        receitas: "dmika_receitas",
        despesas: "dmika_despesas",
        metas: "dmika_metas",
        planejamentos: "dmika_planejamentos"
    };

    function carregarDados(chave, padrao = []) {
        try {
            const dados = localStorage.getItem(chave);
            return dados ? JSON.parse(dados) : padrao;
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
            alert("Não foi possível salvar os dados. Verifique o espaço disponível no navegador.");
            return false;
        }
    }

    function moeda(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function criarElemento(tag, texto = "") {
        const elemento = document.createElement(tag);
        elemento.textContent = texto;
        return elemento;
    }

    function criarBotao(texto, classe, acao) {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = texto;

        if (classe) botao.className = classe;

        botao.addEventListener("click", acao);
        return botao;
    }

    function mesAtual() {
        const hoje = new Date();

        return hoje.getFullYear() + "-" +
            String(hoje.getMonth() + 1).padStart(2, "0");
    }

    function pertenceAoMes(data, mes) {
        if (!data || !mes) return false;

        return String(data).substring(0, 7) === mes;
    }

    function dataDespesa(despesa) {
        return despesa.vencimento || despesa.data || "";
    }

    // -------------------------------------------------
    // 2. RECEITAS
    // -------------------------------------------------

    const formReceita = document.getElementById("formReceita");

    if (formReceita) {

        let editandoReceitaId = null;

        const descricao = document.getElementById("descricao");
        const valor = document.getElementById("valor");
        const categoria = document.getElementById("categoria");
        const tipo = document.getElementById("tipo");
        const data = document.getElementById("data");
        const responsavel = document.getElementById("responsavel");
        const botao = formReceita.querySelector('button[type="submit"]');

        function atualizarReceitas() {

            const receitas = carregarDados(CHAVES.receitas);
            const lista = document.getElementById("listaReceitas");

            const total = receitas.reduce(
                (soma, item) => soma + Number(item.valor || 0), 0
            );

            const fixas = receitas
                .filter(item => item.tipo === "Fixa")
                .reduce((soma, item) => soma + Number(item.valor || 0), 0);

            const variaveis = receitas
                .filter(item => item.tipo === "Variável")
                .reduce((soma, item) => soma + Number(item.valor || 0), 0);

            document.getElementById("totalReceitas").textContent = moeda(total);
            document.getElementById("totalFixas").textContent = moeda(fixas);
            document.getElementById("totalVariaveis").textContent = moeda(variaveis);

            lista.innerHTML = "";

            if (receitas.length === 0) {
                lista.textContent = "Nenhuma receita cadastrada ainda.";
                return;
            }

            receitas.forEach(receita => {

                const item = document.createElement("div");
                item.className = "movement";

                const informacoes = document.createElement("div");

                informacoes.appendChild(
                    criarElemento("strong", receita.descricao)
                );

                informacoes.appendChild(
                    criarElemento(
                        "p",
                        `${receita.categoria} • ${receita.tipo} • ${receita.responsavel} • ${receita.data}`
                    )
                );

                const valorItem = criarElemento("strong", moeda(receita.valor));

                const editar = criarBotao("Editar", "btn-editar", () => {
                    editandoReceitaId = receita.id;

                    descricao.value = receita.descricao;
                    valor.value = receita.valor;
                    categoria.value = receita.categoria;
                    tipo.value = receita.tipo;
                    data.value = receita.data;
                    responsavel.value = receita.responsavel;

                    botao.textContent = "Salvar alterações";
                    formReceita.scrollIntoView({ behavior: "smooth" });
                });

                const excluir = criarBotao("Excluir", "btn-excluir", () => {
                    if (!confirm("Deseja excluir esta receita?")) return;

                    const atualizadas = carregarDados(CHAVES.receitas)
                        .filter(item => item.id !== receita.id);

                    if (salvarDados(CHAVES.receitas, atualizadas)) {
                        atualizarReceitas();
                    }
                });

                item.appendChild(informacoes);
                item.appendChild(valorItem);
                item.appendChild(editar);
                item.appendChild(excluir);

                lista.appendChild(item);
            });
        }

        formReceita.addEventListener("submit", function(evento) {
            evento.preventDefault();

            const receitas = carregarDados(CHAVES.receitas);

            const registro = {
                id: editandoReceitaId || Date.now(),
                descricao: descricao.value.trim(),
                valor: Number(valor.value),
                categoria: categoria.value,
                tipo: tipo.value,
                data: data.value,
                responsavel: responsavel.value
            };

            if (!registro.descricao || registro.valor <= 0 || !registro.data) {
                alert("Preencha todos os campos corretamente.");
                return;
            }

            let atualizadas;

            if (editandoReceitaId !== null) {
                atualizadas = receitas.map(item =>
                    item.id === editandoReceitaId ? registro : item
                );
            } else {
                atualizadas = [...receitas, registro];
            }

            if (salvarDados(CHAVES.receitas, atualizadas)) {
                formReceita.reset();
                editandoReceitaId = null;
                botao.textContent = "Adicionar receita";
                atualizarReceitas();
            }
        });

        atualizarReceitas();
    }

    // -------------------------------------------------
    // 3. DESPESAS
    // -------------------------------------------------

    const formDespesa = document.getElementById("formDespesa");

    if (formDespesa) {

        let editandoDespesaId = null;

        const descricao = document.getElementById("descricaoDespesa");
        const valor = document.getElementById("valorDespesa");
        const categoria = document.getElementById("categoriaDespesa");
        const tipo = document.getElementById("tipoDespesa");
        const vencimento = document.getElementById("vencimentoDespesa");
        const status = document.getElementById("statusDespesa");
        const responsavel = document.getElementById("responsavelDespesa");
        const botao = document.getElementById("botaoDespesa");

        function atualizarDespesas() {

            const despesas = carregarDados(CHAVES.despesas);
            const lista = document.getElementById("listaDespesas");

            const total = despesas.reduce(
                (soma, item) => soma + Number(item.valor || 0), 0
            );

            const fixas = despesas
                .filter(item => item.tipo === "Fixa")
                .reduce((soma, item) => soma + Number(item.valor || 0), 0);

            const variaveis = despesas
                .filter(item => item.tipo === "Variável")
                .reduce((soma, item) => soma + Number(item.valor || 0), 0);

            document.getElementById("totalDespesas").textContent = moeda(total);
            document.getElementById("totalDespesasFixas").textContent = moeda(fixas);
            document.getElementById("totalDespesasVariaveis").textContent = moeda(variaveis);

            lista.innerHTML = "";

            if (despesas.length === 0) {
                lista.textContent = "Nenhuma despesa cadastrada ainda.";
                return;
            }

            despesas.forEach(despesa => {

                const item = document.createElement("div");
                item.className = "movement";

                const informacoes = document.createElement("div");

                informacoes.appendChild(
                    criarElemento("strong", despesa.descricao)
                );

                informacoes.appendChild(
                    criarElemento(
                        "p",
                        `${despesa.categoria} • ${despesa.tipo} • ${despesa.responsavel} • ${dataDespesa(despesa)} • ${despesa.status}`
                    )
                );

                const valorItem = criarElemento("strong", moeda(despesa.valor));

                const editar = criarBotao("Editar", "btn-editar", () => {
                    editandoDespesaId = despesa.id;

                    descricao.value = despesa.descricao;
                    valor.value = despesa.valor;
                    categoria.value = despesa.categoria;
                    tipo.value = despesa.tipo;
                    vencimento.value = dataDespesa(despesa);
                    status.value = despesa.status;
                    responsavel.value = despesa.responsavel;

                    botao.textContent = "Salvar alterações";
                    formDespesa.scrollIntoView({ behavior: "smooth" });
                });

                const excluir = criarBotao("Excluir", "btn-excluir", () => {
                    if (!confirm("Deseja excluir esta despesa?")) return;

                    const atualizadas = carregarDados(CHAVES.despesas)
                        .filter(item => item.id !== despesa.id);

                    if (salvarDados(CHAVES.despesas, atualizadas)) {
                        atualizarDespesas();
                    }
                });

                item.appendChild(informacoes);
                item.appendChild(valorItem);
                item.appendChild(editar);
                item.appendChild(excluir);

                lista.appendChild(item);
            });
        }

        formDespesa.addEventListener("submit", function(evento) {
            evento.preventDefault();

            const despesas = carregarDados(CHAVES.despesas);

            const registro = {
                id: editandoDespesaId || Date.now(),
                descricao: descricao.value.trim(),
                valor: Number(valor.value),
                categoria: categoria.value,
                tipo: tipo.value,
                data: vencimento.value,
                vencimento: vencimento.value,
                status: status.value,
                responsavel: responsavel.value
            };

            if (!registro.descricao || registro.valor <= 0 || !registro.vencimento) {
                alert("Preencha todos os campos corretamente.");
                return;
            }

            let atualizadas;

            if (editandoDespesaId !== null) {
                atualizadas = despesas.map(item =>
                    item.id === editandoDespesaId ? registro : item
                );
            } else {
                atualizadas = [...despesas, registro];
            }

            if (salvarDados(CHAVES.despesas, atualizadas)) {
                formDespesa.reset();
                editandoDespesaId = null;
                botao.textContent = "Adicionar despesa";
                atualizarDespesas();
            }
        });

        atualizarDespesas();
    }

    // -------------------------------------------------
    // 4. METAS
    // -------------------------------------------------

    const formMeta = document.getElementById("formMeta");

    if (formMeta) {

        let editandoMetaId = null;

        const nome = document.getElementById("nomeMeta");
        const objetivo = document.getElementById("valorObjetivo");
        const guardado = document.getElementById("valorGuardado");
        const prazo = document.getElementById("prazoMeta");
        const responsavel = document.getElementById("responsavelMeta");
        const botao = document.getElementById("botaoMeta");

        function atualizarMetas() {

            const metas = carregarDados(CHAVES.metas);
            const lista = document.getElementById("listaMetas");

            const totalObjetivo = metas.reduce(
                (soma, item) => soma + Number(item.objetivo || item.valorObjetivo || 0), 0
            );

            const totalGuardado = metas.reduce(
                (soma, item) => soma + Number(item.guardado || item.valorGuardado || 0), 0
            );

            const falta = Math.max(0, totalObjetivo - totalGuardado);

            document.getElementById("totalMetas").textContent = moeda(totalObjetivo);
            document.getElementById("totalGuardadoMetas").textContent = moeda(totalGuardado);
            document.getElementById("totalFaltaMetas").textContent = moeda(falta);

            lista.innerHTML = "";

            if (metas.length === 0) {
                lista.textContent = "Nenhuma meta cadastrada ainda.";
                return;
            }

            metas.forEach(meta => {

                const valorMeta = Number(meta.objetivo || meta.valorObjetivo || 0);
                const valorAtual = Number(meta.guardado || meta.valorGuardado || 0);

                const percentual = valorMeta > 0
                    ? Math.min(100, valorAtual / valorMeta * 100)
                    : 0;

                const item = document.createElement("div");
                item.className = "movement";

                const informacoes = document.createElement("div");

                informacoes.appendChild(
                    criarElemento("strong", meta.nome)
                );

                informacoes.appendChild(
                    criarElemento(
                        "p",
                        `${meta.responsavel} • Prazo: ${meta.prazo || ""}`
                    )
                );

                informacoes.appendChild(
                    criarElemento(
                        "p",
                        `${moeda(valorAtual)} de ${moeda(valorMeta)} — ${percentual.toFixed(1)}%`
                    )
                );

                const editar = criarBotao("Editar", "btn-editar", () => {
                    editandoMetaId = meta.id;

                    nome.value = meta.nome;
                    objetivo.value = valorMeta;
                    guardado.value = valorAtual;
                    prazo.value = meta.prazo;
                    responsavel.value = meta.responsavel;

                    botao.textContent = "Salvar alterações";
                    formMeta.scrollIntoView({ behavior: "smooth" });
                });

                const excluir = criarBotao("Excluir", "btn-excluir", () => {
                    if (!confirm("Deseja excluir esta meta?")) return;

                    const atualizadas = carregarDados(CHAVES.metas)
                        .filter(item => item.id !== meta.id);

                    if (salvarDados(CHAVES.metas, atualizadas)) {
                        atualizarMetas();
                    }
                });

                item.appendChild(informacoes);
                item.appendChild(editar);
                item.appendChild(excluir);

                lista.appendChild(item);
            });
        }

        formMeta.addEventListener("submit", function(evento) {
            evento.preventDefault();

            const metas = carregarDados(CHAVES.metas);

            const registro = {
                id: editandoMetaId || Date.now(),
                nome: nome.value.trim(),
                objetivo: Number(objetivo.value),
                guardado: Number(guardado.value),
                prazo: prazo.value,
                responsavel: responsavel.value
            };

            if (!registro.nome || registro.objetivo <= 0 || registro.guardado < 0) {
                alert("Preencha os valores da meta corretamente.");
                return;
            }

            let atualizadas;

            if (editandoMetaId !== null) {
                atualizadas = metas.map(item =>
                    item.id === editandoMetaId ? registro : item
                );
            } else {
                atualizadas = [...metas, registro];
            }

            if (salvarDados(CHAVES.metas, atualizadas)) {
                formMeta.reset();
                editandoMetaId = null;
                botao.textContent = "Adicionar meta";
                atualizarMetas();
            }
        });

        atualizarMetas();
    }

    // -------------------------------------------------
    // 5. PLANEJAMENTO
    // -------------------------------------------------

    const formRenda = document.getElementById("formRendaPlanejada");
    const formOrcamento = document.getElementById("formOrcamento");

    if (formRenda && formOrcamento) {

        const mesCampo = document.getElementById("mesPlanejamento");
        const rendaCampo = document.getElementById("rendaPrevista");
        const categoriaCampo = document.getElementById("categoriaOrcamento");
        const valorCampo = document.getElementById("valorOrcamento");
        const botaoOrcamento = document.getElementById("botaoOrcamento");
        const cancelarEdicao = document.getElementById("cancelarEdicaoOrcamento");

        let editandoCategoriaId = null;

        if (!mesCampo.value) {
            mesCampo.value = mesAtual();
        }

        function carregarPlanejamentos() {
            const dados = carregarDados(CHAVES.planejamentos, {});
            return Array.isArray(dados) ? {} : dados;
        }

        function obterPlanejamento(mes) {
            const todos = carregarPlanejamentos();

            if (!todos[mes]) {
                todos[mes] = {
                    renda: 0,
                    categorias: []
                };
            }

            if (!Array.isArray(todos[mes].categorias)) {
                todos[mes].categorias = [];
            }

            return todos[mes];
        }

        function salvarPlanejamento(mes, planejamento) {
            const todos = carregarPlanejamentos();
            todos[mes] = planejamento;

            return salvarDados(CHAVES.planejamentos, todos);
        }

        function atualizarPlanejamento() {

            const mes = mesCampo.value;
            if (!mes) return;

            const planejamento = obterPlanejamento(mes);
            const despesas = carregarDados(CHAVES.despesas);

            rendaCampo.value = planejamento.renda || "";

            const totalPlanejado = planejamento.categorias.reduce(
                (soma, item) => soma + Number(item.valor || 0), 0
            );

            const despesasMes = despesas.filter(item =>
                pertenceAoMes(dataDespesa(item), mes)
            );

            const totalRealizado = despesasMes.reduce(
                (soma, item) => soma + Number(item.valor || 0), 0
            );

            document.getElementById("resumoRenda").textContent =
                moeda(planejamento.renda);

            document.getElementById("resumoPlanejado").textContent =
                moeda(totalPlanejado);

            document.getElementById("resumoSaldo").textContent =
                moeda(Number(planejamento.renda || 0) - totalPlanejado);

            // LISTA DO ORÇAMENTO
            const lista = document.getElementById("listaOrcamento");
            lista.innerHTML = "";

            if (planejamento.categorias.length === 0) {
                lista.textContent = "Nenhuma categoria planejada ainda.";
            } else {
                planejamento.categorias.forEach(item => {

                    const linha = document.createElement("div");
                    linha.className = "movement";

                    linha.appendChild(
                        criarElemento("strong", item.categoria)
                    );

                    linha.appendChild(
                        criarElemento("span", moeda(item.valor))
                    );

                    linha.appendChild(
                        criarBotao("Editar", "btn-editar", () => {
                            editandoCategoriaId = item.id;
                            categoriaCampo.value = item.categoria;
                            valorCampo.value = item.valor;
                            botaoOrcamento.textContent = "Salvar alterações";
                            cancelarEdicao.hidden = false;
                        })
                    );

                    linha.appendChild(
                        criarBotao("Excluir", "btn-excluir", () => {
                            if (!confirm("Excluir esta categoria do orçamento?")) return;

                            const atualizado = obterPlanejamento(mes);

                            atualizado.categorias =
                                atualizado.categorias.filter(cat => cat.id !== item.id);

                            if (salvarPlanejamento(mes, atualizado)) {
                                atualizarPlanejamento();
                            }
                        })
                    );

                    lista.appendChild(linha);
                });
            }

            // COMPARATIVO PLANEJADO X REALIZADO
            const comparativo = document.getElementById("comparativoPlanejamento");
            comparativo.innerHTML = "";

            if (planejamento.categorias.length === 0) {
                comparativo.textContent = "Nenhum orçamento cadastrado ainda.";
            } else {
                planejamento.categorias.forEach(item => {

                    const realizado = despesasMes
                        .filter(despesa => despesa.categoria === item.categoria)
                        .reduce(
                            (soma, despesa) => soma + Number(despesa.valor || 0),
                            0
                        );

                    const linha = document.createElement("div");
                    linha.className = "movement";

                    linha.appendChild(
                        criarElemento("strong", item.categoria)
                    );

                    linha.appendChild(
                        criarElemento(
                            "span",
                            `Planejado: ${moeda(item.valor)} | Realizado: ${moeda(realizado)}`
                        )
                    );

                    linha.appendChild(
                        criarElemento(
                            "p",
                            realizado > Number(item.valor)
                                ? "Acima do orçamento"
                                : "Dentro do orçamento"
                        )
                    );

                    comparativo.appendChild(linha);
                });
            }
        }

        formRenda.addEventListener("submit", function(evento) {
            evento.preventDefault();

            const mes = mesCampo.value;
            if (!mes) {
                alert("Selecione o mês do planejamento.");
                return;
            }

            const planejamento = obterPlanejamento(mes);
            planejamento.renda = Number(rendaCampo.value);

            if (salvarPlanejamento(mes, planejamento)) {
                atualizarPlanejamento();
                alert("Renda prevista salva!");
            }
        });

        formOrcamento.addEventListener("submit", function(evento) {
            evento.preventDefault();

            const mes = mesCampo.value;
            const planejamento = obterPlanejamento(mes);

            const registro = {
                id: editandoCategoriaId || Date.now(),
                categoria: categoriaCampo.value,
                valor: Number(valorCampo.value)
            };

            if (!registro.categoria || registro.valor <= 0) {
                alert("Preencha a categoria e o valor corretamente.");
                return;
            }

            if (editandoCategoriaId !== null) {
                planejamento.categorias = planejamento.categorias.map(item =>
                    item.id === editandoCategoriaId ? registro : item
                );
            } else {
                planejamento.categorias.push(registro);
            }

            if (salvarPlanejamento(mes, planejamento)) {
                formOrcamento.reset();
                editandoCategoriaId = null;
                botaoOrcamento.textContent = "Adicionar ao orçamento";
                cancelarEdicao.hidden = true;
                atualizarPlanejamento();
            }
        });

        cancelarEdicao.addEventListener("click", function() {
            formOrcamento.reset();
            editandoCategoriaId = null;
            botaoOrcamento.textContent = "Adicionar ao orçamento";
            cancelarEdicao.hidden = true;
        });

        mesCampo.addEventListener("change", function() {
            editandoCategoriaId = null;
            formOrcamento.reset();
            botaoOrcamento.textContent = "Adicionar ao orçamento";
            cancelarEdicao.hidden = true;
            atualizarPlanejamento();
        });

        atualizarPlanejamento();
    }

    // -------------------------------------------------
    // 6. VISAO GERAL / DASHBOARD
    // -------------------------------------------------

    const seletorMes = document.getElementById("mesDashboard");

    if (seletorMes) {

        if (!seletorMes.value) {
            seletorMes.value = mesAtual();
        }

        function atualizarDashboard() {

            const mes = seletorMes.value;

            if (!mes) return;

            const receitas = carregarDados(CHAVES.receitas);
            const despesas = carregarDados(CHAVES.despesas);
            const planejamentos = carregarDados(CHAVES.planejamentos, {});

            // RECEITAS DO MÊS
            const receitasMes = receitas.filter(item =>
                pertenceAoMes(item.data, mes)
            );

            const totalReceitas = receitasMes.reduce(
                (soma, item) => soma + Number(item.valor || 0), 0
            );

            // DESPESAS DO MÊS
            const despesasMes = despesas.filter(item =>
                pertenceAoMes(dataDespesa(item), mes)
            );

            const totalDespesas = despesasMes.reduce(
                (soma, item) => soma + Number(item.valor || 0), 0
            );

            const totalPago = despesasMes
                .filter(item =>
                    String(item.status || "").trim().toLowerCase() === "paga"
                )
                .reduce(
                    (soma, item) => soma + Number(item.valor || 0), 0
                );

            // SALDO DISPONÍVEL
            const saldo = totalReceitas - totalPago;

            document.getElementById("receitasDashboard").textContent =
                moeda(totalReceitas);

            document.getElementById("despesasDashboard").textContent =
                moeda(totalDespesas);

            document.getElementById("saldoDashboard").textContent =
                moeda(saldo);

            // BARRA DE UTILIZAÇÃO
            const percentual = totalReceitas > 0
                ? Math.min(100, totalPago / totalReceitas * 100)
                : 0;

            const barra = document.getElementById("barraDashboard");

            if (barra) {
                barra.style.width = percentual + "%";
            }

            document.getElementById("resumoPercentualDashboard").textContent =
                totalReceitas > 0
                    ? percentual.toFixed(1).replace(".", ",") +
                      "% da receita utilizada em despesas pagas."
                    : "Cadastre receitas para visualizar o resumo.";

            // PLANEJAMENTO DO MÊS
            const planejamento = Array.isArray(planejamentos)
                ? {}
                : (planejamentos[mes] || { renda: 0, categorias: [] });

            const rendaPrevista = Number(planejamento.renda || 0);

            const categorias = Array.isArray(planejamento.categorias)
                ? planejamento.categorias
                : [];

            const totalPlanejado = categorias.reduce(
                (soma, item) => soma + Number(item.valor || 0), 0
            );

            document.getElementById("rendaDashboard").textContent =
                moeda(rendaPrevista);

            document.getElementById("orcamentoDashboard").textContent =
                moeda(totalPlanejado);

            document.getElementById("saldoPrevistoDashboard").textContent =
                moeda(rendaPrevista - totalPlanejado);

            // ÚLTIMAS MOVIMENTAÇÕES
            const lista = document.getElementById("movimentacoesDashboard");
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
                    data: dataDespesa(item),
                    tipo: "despesa",
                    status: item.status
                }))
            ];

            movimentacoes.sort((a, b) =>
                String(b.data || "").localeCompare(String(a.data || ""))
            );

            if (movimentacoes.length === 0) {
                lista.textContent = "Nenhuma movimentação cadastrada neste mês.";
            } else {
                movimentacoes.slice(0, 5).forEach(item => {

                    const linha = document.createElement("div");
                    linha.className = "movement";

                    const descricao = criarElemento(
                        "span",
                        (item.tipo === "receita" ? "💰 " : "💸 ") +
                        item.descricao
                    );

                    const valor = criarElemento(
                        "strong",
                        (item.tipo === "receita" ? "+ " : "- ") +
                        moeda(item.valor)
                    );

                    if (item.tipo === "receita") {
                        valor.className = "positive";
                    }

                    linha.appendChild(descricao);
                    linha.appendChild(valor);
                    lista.appendChild(linha);
                });
            }
        }

        seletorMes.addEventListener("change", atualizarDashboard);

        // Atualiza também se os dados forem alterados em outra aba do navegador.
        window.addEventListener("storage", atualizarDashboard);

        atualizarDashboard();
    }

    console.log("DMIKA iniciado. Módulos carregados conforme a página.");
}
