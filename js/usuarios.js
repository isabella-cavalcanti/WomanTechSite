/* WomanTech — página Usuários (só admin): papéis, grupo e permissões */
(async function () {
    const $ = id => document.getElementById(id);
    const eu = await Auth.exigir({ nivel: "admin" });
    if (!eu) return;
    const sb = Auth.sb;

    let usuarios = [];

    async function carregar() {
        $("lista-usuarios").innerHTML = `<p class="p-6 text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Carregando…</p>`;
        const { data, error } = await sb.from("perfis").select("*").order("criado_em", { ascending: false });
        if (error) {
            $("lista-usuarios").innerHTML = `<p class="p-6 text-red-700">Não foi possível carregar os usuários.</p>`;
            return;
        }
        usuarios = data;
        desenhar();
    }

    function linha(u) {
        const ehEu = u.user_id === eu.user_id;
        const papeis = Object.keys(NIVEIS).map(k =>
            `<option value="${k}" ${u.papel === k ? "selected" : ""}>${NOMES_PAPEL[k]}</option>`).join("");
        const perms = Object.entries(PERMISSOES).map(([k, nome]) => `
            <label class="inline-flex items-center gap-2 text-sm text-gray-700 mr-4 mb-1">
                <input type="checkbox" data-perm="${k}" ${(u.permissoes || []).includes(k) ? "checked" : ""} class="w-4 h-4 accent-[#682857]">${nome}
            </label>`).join("");
        const nome = u.nome || u.email.split("@")[0];
        return `
        <div class="p-6" data-user="${u.user_id}">
            <div class="flex flex-col md:flex-row md:items-center gap-4">
                <div class="w-11 h-11 rounded-full bg-gradient-to-br from-[#8d5e81] to-[#682857] text-white flex items-center justify-center font-bold shrink-0">${escapar(iniciaisDe(nome) || nome[0].toUpperCase())}</div>
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-[#682857] truncate">${escapar(nome)} ${ehEu ? `<span class="text-xs text-gray-400 font-normal">(você)</span>` : ""}</p>
                    <p class="text-sm text-gray-500 truncate">${escapar(u.email)} · desde ${new Date(u.criado_em).toLocaleDateString("pt-BR")}</p>
                </div>
                <div class="flex flex-col sm:flex-row gap-3">
                    <select data-campo="papel" class="form-field sm:!w-40" aria-label="Papel de ${escapar(nome)}">${papeis}</select>
                    <input data-campo="grupo" value="${escapar(u.grupo || "")}" maxlength="60" class="form-field sm:!w-48" placeholder="Grupo (opcional)" aria-label="Grupo de ${escapar(nome)}">
                </div>
            </div>
            <div class="mt-3 md:pl-[3.75rem] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>${perms}<p data-nota-admin class="hidden text-xs text-gray-400 mt-1">Admin já tem todas as permissões.</p></div>
                <div class="flex items-center gap-3">
                    <span data-status class="text-sm"></span>
                    <button data-salvar class="hidden bg-[#682857] text-white font-bold text-sm px-5 py-2 rounded-full hover:bg-[#8d5e81]"><i class="fas fa-check mr-1"></i>Salvar</button>
                </div>
            </div>
        </div>`;
    }

    function desenhar() {
        const busca = $("busca").value.trim().toLowerCase();
        const papel = $("filtro-papel").value;
        const lista = usuarios.filter(u =>
            (!papel || u.papel === papel) &&
            (!busca || (u.nome || "").toLowerCase().includes(busca) || u.email.toLowerCase().includes(busca)));
        $("contagem").dataset.mostrando = lista.length;
        contar();
        $("lista-usuarios").innerHTML = lista.length ? lista.map(linha).join("")
            : `<p class="p-6 text-gray-500">Ninguém encontrado.</p>`;
        document.querySelectorAll("#lista-usuarios [data-user]").forEach(ajustarPermissoes);
    }

    function contar() {
        const nomes = { aluna: ["aluna", "alunas"], integrante: ["integrante", "integrantes"], lider: ["team líder", "team líderes"], admin: ["admin", "admins"] };
        const porPapel = Object.keys(NIVEIS).map(k => {
            const n = usuarios.filter(u => u.papel === k).length;
            return `${n} ${nomes[k][n === 1 ? 0 : 1]}`;
        }).join(" · ");
        $("contagem").textContent = `${$("contagem").dataset.mostrando} de ${usuarios.length} contas — ${porPapel}`;
    }

    function ajustarPermissoes(el) {
        const admin = el.querySelector('[data-campo="papel"]').value === "admin";
        el.querySelectorAll("[data-perm]").forEach(c => { c.disabled = admin; c.closest("label").classList.toggle("opacity-40", admin); });
        el.querySelector("[data-nota-admin]").classList.toggle("hidden", !admin);
    }

    function lerLinha(el) {
        return {
            papel: el.querySelector('[data-campo="papel"]').value,
            grupo: el.querySelector('[data-campo="grupo"]').value.trim() || null,
            permissoes: [...el.querySelectorAll("[data-perm]:checked")].map(c => c.dataset.perm)
        };
    }

    function mudou(u, d) {
        return u.papel !== d.papel || (u.grupo || null) !== d.grupo ||
            [...(u.permissoes || [])].sort().join() !== [...d.permissoes].sort().join();
    }

    $("lista-usuarios").addEventListener("input", e => {
        const el = e.target.closest("[data-user]");
        if (!el) return;
        const u = usuarios.find(x => x.user_id === el.dataset.user);
        ajustarPermissoes(el);
        el.querySelector("[data-salvar]").classList.toggle("hidden", !mudou(u, lerLinha(el)));
        el.querySelector("[data-status]").textContent = "";
    });

    $("lista-usuarios").addEventListener("click", async e => {
        const btn = e.target.closest("[data-salvar]");
        if (!btn) return;
        const el = btn.closest("[data-user]");
        const status = el.querySelector("[data-status]");
        const dados = lerLinha(el);
        btn.disabled = true;
        const { error } = await sb.from("perfis").update(dados).eq("user_id", el.dataset.user);
        btn.disabled = false;
        if (error) {
            status.className = "text-sm text-red-700";
            status.textContent = /última administradora/.test(error.message || "")
                ? "Não dá para remover a última admin." : "Não foi possível salvar.";
            return;
        }
        Object.assign(usuarios.find(x => x.user_id === el.dataset.user), dados);
        contar();
        btn.classList.add("hidden");
        status.className = "text-sm text-green-700";
        status.innerHTML = `<i class="fas fa-check mr-1"></i>Salvo`;
        if (el.dataset.user === eu.user_id && dados.papel !== "admin") location.replace("area.html");
    });

    $("busca").addEventListener("input", desenhar);
    $("filtro-papel").addEventListener("change", desenhar);
    carregar();
})();
