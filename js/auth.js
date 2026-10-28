/* =============================================================
 * WomanTech — login, papéis e permissões (compartilhado)
 *
 * PAPÉIS (cada um inclui tudo do anterior):
 *   aluna → integrante → lider (team líder) → admin
 *
 * PERMISSÕES EXTRAS: dadas a pessoas específicas pela página Usuários.
 *
 * Importante: esconder botões aqui é só conforto visual. Quem de fato
 * bloqueia é o banco (regras em supabase/setup.sql).
 * ============================================================= */
const NIVEIS = { aluna: 1, integrante: 2, lider: 3, admin: 4 };

const NOMES_PAPEL = {
    aluna: "Aluna",
    integrante: "Integrante",
    lider: "Team líder",
    admin: "Admin"
};

const PERMISSOES = {
    publicar_projetos: "Publicar projetos e eventos",
    mentora_carreira: "Mentora de carreira",
    aprovar_vagas: "Aprovar vagas",
    postar_aulas: "Postar aulas"
};

const Auth = (function () {
    const configurado = typeof supabaseConfigurado === "function" && supabaseConfigurado() && window.supabase;
    const sb = configurado ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
    let cache = null;

    async function perfil(forcar = false) {
        if (!sb) return null;
        if (cache && !forcar) return cache;
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return (cache = null);
        const { data } = await sb.from("perfis").select("*").eq("user_id", session.user.id).maybeSingle();
        cache = data || null;
        return cache;
    }

    // regra: { nivel: "integrante" } e/ou { permissao: "publicar_projetos" }
    function pode(p, regra = {}) {
        if (!p) return false;
        const meu = NIVEIS[p.papel] || 0;
        if (meu === NIVEIS.admin) return true;
        if (regra.nivel && meu < NIVEIS[regra.nivel]) return false;
        if (regra.permissao && !(p.permissoes || []).includes(regra.permissao)) return false;
        return true;
    }

    function telaAviso(icone, titulo, texto, botao) {
        const main = document.querySelector("main");
        main.innerHTML = `
        <div class="container mx-auto px-4">
            <section class="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-10 text-center">
                <div class="w-16 h-16 mx-auto rounded-full bg-[#Ded9e2] text-[#682857] flex items-center justify-center text-2xl mb-4"><i class="fas ${icone}"></i></div>
                <h1 class="text-2xl font-bold text-[#682857] mb-3">${titulo}</h1>
                <p class="text-gray-600 mb-6">${texto}</p>
                ${botao ? `<a href="${botao.href}" class="btn-primary inline-block px-8 py-3 rounded-full font-bold">${botao.texto}</a>` : ""}
            </section>
        </div>`;
    }

    // Use no topo de páginas restritas. Devolve o perfil ou null (e já mostra o aviso).
    async function exigir(regra = {}) {
        if (!sb) {
            telaAviso("fa-plug", "Login ainda não conectado",
                "Preencha <code>js/config.js</code> com os dados do Supabase e rode <code>supabase/setup.sql</code>. O passo a passo está no README.");
            return null;
        }
        const p = await perfil();
        if (!p) {
            const volta = encodeURIComponent(location.pathname.split("/").pop() + location.search);
            location.replace(`login.html?volta=${volta}`);
            return null;
        }
        if (!pode(p, regra)) {
            telaAviso("fa-lock", "Você não tem acesso a esta área",
                `Sua conta é de <b>${NOMES_PAPEL[p.papel] || p.papel}</b>. Se precisar de acesso, fale com a coordenação do WomanTech.`,
                { href: "area.html", texto: "Voltar para Minha área" });
            return null;
        }
        return p;
    }

    async function sair() {
        if (sb) await sb.auth.signOut();
        cache = null;
        location.href = "index.html";
    }

    return { sb, configurado: !!sb, perfil, pode, exigir, sair, telaAviso };
})();
