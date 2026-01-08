# Glossário

**Tocantins Integrado - Termos e Definições**

---

## Índice

- [A](#a) | [B](#b) | [C](#c) | [D](#d) | [E](#e) | [F](#f) | [G](#g) | [H](#h) | [I](#i)
- [J](#j) | [K](#k) | [L](#l) | [M](#m) | [N](#n) | [O](#o) | [P](#p) | [Q](#q) | [R](#r)
- [S](#s) | [T](#t) | [U](#u) | [V](#v) | [W](#w)

---

## A

### ADR (Architecture Decision Record)
Registro formal de decisões arquiteturais ou de negócio importantes, documentando contexto, alternativas e consequências. Ver `.governance/decisions/`.

### Agente Dimensional
Componente de IA especializado em analisar indicadores de uma dimensão específica (ECON, SOCIAL, TERRA, AMBIENT).

### AMBIENT
Dimensão ambiental do sistema, cobrindo vegetação, conservação, recursos hídricos e gestão ambiental.

### API (Application Programming Interface)
Interface de programação que permite comunicação entre sistemas. O Tocantins Integrado consome APIs do IBGE, SICONFI, DataSUS, etc.

### APP (Área de Preservação Permanente)
Áreas protegidas pelo Código Florestal, como margens de rios e topos de morros.

### Atlas Brasil
Portal que disponibiliza dados do IDHM e outros indicadores de desenvolvimento humano. Fonte: PNUD/IPEA/FJP.

---

## B

### BaseAgent
Classe abstrata base de que todos os agentes dimensionais herdam. Define interface comum de processamento.

### Bioma
Conjunto de ecossistemas com características semelhantes. Tocantins possui Cerrado (91%) e Amazônia (9%).

### BPC (Benefício de Prestação Continuada)
Benefício assistencial para idosos e pessoas com deficiência. Indicador de vulnerabilidade social.

### Bolsa Família
Programa de transferência de renda. Número de famílias beneficiárias é indicador de vulnerabilidade.

---

## C

### CAR (Cadastro Ambiental Rural)
Registro eletrônico obrigatório para imóveis rurais. Fonte de dados sobre APPs e Reserva Legal.

### CadÚnico
Cadastro Único para Programas Sociais. Famílias cadastradas indicam potencial vulnerabilidade.

### CEO (Chief Executive Officer)
No framework de governança, o papel humano responsável por visão, prioridades e decisões finais.

### Cerrado
Segundo maior bioma brasileiro, conhecido como "berço das águas". 91% do território tocantinense.

### Coletor
Componente de software responsável por coletar dados de uma fonte específica (ex: IBGESidraCollector).

### COMEX Stat
Sistema de estatísticas de comércio exterior do MDIC. Fonte para dados de exportação/importação.

### CTO (Chief Technology Officer)
No framework de governança, papel de IA responsável por arquitetura e especificações técnicas.

---

## D

### DataSUS
Departamento de Informática do SUS. Fonte de dados de saúde (mortalidade, internações, etc.).

### DCA (Declaração de Contas Anuais)
Declaração contábil dos entes federativos ao SICONFI. Fonte de dados fiscais municipais.

### Desmatamento
Remoção de vegetação nativa. Taxa medida pelo PRODES/INPE e MapBiomas.

### Dev Team
No framework de governança, papel de IA responsável por implementação de código.

### Dimensão
Eixo temático de análise: ECON (econômico), SOCIAL, TERRA (territorial), AMBIENT (ambiental).

---

## E

### ECON
Dimensão econômica, cobrindo PIB, emprego, renda e finanças públicas.

### e-Gestor AB
Sistema do Ministério da Saúde para gestão da Atenção Básica. Fonte de dados de cobertura ESF.

### ESF (Estratégia Saúde da Família)
Modelo de atenção primária à saúde. Cobertura ESF é indicador-chave de acesso à saúde.

---

## F

### FJP (Fundação João Pinheiro)
Instituição de pesquisa de Minas Gerais. Fonte de dados de déficit habitacional.

### FPM (Fundo de Participação dos Municípios)
Principal transferência federal para municípios. Alta dependência indica fragilidade fiscal.

---

## G

### GPT-4 Turbo
Modelo de linguagem da OpenAI usado pelos agentes dimensionais para gerar análises.

### Governança
Framework de trabalho com múltiplas IAs em papéis organizacionais. Ver `.governance/`.

---

## H

### Handoff
Transferência formal de contexto e responsabilidade entre papéis/sessões no framework de governança.

---

## I

### IBGE (Instituto Brasileiro de Geografia e Estatística)
Principal fonte de dados estatísticos do Brasil. Fornece PIB, população, censos.

### IBGE Sidra
Sistema de recuperação de dados do IBGE via API. Acesso a tabelas de PIB, população, etc.

### ICMBio (Instituto Chico Mendes)
Autarquia responsável por Unidades de Conservação federais.

### IDEB (Índice de Desenvolvimento da Educação Básica)
Indicador de qualidade educacional calculado pelo INEP. Combina fluxo e aprendizagem.

### IDHM (Índice de Desenvolvimento Humano Municipal)
Indicador sintético de desenvolvimento (longevidade, educação, renda). Escala 0-1.

### INEP (Instituto Nacional de Estudos e Pesquisas Educacionais)
Autarquia do MEC. Fonte de dados educacionais (IDEB, matrículas, etc.).

### INPE (Instituto Nacional de Pesquisas Espaciais)
Instituto responsável pelo monitoramento de desmatamento (PRODES) e queimadas.

### Indicador
Medida quantitativa ou qualitativa de um aspecto do desenvolvimento territorial.

---

## J

### Jalapão
Região do leste tocantinense, conhecida pelas paisagens do Cerrado preservado. Destino ecoturístico.

---

## L

### LLM (Large Language Model)
Modelo de linguagem de grande escala, como GPT-4, usado para gerar análises textuais.

---

## M

### MapBiomas
Projeto colaborativo de mapeamento do uso do solo no Brasil. Fonte de dados de vegetação.

### MDIC (Ministério do Desenvolvimento, Indústria e Comércio)
Ministério responsável pelo COMEX Stat (dados de comércio exterior).

### MDS (Ministério do Desenvolvimento Social)
Ministério responsável por programas sociais (Bolsa Família, BPC, CadÚnico).

### Microrregião
Agrupamento de municípios com características socioeconômicas semelhantes.

### MVP (Minimum Viable Product)
Produto Mínimo Viável. Versão inicial do sistema com funcionalidades essenciais.

---

## N

### n8n
Plataforma de automação de workflows. Usada para orquestrar coletas e análises.

---

## O

### ODS (Objetivos de Desenvolvimento Sustentável)
17 objetivos da ONU para desenvolvimento sustentável até 2030. Referência para metas.

### Orquestrador
Componente que coordena análises entre múltiplos agentes dimensionais.

---

## P

### Palmas
Capital do Tocantins (código IBGE: 1721000). Município-piloto para testes.

### PIB (Produto Interno Bruto)
Soma de todos os bens e serviços produzidos. Principal indicador econômico.

### PIB per capita
PIB dividido pela população. Indica renda média por habitante.

### PLANSAB
Plano Nacional de Saneamento Básico. Define metas de universalização.

### PNE (Plano Nacional de Educação)
Plano decenal de educação com metas para o IDEB e outros indicadores.

### PRODES
Projeto de Monitoramento do Desmatamento na Amazônia Legal por Satélite (INPE).

### PSA (Pagamento por Serviços Ambientais)
Mecanismo de remuneração pela conservação ambiental.

---

## R

### RAIS (Relação Anual de Informações Sociais)
Registro administrativo de emprego formal. Fonte de dados de emprego e salários.

### REDD+
Mecanismo de redução de emissões por desmatamento e degradação florestal.

### Reserva Legal
Área de vegetação nativa que deve ser mantida em propriedades rurais.

---

## S

### SICONFI
Sistema de Informações Contábeis e Fiscais do Setor Público Brasileiro. Fonte de dados fiscais.

### SIM (Sistema de Informações sobre Mortalidade)
Sistema do DataSUS com dados de óbitos. Fonte de mortalidade infantil.

### SNIS (Sistema Nacional de Informações sobre Saneamento)
Sistema do MDR com dados de água, esgoto e resíduos sólidos.

### SOCIAL
Dimensão social, cobrindo educação, saúde, assistência social e desenvolvimento humano.

### Supabase
Plataforma de banco de dados PostgreSQL usada como backend do sistema.

---

## T

### TERRA
Dimensão territorial, cobrindo infraestrutura, saneamento, habitação e conectividade.

### Tocantins
Estado brasileiro criado em 1988. 139 municípios. Área: 277.720 km².

### TypeScript
Linguagem de programação tipada baseada em JavaScript, usada no desenvolvimento.

---

## U

### UC (Unidade de Conservação)
Área protegida por legislação específica (parques, reservas, etc.).

---

## V

### VA (Valor Adicionado)
Diferença entre valor da produção e consumo intermediário. Base do PIB setorial.

### Vegetação Nativa
Cobertura vegetal original, não alterada por atividade humana.

### Vulnerabilidade Social
Condição de risco social, medida por indicadores como CadÚnico e Bolsa Família.

---

## W

### Workflow
Fluxo de trabalho automatizado, geralmente implementado em n8n.

---

## Siglas por Área

### Economia
| Sigla | Significado |
|-------|-------------|
| PIB | Produto Interno Bruto |
| VA | Valor Adicionado |
| FPM | Fundo de Participação dos Municípios |
| RAIS | Relação Anual de Informações Sociais |
| CAGED | Cadastro Geral de Empregados e Desempregados |

### Social
| Sigla | Significado |
|-------|-------------|
| IDEB | Índice de Desenvolvimento da Educação Básica |
| IDHM | Índice de Desenvolvimento Humano Municipal |
| ESF | Estratégia Saúde da Família |
| BPC | Benefício de Prestação Continuada |

### Territorial
| Sigla | Significado |
|-------|-------------|
| SNIS | Sistema Nacional de Informações sobre Saneamento |
| PLANSAB | Plano Nacional de Saneamento Básico |

### Ambiental
| Sigla | Significado |
|-------|-------------|
| UC | Unidade de Conservação |
| TI | Terra Indígena |
| APP | Área de Preservação Permanente |
| CAR | Cadastro Ambiental Rural |
| REDD+ | Redução de Emissões por Desmatamento |

### Fontes de Dados
| Sigla | Significado |
|-------|-------------|
| IBGE | Instituto Brasileiro de Geografia e Estatística |
| INEP | Instituto Nacional de Estudos e Pesquisas Educacionais |
| INPE | Instituto Nacional de Pesquisas Espaciais |
| DataSUS | Departamento de Informática do SUS |
| SICONFI | Sistema de Informações Contábeis e Fiscais |

---

## Referências Externas

| Fonte | URL |
|-------|-----|
| IBGE | https://www.ibge.gov.br |
| INEP | https://www.gov.br/inep |
| DataSUS | https://datasus.saude.gov.br |
| SICONFI | https://siconfi.tesouro.gov.br |
| SNIS | http://www.snis.gov.br |
| MapBiomas | https://mapbiomas.org |
| Atlas Brasil | http://www.atlasbrasil.org.br |

---

*Última atualização: Janeiro 2026*
