/* =============================================================
 * WomanTech — painel administrativo (Projetos & Eventos)
 * Usa o Supabase para login, banco de dados e fotos.
 * ============================================================= */
(function () {
    const $ = id => document.getElementById(id);
    const aviso = mostrarAviso;

    const BUCKET = "projetos";
    let sb = null;
    let projetos = [];
    let editando = null;          // projeto sendo editado (ou null)
    let fotoNova = null;          // Blob já redimensionado
    let fotoRemovida = false;
    let confirmandoApagar = null; // id aguardando confirmação

    async function iniciar() {
        const perfil = await Auth.exigir({ permissao: "publicar_projetos" });
        if (!perfil) return;
        sb = Auth.sb;
        $("admin-nome").textContent = perfil.nome || perfil.email;
        $("tela-painel").classList.remove("hidden");
        prepararFormulario();
        carregarLista();
    }

    $("btn-sair").addEventListener("click", Auth.sair);

    /* ── Formulário ────────────────────────────────────────── */
    function semestresDisponiveis() {
        const ano = new Date().getFullYear();
        const lista = [];
        for (let a = ano + 1; a >= 2024; a--) lista.push(`${a}/2`, `${a}/1`);
        return lista;
    }

    function semestreAtual() {
        const d = new Date();
        return `${d.getFullYear()}/${d.getMonth() < 6 ? 1 : 2}`;
    }

    let formPronto = false;
    function prepararFormulario() {
        if (formPronto) return;
        formPronto = true;
        $("p-semestre").innerHTML = semestresDisponiveis().map(s => `<option value="${s}">${s}</option>`).join("");
        $("p-semestre").value = semestreAtual();

        const form = $("form-projeto");
        form.addEventListener("input", atualizarPrevia);
        form.addEventListener("change", atualizarPrevia);
        form.addEventListener("submit", salvar);
        $("btn-cancelar").addEventListener("click", limparFormulario);
        $("p-foto").addEventListener("change", escolherFoto);
        $("btn-remover-foto").addEventListener("click", () => {
            fotoNova = null;
            fotoRemovida = true;
            $("p-foto").value = "";
            atualizarPrevia();
        });
        $("lista-projetos").addEventListener("click", acaoNaLista);
        atualizarPrevia();
    }

    function lerFormulario() {
        return {
            titulo: $("p-titulo").value.trim(),
            semestre: $("p-semestre").value,
            tipo: $("p-tipo").value,
            descricao: $("p-descricao").value.trim(),
            tags: $("p-tags").value.split(",").map(t => t.trim()).filter(Boolean).slice(0, 6),
            link: $("p-link").value.trim() || null,
            icone: $("p-icone").value,
            publicado: $("p-publicado").checked
        };
    }

    function fotoAtualUrl() {
        if (fotoNova) return URL.createObjectURL(fotoNova);
        if (editando && editando.foto_url && !fotoRemovida) return editando.foto_url;
        return "";
    }

    let urlPrevia = "";
    function atualizarPrevia() {
        const d = lerFormulario();
        $("contador").textContent = `${d.descricao.length}/2000`;
        if (urlPrevia.startsWith("blob:")) URL.revokeObjectURL(urlPrevia);
        urlPrevia = fotoAtualUrl();
        $("btn-remover-foto").classList.toggle("hidden", !urlPrevia);
        $("previa").innerHTML = cardProjeto({
            titulo: d.titulo || "Título do projeto",
            semestre: d.semestre,
            tipo: d.tipo,
            descricao: d.descricao || "A descrição aparece aqui.",
            tags: d.tags,
            link: d.link,
            foto: urlPrevia,
            icone: d.icone
        });
        $("previa").querySelector(".reveal")?.classList.add("visible");
        $("btn-salvar").innerHTML = `<i class="fas fa-check mr-2"></i>${editando ? "Salvar alterações" : d.publicado ? "Publicar" : "Salvar rascunho"}`;
    }

    function limparFormulario() {
        editando = null;
        fotoNova = null;
        fotoRemovida = false;
        $("form-projeto").reset();
        $("p-semestre").value = semestreAtual();
        $("p-publicado").checked = true;
        $("form-titulo").textContent = "Nova publicação";
        $("btn-cancelar").classList.add("hidden");
        aviso($("projeto-status"), "", "info");
        atualizarPrevia();
    }

    // Reduz a foto para no máximo 1600px (JPEG) antes de enviar
    function redimensionar(arquivo, max = 1600) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const escala = Math.min(1, max / Math.max(img.width, img.height));
                const c = document.createElement("canvas");
                c.width = Math.round(img.width * escala);
                c.height = Math.round(img.height * escala);
                c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
                URL.revokeObjectURL(img.src);
                c.toBlob(b => b ? resolve(b) : reject(new Error("Falha ao converter")), "image/jpeg", 0.85);
            };
            img.onerror = () => reject(new Error("Imagem inválida"));
            img.src = URL.createObjectURL(arquivo);
        });
    }

    async function escolherFoto(e) {
        const arquivo = e.target.files[0];
        if (!arquivo) return;
        if (arquivo.size > 15 * 1024 * 1024) {
            e.target.value = "";
            return aviso($("projeto-status"), "Foto muito grande (máximo 15 MB).", "erro");
        }
        try {
            fotoNova = await redimensionar(arquivo);
            fotoRemovida = false;
            aviso($("projeto-status"), "", "info");
        } catch {
            fotoNova = null;
            e.target.value = "";
            aviso($("projeto-status"), "Não consegui ler essa imagem. Tente uma foto JPG ou PNG.", "erro");
        }
        atualizarPrevia();
    }

    function caminhoNoBucket(url) {
        const marca = `/storage/v1/object/public/${BUCKET}/`;
        return url && url.includes(marca) ? decodeURIComponent(url.split(marca)[1]) : null;
    }

    async function salvar(e) {
        e.preventDefault();
        const form = $("form-projeto");
        const status = $("projeto-status");
        if (!form.reportValidity()) return;

        const dados = lerFormulario();
        const botao = $("btn-salvar");
        botao.disabled = true;
        aviso(status, "Salvando…", "info");

        try {
            const fotoAntiga = editando?.foto_url || null;
            let foto_url = fotoRemovida ? null : fotoAntiga;

            if (fotoNova) {
                const caminho = `${dados.semestre.replace("/", "-")}/${crypto.randomUUID()}.jpg`;
                const { error: erroUp } = await sb.storage.from(BUCKET).upload(caminho, fotoNova, { contentType: "image/jpeg" });
                if (erroUp) throw erroUp;
                foto_url = sb.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
            }

            const registro = { ...dados, foto_url };
            const { error } = editando
                ? await sb.from("projetos").update(registro).eq("id", editando.id)
                : await sb.from("projetos").insert(registro);
            if (error) throw error;

            // Apaga a foto antiga do Storage se ela foi trocada ou removida
            if (fotoAntiga && fotoAntiga !== foto_url && caminhoNoBucket(fotoAntiga)) {
                await sb.storage.from(BUCKET).remove([caminhoNoBucket(fotoAntiga)]);
            }

            const msg = editando ? "Alterações salvas!" : dados.publicado ? "Publicado! Já aparece em Projetos & Eventos." : "Rascunho salvo.";
            limparFormulario();
            aviso(status, msg, "ok");
            carregarLista();
        } catch (err) {
            console.error(err);
            aviso(status, "Não foi possível salvar. Verifique sua conexão e tente de novo.", "erro");
        } finally {
            botao.disabled = false;
        }
    }

    /* ── Lista de publicações ──────────────────────────────── */
    async function carregarLista() {
        const area = $("lista-projetos");
        area.innerHTML = `<p class="text-gray-500 py-4"><i class="fas fa-spinner fa-spin mr-2"></i>Carregando…</p>`;
        const { data, error } = await sb.from("projetos").select("*").order("created_at", { ascending: false });
        if (error) {
            area.innerHTML = `<p class="text-red-700 py-4">Não foi possível carregar as publicações.</p>`;
            return;
        }
        projetos = data;
        desenharLista();
    }

    function desenharLista() {
        const area = $("lista-projetos");
        if (!projetos.length) {
            area.innerHTML = `<p class="text-gray-500 py-4">Nenhuma publicação ainda. Use o formulário acima para criar a primeira.</p>`;
            return;
        }
        area.innerHTML = projetos.map(p => {
            const capa = p.foto_url
                ? `<img src="${escapar(p.foto_url)}" alt="" class="w-20 h-14 object-cover rounded-lg">`
                : `<div class="w-20 h-14 rounded-lg bg-gradient-to-r from-[#682857] to-[#8d5e81] flex items-center justify-center text-white"><i class="fas ${escapar(p.icone || "fa-star")}"></i></div>`;
            const situacao = p.publicado
                ? `<span class="bg-green-50 text-green-800 text-xs font-bold px-3 py-1 rounded-full">Publicado</span>`
                : `<span class="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">Rascunho</span>`;
            const apagar = confirmandoApagar === p.id
                ? `<button data-acao="apagar-sim" data-id="${p.id}" class="text-sm font-bold text-white bg-red-700 px-3 py-1 rounded-full">Confirmar exclusão</button>
                   <button data-acao="apagar-nao" class="text-sm font-bold text-gray-600 px-2">Cancelar</button>`
                : `<button data-acao="apagar" data-id="${p.id}" class="text-sm font-bold text-red-700 hover:underline"><i class="fas fa-trash mr-1"></i>Apagar</button>`;
            return `
            <div class="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                ${capa}
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-[#682857] truncate">${escapar(p.titulo)}</p>
                    <p class="text-sm text-gray-500">${escapar(p.semestre)} · ${escapar(p.tipo)} · ${new Date(p.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                ${situacao}
                <div class="flex flex-wrap items-center gap-4">
                    <button data-acao="editar" data-id="${p.id}" class="text-sm font-bold text-[#682857] hover:underline"><i class="fas fa-pen mr-1"></i>Editar</button>
                    <button data-acao="alternar" data-id="${p.id}" class="text-sm font-bold text-[#8d5e81] hover:underline"><i class="fas ${p.publicado ? "fa-eye-slash" : "fa-eye"} mr-1"></i>${p.publicado ? "Ocultar" : "Publicar"}</button>
                    ${apagar}
                </div>
            </div>`;
        }).join("");
    }

    async function acaoNaLista(e) {
        const btn = e.target.closest("button[data-acao]");
        if (!btn) return;
        const p = projetos.find(x => x.id === btn.dataset.id);

        switch (btn.dataset.acao) {
            case "editar":
                editando = p;
                fotoNova = null;
                fotoRemovida = false;
                $("p-titulo").value = p.titulo;
                $("p-semestre").value = p.semestre;
                $("p-tipo").value = p.tipo;
                $("p-descricao").value = p.descricao;
                $("p-tags").value = (p.tags || []).join(", ");
                $("p-link").value = p.link || "";
                $("p-icone").value = p.icone || "fa-star";
                $("p-publicado").checked = p.publicado;
                $("p-foto").value = "";
                $("form-titulo").textContent = "Editando publicação";
                $("btn-cancelar").classList.remove("hidden");
                aviso($("projeto-status"), "", "info");
                atualizarPrevia();
                $("form-projeto").scrollIntoView({ behavior: "smooth", block: "start" });
                break;

            case "alternar": {
                const { error } = await sb.from("projetos").update({ publicado: !p.publicado }).eq("id", p.id);
                if (!error) carregarLista();
                break;
            }

            case "apagar":
                confirmandoApagar = p.id;
                desenharLista();
                break;

            case "apagar-nao":
                confirmandoApagar = null;
                desenharLista();
                break;

            case "apagar-sim": {
                confirmandoApagar = null;
                const { error } = await sb.from("projetos").delete().eq("id", p.id);
                if (!error && caminhoNoBucket(p.foto_url)) {
                    await sb.storage.from(BUCKET).remove([caminhoNoBucket(p.foto_url)]);
                }
                if (editando?.id === p.id) limparFormulario();
                carregarLista();
                break;
            }
        }
    }

    iniciar();
})();
