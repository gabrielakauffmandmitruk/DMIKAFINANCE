
/* =========================================
   DMIKA - VISAO GERAL
   Conexao com os dados financeiros
========================================= */

(function () {

    const mesCampo = document.getElementById("mesDashboard");

    if (!mesCampo) return;

    // Formata valores em reais
    function moeda(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    // Busca informações salvas no navegador
    function buscarDados(chave, padrao) {
        try {
            return JSON.parse(
                localStorage.getItem(chave)
            ) || padrao;
        } catch (erro) {
            return padrao;
        }
    }

    function atualizarDashboard() {

        const mes = mesCampo.value;

        if (!mes) return;

        // Busca os cadastros
        const receitas = buscarDados("dmika_receitas", []);
        const despesas = buscarDados("dmika_despesas", []);

        // O planejamento está organizado por mês em um objeto
        const planejamentos = buscarDados(
            "dmika_planejamentos",
            {}
        );

        const planejamento = planejamentos[mes] || {
            renda: 0,
            categorias: []
        };

        // RECEITAS
        const receitasMes = receitas.filter(item =>
            item.data && item.data.startsWith(mes)
        );

        const totalReceitas = receitasMes.reduce(
            (soma, item) => soma + Number(item.valor || 0),
            0
        );

        // DESPESAS
        const despesasMes = despesas.filter(item =>
            (item.data || item.vencimento || "").startsWith(mes)
        );

        const totalDespesas = despesasMes.reduce(
            (soma, item) => soma + Number(item.valor || 0),
            0
        );

        // SOMENTE DESPESAS PAGAS DESCONTAM DO SALDO
        const totalPago = despesasMes
            .filter(item =>
                String(item.status || "").trim().toLowerCase() === "paga"
            )
            .reduce(
                (soma, item) => soma + Number(item.valor || 0),
                0
            );

        const saldo = totalReceitas - totalPago;

        // ATUALIZA OS INDICADORES
        function mostrar(id, valor) {
            const elemento = document.getElementById(id);

            if (elemento) {
                elemento.textContent = valor;
            }
        }

        mostrar("receitasDashboard", moeda(totalReceitas));
        mostrar("despesasDashboard", moeda(totalDespesas));
        mostrar("saldoDashboard", moeda(saldo));

        // PLANEJAMENTO
        const rendaPlanejada = Number(planejamento.renda || 0);

        const categorias = Array.isArray(planejamento.categorias)
            ? planejamento.categorias
            : [];

        const totalPlanejado = categorias.reduce(
            (soma, item) => soma + Number(item.valor || 0),
            0
        );

        mostrar("rendaDashboard", moeda(rendaPlanejada));
        mostrar("orcamentoDashboard", moeda(totalPlanejado));

        mostrar(
            "saldoPrevistoDashboard",
            moeda(rendaPlanejada - totalPlanejado)
        );

        // BARRA DE UTILIZAÇÃO DA RECEITA
        const percentual = totalReceitas > 0
            ? Math.min(100, (totalPago / totalReceitas) * 100)
            : 0;

        const barra = document.getElementById("barraDashboard");

        if (barra) {
            barra.style.width = percentual + "%";
        }

        mostrar(
            "resumoPercentualDashboard",
            totalReceitas > 0
                ? percentual.toFixed(1).replace(".", ",") +
                  "% da receita utilizada em despesas pagas."
                : "Cadastre receitas para visualizar seu resumo."
        );

        // MOVIMENTAÇÕES
        const lista = document.getElementById("movimentacoesDashboard");

        if (lista) {

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
                (b.data || "").localeCompare(a.data || "")
            );

            if (movimentacoes.length === 0) {
                lista.textContent =
                    "Nenhuma movimentação cadastrada neste mês.";
            } else {

                movimentacoes.slice(0, 5).forEach(item => {

                    const linha = document.createElement("div");
                    linha.className = "movement";

                    const descricao = document.createElement("span");
                    descricao.textContent =
                        (item.tipo === "receita" ? "💰 " : "💸 ") +
                        item.descricao;

                    const valor = document.createElement("strong");

                    valor.textContent =
                        (item.tipo === "receita" ? "+ " : "- ") +
                        moeda(item.valor);

                    if (item.tipo === "receita") {
                        valor.className = "positive";
                    }

                    linha.appendChild(descricao);
                    linha.appendChild(valor);

                    lista.appendChild(linha);
                });
            }
        }
    }

    // SELECIONA AUTOMATICAMENTE O MÊS ATUAL
    const hoje = new Date();

    const mesAtual =
        hoje.getFullYear() + "-" +
        String(hoje.getMonth() + 1).padStart(2, "0");

    mesCampo.value = mesAtual;

    // Atualiza quando trocar o mês
    mesCampo.addEventListener("change", atualizarDashboard);

    // Atualização inicial
    atualizarDashboard();

})();
