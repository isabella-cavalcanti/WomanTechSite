/* WomanTech — Minha área: mostra só o que o papel/permissões da pessoa liberam */
(async function () {
    const $ = id => document.getElementById(id);
    const p = await Auth.exigir();
    if (!p) return;

    /*
     * Cada item aparece só para quem "pode" (regra igual à do Auth.pode).
     * link: página pronta · link vazio: aparece como "Em breve".
     */
    const SECOES = [
        {
            titulo: "Para você",
            itens: [
                { icone: "fa-graduation-cap", nome: "Cursos", texto: "Trilhas do iniciante ao avançado, com prova e certificado.", regra: {}, link: "" },
                { icone: "fa-briefcase", nome: "Carreira", texto: "Vagas de aprendiz, estágio e CLT, dicas e perguntas para a mentora.", regra: {}, link: "" },
                { icone: "fa-award", nome: "Meus certificados", texto: "Certificados dos cursos concluídos.", regra: {}, link: "" }
            ]
        },
        {
            titulo: "Portal das integrantes",
            itens: [
                { icone: "fa-bullhorn", nome: "Avisos", texto: "Recados da coordenação e do seu grupo.", regra: { nivel: "integrante" }, link: "" },
                { icone: "fa-list-check", nome: "Tarefas e entregas", texto: "O que você precisa entregar e quando.", regra: { nivel: "integrante" }, link: "" },
                { icone: "fa-clock", nome: "Minhas horas", texto: "Horas de extensão e meta do semestre.", regra: { nivel: "integrante" }, link: "" },
                { icone: "fa-box-archive", nome: "Acervo", texto: "Tudo o que o projeto já produziu.", regra: { nivel: "integrante" }, link: "" }
            ]
        },
        {
            titulo: "Team líder",
            itens: [
                { icone: "fa-users", nome: "Meu grupo", texto: "Criar tarefas, avaliar entregas e acompanhar o grupo.", regra: { nivel: "lider" }, link: "" }
            ]
        },
        {
            titulo: "Funções especiais",
            itens: [
                { icone: "fa-newspaper", nome: "Publicar projetos e eventos", texto: "Postar em Projetos & Eventos, com fotos.", regra: { permissao: "publicar_projetos" }, link: "admin.html" },
                { icone: "fa-comments", nome: "Comunidade de carreira", texto: "Postar dicas e avisos, responder perguntas e moderar.", regra: { permissao: "mentora_carreira" }, link: "" },
                { icone: "fa-check-double", nome: "Aprovar vagas", texto: "Revisar as vagas indicadas antes de irem ao mural.", regra: { permissao: "aprovar_vagas" }, link: "" },
                { icone: "fa-chalkboard-teacher", nome: "Postar aulas", texto: "Publicar aulas e provas nos cursos.", regra: { permissao: "postar_aulas" }, link: "" }
            ]
        },
        {
            titulo: "Administração",
            itens: [
                { icone: "fa-user-shield", nome: "Usuários", texto: "Definir papéis e permissões de cada pessoa.", regra: { nivel: "admin" }, link: "usuarios.html" }
            ]
        }
    ];

    function card(item) {
        const pronto = !!item.link;
        const tag = pronto ? "a" : "div";
        return `
        <${tag} ${pronto ? `href="${item.link}"` : ""} class="card bg-white p-6 rounded-xl shadow-md relative block ${pronto ? "" : "opacity-90"}">
            <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8d5e81] to-[#682857] text-white flex items-center justify-center text-xl"><i class="fas ${item.icone}"></i></div>
                ${pronto ? `<i class="fas fa-arrow-right text-[#682857]"></i>` : `<span class="bg-[#F5f5f5] text-gray-500 text-xs font-bold px-3 py-1 rounded-full">Em breve</span>`}
            </div>
            <h3 class="text-lg font-bold text-[#682857] mb-1">${escapar(item.nome)}</h3>
            <p class="text-gray-600 text-sm">${escapar(item.texto)}</p>
        </${tag}>`;
    }

    function desenhar(perfil) {
        const nome = perfil.nome || perfil.email.split("@")[0];
        $("ola-nome").textContent = nome;
        $("avatar").textContent = iniciaisDe(nome) || nome[0].toUpperCase();
        $("selos").innerHTML =
            `<span class="bg-white text-[#682857] text-xs font-bold px-3 py-1 rounded-full">${escapar(NOMES_PAPEL[perfil.papel] || perfil.papel)}</span>` +
            (perfil.grupo ? `<span class="bg-white/20 text-xs font-bold px-3 py-1 rounded-full"><i class="fas fa-users mr-1"></i>${escapar(perfil.grupo)}</span>` : "") +
            (perfil.permissoes || []).map(k => `<span class="bg-white/20 text-xs font-bold px-3 py-1 rounded-full"><i class="fas fa-star mr-1"></i>${escapar(PERMISSOES[k] || k)}</span>`).join("");

        $("secoes").innerHTML = SECOES.map(sec => {
            const itens = sec.itens.filter(i => Auth.pode(perfil, i.regra));
            if (!itens.length) return "";
            return `
            <section class="mb-10">
                <h2 class="text-xl font-bold text-[#682857] mb-4">${sec.titulo}</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">${itens.map(card).join("")}</div>
            </section>`;
        }).join("");
    }

    desenhar(p);
    $("area-carregando").classList.add("hidden");
    $("area-conteudo").classList.remove("hidden");

    $("btn-sair").addEventListener("click", Auth.sair);
    $("btn-editar-nome").addEventListener("click", () => {
        $("form-nome").classList.toggle("hidden");
        $("novo-nome").value = p.nome || "";
        $("novo-nome").focus();
    });
    $("form-nome").addEventListener("submit", async e => {
        e.preventDefault();
        if (!e.target.reportValidity()) return;
        const { error } = await Auth.sb.rpc("atualizar_meu_nome", { novo_nome: $("novo-nome").value });
        if (error) return;
        const novo = await Auth.perfil(true);
        $("form-nome").classList.add("hidden");
        desenhar(novo);
    });
})();
