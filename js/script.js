/* =============================================================
 * WomanTech — script principal
 * ============================================================= */

/*
 * Enquanto as imagens e PDFs ainda não estiverem neste repositório
 * (pasta assets/), eles são carregados do site antigo na Vercel.
 * Depois que a pasta assets/ for copiada para cá, isso deixa de ser usado.
 */
const ASSETS_FALLBACK = "https://womantech-iota.vercel.app/";

window.addEventListener("error", function (e) {
    const el = e.target;
    if (!(el instanceof HTMLImageElement)) return;
    const original = el.getAttribute("src") || "";
    if (!el.dataset.fallback && original.startsWith("assets/")) {
        el.dataset.fallback = "1";
        el.src = ASSETS_FALLBACK + encodeURI(original);
    } else if (el.dataset.fallback === "1" && el.dataset.iniciais) {
        // Sem foto em lugar nenhum: mostra as iniciais
        el.dataset.fallback = "2";
        el.replaceWith(avatarIniciais(el.dataset.iniciais));
    }
}, true);

function avatarIniciais(iniciais) {
    const div = document.createElement("div");
    div.className = "w-full h-64 flex items-center justify-center bg-gradient-to-br from-[#8d5e81] to-[#682857] text-white text-5xl font-bold";
    div.style.fontFamily = "'Raleway', sans-serif";
    div.textContent = iniciais;
    return div;
}

function iniciaisDe(nome) {
    return nome
        .replace(/Prof(ª|\.)?\.?|Dr(ª|\.)?\.?|M(ª|\.)\.?/g, "")
        .trim()
        .split(/\s+/)
        .filter(p => p.length > 2)
        .slice(0, 2)
        .map(p => p[0].toUpperCase())
        .join("");
}

function escapar(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

function mostrarAviso(el, msg, tipo) {
    if (!el) return;
    el.className = "mt-2 rounded-lg px-4 py-3 text-sm " +
        (tipo === "ok" ? "bg-green-50 text-green-800" : tipo === "erro" ? "bg-red-50 text-red-800" : "bg-[#Ded9e2] text-[#682857]");
    el.textContent = msg;
    el.hidden = !msg;
}

/* ── Header e footer compartilhados ─────────────────────────── */
function incluirHTML(id, arquivo) {
    const alvo = document.getElementById(id);
    if (!alvo) return Promise.resolve();
    return fetch(arquivo)
        .then(r => {
            if (!r.ok) throw new Error("Erro ao carregar " + arquivo);
            return r.text();
        })
        .then(html => { alvo.innerHTML = html; })
        .catch(err => console.error(err));
}

function iniciarMenu() {
    const pagina = document.body.dataset.page;
    document.querySelectorAll("[data-page]").forEach(link => {
        if (link !== document.body && link.dataset.page === pagina) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });

    const botao = document.getElementById("menu-toggle");
    const menu = document.getElementById("mobile-menu");
    if (botao && menu) {
        botao.addEventListener("click", () => {
            const aberto = menu.classList.toggle("hidden") === false;
            botao.setAttribute("aria-expanded", String(aberto));
        });
    }

    // Se já existe sessão salva, o botão "Entrar" vira "Minha área"
    try {
        const logada = Object.keys(localStorage).some(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
        if (logada) {
            document.querySelectorAll('a[href="login.html"][data-page="login"]').forEach(a => {
                a.href = "area.html";
                a.dataset.page = "area";
                a.innerHTML = a.innerHTML.replace("Entrar", "Minha área");
                if (pagina === "area") a.classList.add("active");
            });
        }
    } catch (e) { /* navegador sem localStorage */ }

    if (["contato", "admin", "login", "area", "usuarios"].includes(pagina)) {
        document.getElementById("cta-contato")?.remove();
    }

    document.querySelectorAll("[data-ano]").forEach(el => {
        el.textContent = new Date().getFullYear();
    });
}

/* ── Animação ao rolar ──────────────────────────────────────── */
function animarAoRolar() {
    const elementos = document.querySelectorAll(".reveal:not(.visible)");
    if (!("IntersectionObserver" in window)) {
        elementos.forEach(el => el.classList.add("visible"));
        return;
    }
    const obs = new IntersectionObserver(entradas => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("visible");
                obs.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.12 });
    elementos.forEach(el => obs.observe(el));
}

/* ── Página Equipe ──────────────────────────────────────────── */
function cardPessoa(p) {
    const iniciais = iniciaisDe(p.nome);
    const foto = p.foto
        ? `<img src="${escapar(p.foto)}" alt="${escapar(p.nome)}" data-iniciais="${iniciais}" class="w-full h-64 object-cover" loading="lazy">`
        : avatarIniciais(iniciais).outerHTML;
    const links = [
        p.linkedin ? `<a href="${escapar(p.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn de ${escapar(p.nome)}" class="text-white hover:text-[#Ded9e2]"><i class="fab fa-linkedin text-xl"></i></a>` : "",
        p.email ? `<a href="mailto:${escapar(p.email)}" aria-label="E-mail de ${escapar(p.nome)}" class="text-white hover:text-[#Ded9e2]"><i class="fas fa-envelope text-xl"></i></a>` : ""
    ].join("");

    return `
    <div class="team-card reveal bg-white rounded-xl overflow-hidden shadow-md" tabindex="0">
        <div class="relative">
            ${foto}
            ${links ? `<div class="overlay flex items-end justify-center gap-4 pb-5">${links}</div>` : ""}
        </div>
        <div class="p-4 text-center">
            <h4 class="text-[#682857] font-bold leading-snug">${escapar(p.nome)}</h4>
            <p class="text-gray-600 text-sm mt-1">${escapar(p.cargo)}</p>
        </div>
    </div>`;
}

function renderEquipe() {
    const area = document.getElementById("equipe-conteudo");
    if (!area || typeof EQUIPE === "undefined") return;

    const grupos = [
        { id: "coordenacao", titulo: "Coordenação" },
        { id: "professora", titulo: "Professoras colaboradoras" },
        { id: "aluna", titulo: "Bolsistas e voluntárias" },
        { id: "ex-integrante", titulo: "Já passaram por aqui" }
    ];

    // Filtro de semestre (só para alunas)
    const semestres = [...new Set(EQUIPE.filter(p => p.semestre).map(p => p.semestre))].sort().reverse();
    const seletor = document.getElementById("filtro-semestre");
    if (seletor) {
        seletor.innerHTML = `<option value="">Todos os semestres</option>` +
            semestres.map(s => `<option value="${s}">${s}</option>`).join("");
    }

    function desenhar() {
        const categoria = document.querySelector("#filtros-equipe .filter-btn.active")?.dataset.filtro || "todos";
        const semestre = seletor ? seletor.value : "";

        area.innerHTML = grupos
            .filter(g => categoria === "todos" || g.id === categoria)
            .map(g => {
                let pessoas = EQUIPE.filter(p => p.categoria === g.id);
                if (semestre && (g.id === "aluna" || g.id === "ex-integrante")) {
                    pessoas = pessoas.filter(p => p.semestre === semestre);
                }
                if (!pessoas.length) {
                    return g.id === "ex-integrante" && categoria !== "ex-integrante" ? "" : `
                    <div class="mb-16 text-center">
                        <h3 class="text-2xl font-bold text-[#682857] mb-4">${g.titulo}</h3>
                        <p class="text-gray-500">Em breve.</p>
                    </div>`;
                }
                return `
                <div class="mb-16">
                    <h3 class="text-2xl font-bold text-[#682857] mb-8 text-center">${g.titulo}
                        <span class="text-base font-normal text-gray-500">(${pessoas.length})</span></h3>
                    <div class="flex flex-wrap justify-center gap-6">${pessoas.map(cardPessoa).join("")}</div>
                </div>`;
            }).join("");
        animarAoRolar();
    }

    document.querySelectorAll("#filtros-equipe .filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#filtros-equipe .filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            desenhar();
        });
    });
    if (seletor) seletor.addEventListener("change", desenhar);
    desenhar();
}

/* ── Página Projetos & Eventos ──────────────────────────────── */
function cardProjeto(p) {
    const capa = p.foto
        ? `<img src="${escapar(p.foto)}" alt="${escapar(p.titulo)}" class="w-full h-full object-cover" loading="lazy">`
        : `<div class="w-full h-full bg-gradient-to-r from-[#682857] to-[#8d5e81] flex items-center justify-center"><i class="fas ${escapar(p.icone || "fa-star")} text-6xl text-white"></i></div>`;
    const tags = (p.tags || []).map(t =>
        `<span class="bg-[#Ded9e2] text-[#682857] text-xs font-bold px-3 py-1 rounded-full">${escapar(t)}</span>`).join("");
    const link = p.link
        ? `<a href="${escapar(p.link)}" target="_blank" rel="noopener" class="inline-flex items-center text-[#682857] font-bold hover:underline mt-auto">
             Saiba mais
             <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
           </a>` : "";

    return `
    <article class="project-card reveal rounded-xl shadow-lg flex flex-col">
        <div class="relative h-56 overflow-hidden">
            ${capa}
            <span class="absolute top-3 left-3 bg-white text-[#682857] text-xs font-bold px-3 py-1 rounded-full shadow">${escapar(p.semestre)}</span>
            <span class="absolute top-3 right-3 bg-[#682857] text-white text-xs font-bold px-3 py-1 rounded-full shadow">${escapar(p.tipo)}</span>
        </div>
        <div class="p-6 flex flex-col flex-grow">
            <h3 class="text-xl font-bold mb-3 text-[#682857]">${escapar(p.titulo)}</h3>
            <p class="text-gray-600 mb-4">${escapar(p.descricao)}</p>
            <div class="flex flex-wrap gap-2 mb-5">${tags}</div>
            ${link}
        </div>
    </article>`;
}

/* ── Projetos publicados pelo painel de admin (Supabase) ────── */
function supabaseConfigurado() {
    return typeof SUPABASE_URL !== "undefined" && SUPABASE_URL && SUPABASE_ANON_KEY;
}

async function buscarProjetosPublicados() {
    if (!supabaseConfigurado()) return [];
    try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/projetos?select=*&publicado=eq.true&order=created_at.desc`, {
            headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
        });
        if (!r.ok) throw new Error(r.status);
        const linhas = await r.json();
        return linhas.map(l => ({
            titulo: l.titulo, semestre: l.semestre, tipo: l.tipo, descricao: l.descricao,
            tags: l.tags || [], link: l.link, foto: l.foto_url, icone: l.icone
        }));
    } catch (err) {
        console.error("Não foi possível carregar os projetos do Supabase:", err);
        return [];
    }
}

async function renderProjetos() {
    const area = document.getElementById("projetos-conteudo");
    if (!area) return;
    area.innerHTML = `<p class="text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Carregando…</p>`;

    const publicados = await buscarProjetosPublicados();
    const TODOS = [...publicados, ...(typeof PROJETOS !== "undefined" ? PROJETOS : [])];

    const filtros = document.getElementById("filtros-projetos");
    const tipos = [...new Set(TODOS.map(p => p.tipo))];
    if (filtros) {
        filtros.innerHTML = `<button class="filter-btn active px-5 py-2 rounded-full font-bold text-sm" data-filtro="todos">Todos</button>` +
            tipos.map(t => `<button class="filter-btn px-5 py-2 rounded-full font-bold text-sm" data-filtro="${escapar(t)}">${escapar(t)}</button>`).join("");
    }

    function desenhar() {
        const tipo = filtros?.querySelector(".filter-btn.active")?.dataset.filtro || "todos";
        const lista = TODOS.filter(p => tipo === "todos" || p.tipo === tipo);
        const semestres = [...new Set(lista.map(p => p.semestre))].sort().reverse();

        area.innerHTML = semestres.map(s => `
            <section class="mb-16">
                <div class="flex items-center gap-4 mb-8">
                    <span class="w-4 h-4 rounded-full bg-[#682857]"></span>
                    <h2 class="text-2xl font-bold text-[#682857]">${escapar(s)}</h2>
                    <span class="flex-1 h-px bg-[#D3d3d3]"></span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${lista.filter(p => p.semestre === s).map(cardProjeto).join("")}
                </div>
            </section>`).join("") || `<p class="text-center text-gray-500">Nenhum projeto encontrado.</p>`;
        animarAoRolar();
    }

    filtros?.addEventListener("click", e => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        filtros.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        desenhar();
    });
    desenhar();
}

/* ── Materiais: PDFs que ainda estão só na Vercel ───────────── */
function ajustarDownloads() {
    document.querySelectorAll('a[href^="assets/"][download]').forEach(link => {
        const caminho = link.getAttribute("href");
        fetch(caminho, { method: "HEAD" })
            .then(r => { if (!r.ok) throw new Error(); })
            .catch(() => { link.href = ASSETS_FALLBACK + encodeURI(caminho); link.removeAttribute("download"); link.target = "_blank"; });
    });
}

/* ── Formulário de contato ──────────────────────────────────── */
function iniciarFormulario() {
    const form = document.getElementById("form-contato");
    if (!form) return;
    const status = document.getElementById("form-status");
    const botao = form.querySelector('button[type="submit"]');

    function mostrar(msg, tipo) {
        status.className = "mt-4 rounded-lg px-4 py-3 text-sm " +
            (tipo === "ok" ? "bg-green-50 text-green-800" : tipo === "erro" ? "bg-red-50 text-red-800" : "bg-[#Ded9e2] text-[#682857]");
        status.textContent = msg;
        status.hidden = false;
    }

    form.addEventListener("submit", e => {
        e.preventDefault();
        if (!form.reportValidity()) return;

        const dados = Object.fromEntries(new FormData(form).entries());
        if (dados._honey) return; // robô

        dados._subject = `[Site WomanTech] Solicitação de ${dados.instituicao || dados.nome} — ${dados.cidade_uf}`;
        dados._replyto = dados.email;
        if (!dados.local_atividade) dados.local_atividade = "Não informado";
        botao.disabled = true;
        botao.classList.add("opacity-70");
        mostrar("Enviando sua mensagem…", "info");

        fetch(form.action, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(dados)
        })
            .then(r => r.json().then(j => ({ ok: r.ok, j })))
            .then(({ ok, j }) => {
                if (!ok || String(j.success) === "false") throw new Error(j.message || "Falha no envio");
                form.reset();
                mostrar("Solicitação enviada! Vamos montar uma proposta e responder no seu e-mail. 💜", "ok");
            })
            .catch(() => {
                mostrar("Não conseguimos enviar agora. Tente de novo ou escreva para womantech.fci@gmail.com.", "erro");
            })
            .finally(() => {
                botao.disabled = false;
                botao.classList.remove("opacity-70");
            });
    });
}

/* ── Início ─────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
    Promise.all([
        incluirHTML("header", "partials/header.html"),
        incluirHTML("footer", "partials/footer.html")
    ]).then(iniciarMenu);

    renderEquipe();
    renderProjetos();
    ajustarDownloads();
    iniciarFormulario();
    animarAoRolar();
});
