
// ==========================================
// DMIKA - VISAO GERAL / DASHBOARD
// ==========================================

(function iniciarDashboard() {

    const seletorMes = document.getElementById("mesDashboard");

    // Se não estiver na página inicial, não executa.
    if (!seletorMes) return;

    const moeda = valor => Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    function lerDados(chave) {
        try {
            return JSON.parse(localStorage.getItem(chave)) || [];
        } catch (erro) {
            return [];
        }
    }

    function dataDoMes(data) {
        return data && data.substring(0, 7) === seletorMes.value;
    }

    function criarTexto(tag, texto) {
        const elemento = document.createElement(tag);
        elemento.textContent = texto;
        return elemento;
    }

    function atualizarDashboard() {

        const receitas = lerDados("dmika_receitas");
        const despesas = lerDados("dmika_despesas");
        const planejamentos = lerDados("dmika_planejamentos");

        const mes = seletorMes.value;

        // RECEITAS DO MÊS
        const receitasMes = receitas.filter(receita =>
            dataDoMes(receita.data)
        );

        const totalReceitas = receitasMes.reduce(
            (total, receita) => total + Number(receita.valor || 0), 0
        );

        // DESPESAS DO MÊS
        const despesasMes = despesas.filter(despesa =>
            dataDoMes(despesa.data || despesa.vencimento)
        );

        const totalDespesas = despesasMes.reduce(
            (total, despesa) => total + Number(despesa.valor || 0), 0
        );

        const despesasPagas = despesasMes
            .filter(despesa =>
                String(despesa.status || "").toLowerCase() === "paga"
            )
            .reduce(
                (total, despesa) => total + Number(despesa.valor || 0), 0
            );

        // SALDO DISPONÍVEL
        const saldo = totalReceitas - despesasPagas;

        document.getElementById("receitasDashboard").textContent =
            moeda(totalReceitas);

        document.getElementById("despesasDashboard").textContent =
            moeda(totalDespesas);

        document.getElementById("saldoDashboard").textContent =
            moeda(saldo);

        // BARRA DE RESUMO FINANCEIRO
        const percentual = totalReceitas > 0
            ? Math.min(100, despesasPagas / totalReceitas * 100)
            : 0;

        document.getElementById("barraDashboard").style.width =
            percentual + "%";

        document.getElementById("resumoPercentualDashboard").textContent =
            totalReceitas > 0
                ? percentual.toFixed(1).replace(".", ",") +
                  "% da receita já utilizada em despesas pagas."
                : "Cadastre receitas para visualizar o resumo.";

        // PLANEJAMENTO DO MÊS
        const planejamento = planejamentos.find(item =>
            item.mes === mes
        );

        const rendaPrevista = planejamento
            ? Number(planejamento.renda || 0)
            : 0;

        const categorias = planejamento &&
            Array.isArray(planejamento.categorias)
            ? planejamento.categorias
            : [];

        const totalPlanejado = categorias.reduce(
            (total, item) => total + Number(item.valor || 0), 0
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
                valor: Number(item.valor),
                data: item.data,
                tipo: "receita"
            })),

            ...despesasMes.map(item => ({
                descricao: item.descricao,
                valor: Number(item.valor),
                data: item.data || item.vencimento,
                tipo: "despesa",
                status: item.status
            }))
        ];

        movimentacoes.sort((a, b) =>
            (b.data || "").localeCompare(a.data || "")
        );

        const ultimas = movimentacoes.slice(0, 5);

        if (ultimas.length === 0) {
            lista.textContent =
                "Nenhuma movimentação cadastrada neste mês.";
        } else {
            ultimas.forEach(item => {
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

    // Seleciona automaticamente o mês atual.
    const hoje = new Date();

    seletorMes.value =
        hoje.getFullYear() + "-" +
        String(hoje.getMonth() + 1).padStart(2, "0");

    // Atualiza quando o usuário troca o mês.
    seletorMes.addEventListener("change", atualizarDashboard);

    // Primeira atualização.
    atualizarDashboard();

})();
