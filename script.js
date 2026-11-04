
// ======================================================
// 9. RELATÓRIOS FINANCEIROS
// ======================================================

function iniciarRelatorios() {
    const seletorAno = obterElemento("anoRelatorio");

    if (!seletorAno) return;

    seletorAno.addEventListener("change", atualizarRelatorios);

    atualizarRelatorios();
}

function atualizarRelatorios() {
    const seletorAno = obterElemento("anoRelatorio");

    if (!seletorAno) return;

    const ano = seletorAno.value;

    const receitasSalvas = carregarDados(CHAVES.receitas);
    const despesasSalvas = carregarDados(CHAVES.despesas);
    const investimentosSalvos = carregarDados(CHAVES.investimentos);

    const receitas = Array.isArray(receitasSalvas) ? receitasSalvas : [];
    const despesas = Array.isArray(despesasSalvas) ? despesasSalvas : [];
    const investimentos = Array.isArray(investimentosSalvos) ? investimentosSalvos : [];

    const receitasAno = receitas.filter(item =>
        String(item.data || "").startsWith(ano)
    );

    const despesasAno = despesas.filter(item =>
        String(item.data || item.vencimento || "").startsWith(ano)
    );

    const totalReceitas = receitasAno.reduce(
        (soma, item) => soma + Number(item.valor || 0), 0
    );

    const totalDespesas = despesasAno.reduce(
        (soma, item) => soma + Number(item.valor || 0), 0
    );

    definirTexto("totalReceitasRelatorio", formatarMoeda(totalReceitas));
    definirTexto("totalDespesasRelatorio", formatarMoeda(totalDespesas));
    definirTexto("saldoRelatorio", formatarMoeda(totalReceitas - totalDespesas));

    atualizarResumoMensalRelatorio(ano, receitas, despesas);
    atualizarCategoriasRelatorio(despesas, ano);
    atualizarInvestimentosRelatorio(investimentos);
}

function atualizarResumoMensalRelatorio(ano, receitas, despesas) {
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

        const saldo = totalReceitas - totalDespesas;

        const linha = criarElemento("div", null, "movement");

        const informacoes = criarElemento("div");
        informacoes.appendChild(criarElemento("strong", nome));
        informacoes.appendChild(
            criarElemento("p", "Receitas: " + formatarMoeda(totalReceitas))
        );
        informacoes.appendChild(
            criarElemento("p", "Despesas: " + formatarMoeda(totalDespesas))
        );

        const valorSaldo = criarElemento(
            "strong",
            "Saldo: " + formatarMoeda(saldo)
        );

        linha.append(informacoes, valorSaldo);
        lista.appendChild(linha);
    });
}

function atualizarCategoriasRelatorio(despesas, ano) {
    const lista = obterElemento("categoriasRelatorio");

    if (!lista) return;

    lista.innerHTML = "";

    const despesasAno = despesas.filter(item =>
        String(item.data || item.vencimento || "").startsWith(ano)
    );

    const totais = {};

    despesasAno.forEach(item => {
        const categoria = item.categoria || "Sem categoria";

        totais[categoria] = (totais[categoria] || 0) +
            Number(item.valor || 0);
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

function atualizarInvestimentosRelatorio(investimentos) {
    const totalAplicado = investimentos.reduce(
        (soma, item) => soma + Number(item.valorAplicado || 0), 0
    );

    const rendimento = investimentos.reduce(
        (soma, item) => soma + Number(item.rendimento || 0), 0
    );

    definirTexto("totalAplicadoRelatorio", formatarMoeda(totalAplicado));
    definirTexto("rendimentoRelatorio", formatarMoeda(rendimento));
    definirTexto(
        "patrimonioRelatorio",
        formatarMoeda(totalAplicado + rendimento)
    );
}

// Inicializa os relatórios quando a página é aberta.
iniciarRelatorios();
