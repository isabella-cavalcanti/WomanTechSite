/*
 * PROJETOS & EVENTOS DO WOMANTECH
 * --------------------------------------------------------------
 * Para adicionar um novo, copie um bloco { ... } e coloque NO TOPO
 * da lista (os mais recentes primeiro).
 *
 *   semestre: "2026/2", "2026/1", ...
 *   tipo:     "Oficina" | "Evento" | "Curso" | "Visita" | "Parceria"
 *   foto:     caminho em assets/image/ (deixe "" para usar um ícone)
 *   icone:    ícone do Font Awesome usado quando não há foto
 *   link:     post, notícia ou página do projeto ("" se não tiver)
 */
const PROJETOS = [
    {
        titulo: "Curso: IA para Impulsionar Negócios Digitais",
        semestre: "2025/2",
        tipo: "Curso",
        foto: "assets/image/SecMulher.jpeg",
        descricao: "Em parceria com a Secretaria da Mulher, este projeto de 2 meses capacitou mulheres empreendedoras no universo digital. O curso abordou desde a modelagem de negócios (Canvas) e marketing (redes sociais) até o uso prático de plataformas de venda e ferramentas de Inteligência Artificial para impulsionar seus negócios no dia a dia.",
        tags: ["IA", "Secretaria da Mulher", "Empreendedorismo"],
        link: "https://www.linkedin.com/posts/cepac-barueri_cepacbarueri-womantech-inclusaetodigital-activity-7391092217030819840-VmD_"
    },
    {
        titulo: "Oficinas na ONG CEPAC 2025/02 e Visita à Equinix",
        semestre: "2025/2",
        tipo: "Visita",
        foto: "assets/image/Equinix.jpeg",
        descricao: "A 3ª turma de alunas do Cepac no projeto WomanTech finalizou o curso de tecnologia em parceria com a Faculdade de Computação e Informática do Mackenzie. A etapa foi encerrada com uma visita inspiradora à Equinix, onde as jovens exploraram o data center e o universo da inovação, cibersegurança e ciência de dados, reforçando a importância da presença feminina no setor.",
        tags: ["Educação", "Equinix", "Voluntário"],
        link: "https://www.linkedin.com/posts/cepac-barueri_cepacbarueri-womantech-inclusaetodigital-activity-7391092217030819840-VmD_"
    },
    {
        titulo: "WomanTech no WIT 2025",
        semestre: "2025/2",
        tipo: "Evento",
        foto: "assets/image/CSBC2025.jpg",
        descricao: "Nos dias 21 a 24 de julho de 2025, o WomanTech esteve presente no WIT – Women in Information Technology, evento integrado ao CSBC, realizado em Maceió (AL). O projeto foi convidado a apresentar suas ações como parte do Programa Meninas Digitais, iniciativa da Sociedade Brasileira de Computação. Marcilyanne Gois e Marina Martins compartilharam as ações realizadas e o impacto gerado, destacando as experiências e desafios enfrentados.",
        tags: ["CSBC2025", "Meninas Digitais", "WIT"],
        link: "https://www.linkedin.com/posts/cepac-barueri_cepacbarueri-womantech-tecnologiaparamulheres-activity-7320896242656468992-Qy6U"
    },
    {
        titulo: "Palestra: Segredos que Elas Guardam",
        semestre: "2025/1",
        tipo: "Evento",
        foto: "assets/image/post_alanis.jpeg",
        descricao: "No dia 07 de junho, foi realizada a palestra “Segredos que Elas Guardam: Introdução à Criptografia, Segurança Digital e Protagonismo Feminino”, ministrada por Alanis Urquisa na Fábrica de Cultura de São Bernardo do Campo. A palestra teve uma presença majoritária de mulheres, que tiveram o primeiro contato com os temas de Cibersegurança e criptografia.",
        tags: ["Criptografia", "Segurança Digital", "Cibersegurança"],
        link: "https://www.linkedin.com/posts/cepac-barueri_cepacbarueri-womantech-tecnologiaparamulheres-activity-7320896242656468992-Qy6U"
    },
    {
        titulo: "Oficinas na ONG CEPAC 2025/01",
        semestre: "2025/1",
        tipo: "Oficina",
        foto: "assets/image/CEPAC 2025-01.jpeg",
        descricao: "As alunas do projeto WomanTech ministraram oficinas para meninas de 13 a 17 anos da ONG CEPAC, em Barueri. Durante os encontros, foram trabalhados temas como inteligência artificial, segurança da informação, criptografia, pensamento computacional e introdução à programação. As oficinas tiveram como foco despertar o interesse pela tecnologia e promover o uso seguro e consciente do ambiente digital.",
        tags: ["Educação", "Programação", "Jovens"],
        link: "https://www.linkedin.com/posts/cepac-barueri_cepacbarueri-womantech-tecnologiaparamulheres-activity-7320896242656468992-Qy6U"
    },
    {
        titulo: "Parceria com Meninas Digitais",
        semestre: "2025/1",
        tipo: "Parceria",
        foto: "",
        icone: "fa-laptop",
        descricao: "No início de 2025, o projeto WomanTech se tornou oficialmente parceiro do Programa Meninas Digitais, da Sociedade Brasileira de Computação (SBC). Essa parceria fortalece nosso compromisso com a equidade de gênero na tecnologia, ampliando o alcance das nossas ações e conectando ainda mais meninas e mulheres ao universo da ciência, tecnologia, engenharia e matemática (STEM).",
        tags: ["Parceria Institucional", "SBC", "Mulheres na Tecnologia"],
        link: "https://meninas.sbc.org.br/projetos-parceiros/womantech/"
    }
];
