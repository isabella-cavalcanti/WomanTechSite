/*
 * EQUIPE DO WOMANTECH
 * --------------------------------------------------------------
 * Para adicionar alguém, copie um bloco { ... } e preencha.
 *
 *   categoria: "coordenacao" | "professora" | "aluna" | "ex-integrante"
 *   semestre:  só para alunas e ex-integrantes (ex.: "2026/2")
 *   foto:      caminho da foto em assets/image/ (deixe "" se não tiver;
 *              aparecem as iniciais no lugar)
 *   linkedin / email: deixe "" se não tiver
 *
 * Quando a aluna sair do projeto, troque a categoria para
 * "ex-integrante" — ela passa a aparecer em "Já passaram por aqui".
 */
const EQUIPE = [
    {
        nome: "Profª. Drª. Marcilyanne Moreira Gois",
        cargo: "Coordenadora e fundadora",
        categoria: "coordenacao",
        foto: "assets/image/Marcilyanne.jpg",
        linkedin: "https://www.linkedin.com/in/marcilyanne-gois-287366126/",
        email: "marcillyanne.gois@mackenzie.br"
    },

    // ── Professoras colaboradoras ──────────────────────────────
    {
        nome: "Profª. Drª. Daniela Vieira Cunha",
        cargo: "Diretora",
        categoria: "professora",
        foto: "assets/image/Daniela.jpg",
        linkedin: "https://www.linkedin.com/in/daniela-cunha-87b2833/",
        email: "daniela.cunha@mackenzie.br"
    },
    {
        nome: "Profª. Drª. Andreia Cristina do Santos Gusmão",
        cargo: "Professora",
        categoria: "professora",
        foto: "assets/image/Andreia.jpeg",
        linkedin: "https://www.linkedin.com/in/andreia-gusmao-1rth5r/",
        email: "andreia.gusmao@mackenzie.br"
    },
    {
        nome: "Profª. Drª. Carolina Toledo Ferraz",
        cargo: "Professora",
        categoria: "professora",
        foto: "assets/image/Carolina.jpg",
        linkedin: "https://www.linkedin.com/in/carolina-ferraz-a5a9558/",
        email: "carolina.ferraz@mackenzie.br"
    },
    {
        nome: "Profª. Drª. Cristiane Camilo Hernandez",
        cargo: "Professora",
        categoria: "professora",
        foto: "assets/image/Cristiane.jpeg",
        linkedin: "https://www.linkedin.com/in/cristiane-hernandez-874a72144/",
        email: "cristiane.hernandez@mackenzie.br"
    },
    {
        nome: "Profª. Drª. Débora Bezerra Linhares Libório",
        cargo: "Professora",
        categoria: "professora",
        foto: "assets/image/Debora.jpg",
        linkedin: "https://www.linkedin.com/in/d%C3%A9bora-bezerra-lib%C3%B3rio-a9aa9b93/",
        email: "debora.liborio@mackenzie.br"
    },
    {
        nome: "Profª. Mª. Patricia Bonezi Nunes da Mota",
        cargo: "Professora",
        categoria: "professora",
        foto: "assets/image/Patricia.png",
        linkedin: "https://www.linkedin.com/in/patricia-mota-msc-a28247/",
        email: "patricia.mota@mackenzie.br"
    },

    // ── Bolsistas e voluntárias ────────────────────────────────
    {
        nome: "Glenda Miléo Trigo",
        cargo: "Bolsista",
        categoria: "aluna",
        semestre: "2026/2",
        foto: "assets/image/Glenda.jpeg",
        linkedin: "https://www.linkedin.com/in/glenda-mil%C3%A9o-trigo-53594b204/",
        email: ""
    },
    {
        nome: "Júlia Leite Furlan",
        cargo: "Bolsista",
        categoria: "aluna",
        semestre: "2026/2",
        foto: "assets/image/Júlia.jpeg",
        linkedin: "https://www.linkedin.com/in/julia-leite-furlan/",
        email: ""
    },
    {
        nome: "Marina Lucas Martins",
        cargo: "Bolsista",
        categoria: "aluna",
        semestre: "2026/2",
        foto: "assets/image/Marina.jpeg",
        linkedin: "https://www.linkedin.com/in/marinalucasmartins/",
        email: ""
    }

    // Exemplo de voluntária (tire as barras // para usar):
    // ,{
    //     nome: "Nome Sobrenome",
    //     cargo: "Team leader · Site e app WomanTech",
    //     categoria: "aluna",
    //     semestre: "2026/2",
    //     foto: "",
    //     linkedin: "",
    //     email: ""
    // }
];
