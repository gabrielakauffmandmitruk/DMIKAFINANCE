
console.log("DMIKA iniciado com sucesso!");

// ======================================
// 1. SELETOR DE MÊS
// ======================================

const seletorMes = document.getElementById("mes");

if (seletorMes) {
    seletorMes.addEventListener("change", function() {
        console.log("Mês selecionado:", seletorMes.value);
    });
}

// ======================================
// 2. LOCALIZAR O FORMULÁRIO
// ======================================

const formulario = document.getElementById("formReceita");

// Só executa o cadastro se o formulário existir na página.
if (formulario) {

    // Nome usado para guardar as receitas no navegador.
    const CHAVE_RECEITAS = "dmika_receitas";

    // Busca as receitas já salvas.
    function buscarReceitas() {
        const dados = localStorage.getItem(CHAVE_RECEITAS);

        return dados ? JSON.parse(dados) : [];
    }

    // Guarda a lista atualizada no navegador.
    function salvarReceitas(receitas) {
        localStorage.setItem(
            CHAVE_RECEITAS,
            JSON.stringify(receitas)
        );
    }

    // ======================================
    // 3. CRIAR A ÁREA DE HISTÓRICO
    // ======================================

    const painelHistorico = document.createElement("section");
    painelHistorico.className = "panel";

    const tituloHistorico = document.createElement("h2");
    tituloHistorico.textContent = "Receitas cadastradas";

    const listaReceitas = document.createElement("div");
    listaReceitas.id = "listaReceitas";

    painelHistorico.appendChild(tituloHistorico);
    painelHistorico.appendChild(listaReceitas);

    formulario.closest(".panel").after(painelHistorico);

    // ======================================
    // 4. MOSTRAR AS RECEITAS NA TELA
    // ======================================

    function mostrarReceitas() {

        const receitas = buscarReceitas();

        listaReceitas.replaceChildren();

        if (receitas.length === 0) {
            const mensagem = document.createElement("p");
            mensagem.textContent = "Nenhuma receita cadastrada ainda.";
            listaReceitas.appendChild(mensagem);
            return;
        }

        receitas.forEach(function(receita) {

            const movimento = document.createElement("div");
            movimento.className = "movement";

            const informacoes = document.createElement("div");

            const descricao = document.createElement("strong");
            descricao.textContent = receita.descricao;

            const detalhes = document.createElement("p");
            detalhes.textContent =
                receita.categoria + " • " +
                receita.tipo + " • " +
                receita.responsavel + " • " +
                new Date(receita.data + "T00:00:00")
                    .toLocaleDateString("pt-BR");

            const valor = document.createElement("strong");
            valor.className = "positive";
            valor.textContent = Number(receita.valor).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

            const botaoExcluir = document.createElement("button");
            botaoExcluir.type = "button";
            botaoExcluir.textContent = "Excluir";

            botaoExcluir.addEventListener("click", function() {
                excluirReceita(receita.id);
            });

            informacoes.appendChild(descricao);
            informacoes.appendChild(detalhes);

            movimento.appendChild(informacoes);
            movimento.appendChild(valor);
            movimento.appendChild(botaoExcluir);

            listaReceitas.appendChild(movimento);
        });
    }

    // ======================================
    // 5. CADASTRAR UMA NOVA RECEITA
    // ======================================

    formulario.addEventListener("submit", function(evento) {

        evento.preventDefault();

        const novaReceita = {
            id: Date.now(),
            descricao: document.getElementById("descricao").value.trim(),
            valor: Number(document.getElementById("valor").value),
            categoria: document.getElementById("categoria").value,
            tipo: document.getElementById("tipo").value,
            data: document.getElementById("data").value,
            responsavel: document.getElementById("responsavel").value
        };

        if (
            !novaReceita.descricao ||
            !Number.isFinite(novaReceita.valor) ||
            novaReceita.valor <= 0 ||
            !novaReceita.data
        ) {
            alert("Confira os dados da receita.");
            return;
        }

        const receitas = buscarReceitas();

        receitas.push(novaReceita);

        salvarReceitas(receitas);

        formulario.reset();

        mostrarReceitas();

        alert("Receita cadastrada com sucesso!");
    });

    // ======================================
    // 6. EXCLUIR UMA RECEITA
    // ======================================

    function excluirReceita(id) {

        const confirmar = confirm(
            "Deseja realmente excluir esta receita?"
        );

        if (!confirmar) {
            return;
        }

        const receitas = buscarReceitas();

        const receitasAtualizadas = receitas.filter(function(receita) {
            return receita.id !== id;
        });

        salvarReceitas(receitasAtualizadas);

        mostrarReceitas();
    }

    // Mostra os registros salvos ao abrir a página.
    mostrarReceitas();
}
