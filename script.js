
// ======================================
// CONTROLE DE METAS DO DMIKA
// ======================================

const formMeta = document.getElementById("formMeta");
const listaMetasMeta = document.getElementById("listaMetas");

let metas = JSON.parse(localStorage.getItem("dmika_metas") || "[]");
let metaEmEdicao = null;

// Formata valores em reais
function formatarMoedaMeta(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Salva as metas no navegador
function salvarMetas() {
    localStorage.setItem("dmika_metas", JSON.stringify(metas));
}

// Atualiza os três cartões de resumo
function atualizarResumoMetas() {
    const total = metas.reduce(
        (soma, meta) => soma + Number(meta.objetivo), 0
    );

    const guardado = metas.reduce(
        (soma, meta) => soma + Number(meta.guardado), 0
    );

    const falta = metas.reduce(
        (soma, meta) =>
            soma + Math.max(0, Number(meta.objetivo) - Number(meta.guardado)),
        0
    );

    document.getElementById("totalMetas").textContent =
        formatarMoedaMeta(total);

    document.getElementById("totalGuardadoMetas").textContent =
        formatarMoedaMeta(guardado);

    document.getElementById("totalFaltaMetas").textContent =
        formatarMoedaMeta(falta);
}

// Mostra todas as metas cadastradas
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

        const percentual = Math.min(
            100,
            (guardado / objetivo) * 100
        );

        const item = document.createElement("div");
        item.className = "meaning";

        const titulo = document.createElement("strong");
        titulo.textContent = meta.nome;

        const valorObjetivo = document.createElement("p");
        valorObjetivo.textContent =
            "Objetivo: " + formatarMoedaMeta(objetivo);

        const valorGuardado = document.createElement("p");
        valorGuardado.textContent =
            "Guardado: " + formatarMoedaMeta(guardado);

        const prazo = document.createElement("p");
        prazo.textContent =
            "Prazo: " + meta.prazo.split("-").reverse().join("/");

        const responsavel = document.createElement("p");
        responsavel.textContent =
            "Responsável: " + meta.responsavel;

        const barra = document.createElement("div");
        barra.className = "progress";

        const progresso = document.createElement("div");
        progresso.style.width = percentual + "%";

        barra.appendChild(progresso);

        const percentualTexto = document.createElement("span");
        percentualTexto.textContent =
            percentual.toFixed(1).replace(".", ",") + "% concluído";

        const botoes = document.createElement("div");

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.textContent = "Editar";

        botaoEditar.addEventListener("click", function() {
            editarMeta(meta.id);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.textContent = "Excluir";

        botaoExcluir.addEventListener("click", function() {
            excluirMeta(meta.id);
        });

        botoes.append(botaoEditar, botaoExcluir);

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

// Cadastrar ou atualizar uma meta
if (formMeta && listaMetasMeta) {

    formMeta.addEventListener("submit", function(event) {
        event.preventDefault();

        const nome = document.getElementById("nomeMeta").value.trim();
        const objetivo = Number(
            document.getElementById("valorObjetivo").value
        );
        const guardado = Number(
            document.getElementById("valorGuardado").value
        );
        const prazo = document.getElementById("prazoMeta").value;
        const responsavel =
            document.getElementById("responsavelMeta").value;

        if (
            !nome ||
            objetivo <= 0 ||
            guardado < 0 ||
            !prazo ||
            !responsavel
        ) {
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
            metas = metas.map(meta =>
                meta.id === metaEmEdicao ? novaMeta : meta
            );
        } else {
            metas.push(novaMeta);
        }

        salvarMetas();
        mostrarMetas();

        formMeta.reset();
        metaEmEdicao = null;

        document.getElementById("botaoMeta").textContent =
            "Adicionar meta";

        document.getElementById("cancelarEdicaoMeta").hidden = true;

        alert("Meta salva com sucesso!");
    });

    // Botão para cancelar uma edição
    const botaoCancelarMeta = document.createElement("button");
    botaoCancelarMeta.type = "button";
    botaoCancelarMeta.id = "cancelarEdicaoMeta";
    botaoCancelarMeta.textContent = "Cancelar edição";
    botaoCancelarMeta.hidden = true;

    botaoCancelarMeta.addEventListener("click", cancelarEdicaoMeta);

    formMeta.appendChild(botaoCancelarMeta);

    mostrarMetas();
}

// Carrega uma meta no formulário para edição
function editarMeta(id) {
    const meta = metas.find(item => item.id === id);

    if (!meta) return;

    metaEmEdicao = id;

    document.getElementById("nomeMeta").value = meta.nome;
    document.getElementById("valorObjetivo").value = meta.objetivo;
    document.getElementById("valorGuardado").value = meta.guardado;
    document.getElementById("prazoMeta").value = meta.prazo;
    document.getElementById("responsavelMeta").value = meta.responsavel;

    document.getElementById("botaoMeta").textContent =
        "Salvar alterações";

    document.getElementById("cancelarEdicaoMeta").hidden = false;

    formMeta.scrollIntoView({ behavior: "smooth" });
}

// Exclui uma meta
function excluirMeta(id) {
    const confirmar = confirm("Deseja realmente excluir esta meta?");

    if (!confirmar) return;

    metas = metas.filter(meta => meta.id !== id);

    salvarMetas();
    mostrarMetas();

    if (metaEmEdicao === id) {
        cancelarEdicaoMeta();
    }
}

// Cancela a edição
function cancelarEdicaoMeta() {
    metaEmEdicao = null;

    formMeta.reset();

    document.getElementById("botaoMeta").textContent =
        "Adicionar meta";

    document.getElementById("cancelarEdicaoMeta").hidden = true;
}
