/* WomanTech — página de login (entrar, criar conta, recuperar senha) */
(async function () {
    const $ = id => document.getElementById(id);
    if (!Auth.configurado) {
        Auth.telaAviso("fa-plug", "Login ainda não conectado",
            "Preencha <code>js/config.js</code> com os dados do Supabase e rode <code>supabase/setup.sql</code>. O passo a passo está no README.");
        return;
    }
    const sb = Auth.sb;

    // Só aceita voltar para páginas do próprio site (evita redirecionar para fora)
    const pedido = new URLSearchParams(location.search).get("volta") || "";
    const volta = /^[a-z0-9-]+\.html(\?[\w=&-]*)?$/i.test(pedido) ? pedido : "area.html";

    let recuperando = false;
    sb.auth.onAuthStateChange(evento => {
        if (evento === "PASSWORD_RECOVERY") {
            recuperando = true;
            mostrarForm("form-nova-senha");
        }
    });

    function mostrarForm(id) {
        ["form-entrar", "form-criar", "form-nova-senha"].forEach(f => $(f).classList.toggle("hidden", f !== id));
        $("abas").classList.toggle("hidden", id === "form-nova-senha");
        document.querySelectorAll(".aba").forEach(b => {
            const ativa = (b.dataset.aba === "entrar" && id === "form-entrar") || (b.dataset.aba === "criar" && id === "form-criar");
            b.classList.toggle("text-[#682857]", ativa);
            b.classList.toggle("border-[#682857]", ativa);
            b.classList.toggle("text-gray-400", !ativa);
            b.classList.toggle("border-transparent", !ativa);
            b.setAttribute("aria-selected", String(ativa));
        });
    }

    document.querySelectorAll(".aba").forEach(b =>
        b.addEventListener("click", () => mostrarForm(b.dataset.aba === "criar" ? "form-criar" : "form-entrar")));
    if (location.hash === "#criar") mostrarForm("form-criar");

    // Já está logada? Vai direto (a não ser que esteja trocando a senha)
    setTimeout(async () => {
        if (!recuperando && await Auth.perfil()) location.replace(volta);
    }, 0);

    /* Entrar */
    $("form-entrar").addEventListener("submit", async e => {
        e.preventDefault();
        if (!e.target.reportValidity()) return;
        const st = $("status-entrar");
        mostrarAviso(st, "Entrando…", "info");
        const { error } = await sb.auth.signInWithPassword({ email: $("e-email").value.trim(), password: $("e-senha").value });
        if (error) {
            const naoConfirmado = /confirm/i.test(error.message || "");
            return mostrarAviso(st, naoConfirmado ? "Confirme seu e-mail pelo link que enviamos antes de entrar." : "E-mail ou senha incorretos.", "erro");
        }
        location.replace(volta);
    });

    $("btn-esqueci").addEventListener("click", async () => {
        const st = $("status-entrar");
        const email = $("e-email").value.trim();
        if (!email) return mostrarAviso(st, "Digite seu e-mail acima e clique de novo em \"Esqueci minha senha\".", "info");
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.href.split(/[?#]/)[0] });
        mostrarAviso(st, error ? "Não foi possível enviar o e-mail agora. Tente de novo em alguns minutos."
            : "Se este e-mail tiver conta, você vai receber um link para criar uma nova senha.", error ? "erro" : "ok");
    });

    /* Criar conta */
    $("form-criar").addEventListener("submit", async e => {
        e.preventDefault();
        const st = $("status-criar");
        if ($("c-senha").value !== $("c-senha2").value) {
            $("c-senha2").setCustomValidity("As senhas não são iguais.");
        } else {
            $("c-senha2").setCustomValidity("");
        }
        if (!e.target.reportValidity()) return;

        mostrarAviso(st, "Criando sua conta…", "info");
        const { data, error } = await sb.auth.signUp({
            email: $("c-email").value.trim(),
            password: $("c-senha").value,
            options: {
                data: { nome: $("c-nome").value.trim(), consentimento: "true" },
                emailRedirectTo: location.href.split(/[?#]/)[0]
            }
        });
        if (error) {
            const msg = /already|registered/i.test(error.message || "") ? "Este e-mail já tem conta. Use a aba Entrar."
                : /password/i.test(error.message || "") ? "Escolha uma senha mais forte (mínimo 8 caracteres)."
                : "Não foi possível criar a conta agora. Tente de novo.";
            return mostrarAviso(st, msg, "erro");
        }
        if (data.session) return location.replace(volta);
        e.target.reset();
        mostrarAviso(st, "Conta criada! Enviamos um link de confirmação para o seu e-mail. Depois de confirmar, é só entrar.", "ok");
    });
    $("c-senha2").addEventListener("input", () => $("c-senha2").setCustomValidity(""));

    /* Nova senha */
    $("form-nova-senha").addEventListener("submit", async e => {
        e.preventDefault();
        if (!e.target.reportValidity()) return;
        const { error } = await sb.auth.updateUser({ password: $("n-senha").value });
        if (error) return mostrarAviso($("status-nova"), "Não foi possível salvar a senha. Tente de novo.", "erro");
        location.replace("area.html");
    });
})();
