# Product Requirements Document (PRD)
## Projeto Tocantins Integrado - MVP v1.0

**Autor:** Manus AI (em colaboração com Henrique M. Ribeiro)
**Versão:** 1.0
**Data:** 05 de janeiro de 2026

---

## 1. Visão Geral e Estratégia

### 1.1. O Problema

Durante um período eleitoral, candidatos e suas equipes precisam de acesso rápido, confiável e detalhado a dados socioeconômicos para formular propostas, construir narrativas e responder a questionamentos em tempo real (comícios, debates, entrevistas). Ferramentas tradicionais são lentas, caras e não oferecem análises multidimensionais em linguagem natural, criando uma lacuna entre dados brutos e inteligência acionável.

### 1.2. A Solução: MVP Tocantins Integrado

O MVP do Tocantins Integrado é uma **plataforma de superinteligência territorial** que serve como um "assessor de dados" para a campanha da Senadora ao governo do estado. Ele fornece diagnósticos multidimensionais de municípios e microrregiões do Tocantins através de uma interface de conversação (Dashboard e WhatsApp), transformando dados complexos em insights estratégicos.

### 1.3. Posicionamento Estratégico

- **Para a Campanha:** Uma ferramenta de propaganda e de suporte à decisão, demonstrando inovação e capacidade de gestão baseada em dados.
- **Para a Gestão Futura:** O embrião de um sistema de governança digital para o estado.
- **Para a Pesquisa de Doutorado:** Um estudo de caso de pesquisa-ação sobre a introdução e adoção de tecnologia de IA na gestão pública.

---

## 2. Contexto da Pesquisa de Doutorado

Este projeto é o objeto central de uma tese de doutorado que utiliza a metodologia de **pesquisa-ação**. O objetivo é registrar e analisar o processo de apresentação, desenvolvimento e eventual incorporação desta tecnologia na gestão do estado do Tocantins.

### 2.1. Pergunta de Pesquisa Central

> Como um sistema de superinteligência territorial, co-criado através da pesquisa-ação, pode transformar a formulação de políticas públicas e a governança em um estado brasileiro, e quais são as implicações desse processo para a gestão pública e para a colaboração humano-IA?

### 2.2. Protocolo de Pesquisa-Ação

Para garantir o rigor necessário para publicações de alto impacto, o projeto seguirá os seguintes princípios metodológicos:

| Princípio Metodológico | Como Será Aplicado no Projeto |
| :--- | :--- |
| **Ciclos de Pesquisa-Ação** [1] | Cada fase do projeto (PRD, Setup, Build, Deploy) será um ciclo explícito de **Planejar, Agir, Observar e Refletir**. |
| **Continuidade Histórica** [2] | Os **diários de pesquisa-ação** de todas as sessões (incluindo as 15+ anteriores) serão a espinha dorsal da narrativa da tese. |
| **Reflexividade** [2] | Ao final de cada sessão, faremos um balanço reflexivo, documentando não apenas *o que* foi feito, mas *por que* foi feito e o papel do pesquisador nas decisões. |
| **Dialética** [2] | Documentaremos ativamente as interações e feedbacks da Senadora e sua equipe, contrastando a visão técnica com a necessidade política. |
| **Trabalhabilidade** [2] | O sucesso do MVP em ser útil para a campanha será a principal evidência da "trabalhabilidade" da solução. |
| **Validade de Processo** [3] | Manteremos um "diário de decisões" para auditar o processo de desenvolvimento e as escolhas feitas. |

---

## 3. Requisitos do Produto

### 3.1. Personas de Usuário

| Persona | Descrição | Necessidades Principais |
| :--- | :--- | :--- |
| **A Senadora (Usuária Primária)** | Candidata ao governo, precisa de dados confiáveis e análises rápidas para discursos, debates e entrevistas. | Acesso via WhatsApp (voz e texto), respostas em linguagem natural, análises comparativas e multidimensionais. |
| **A Equipe de Campanha (Usuários Secundários)** | Coordenadores, marqueteiros, redatores de discursos. Precisam de dados para construir o plano de governo e materiais de campanha. | Acesso via Dashboard, capacidade de exportar dados e análises, comparação de microrregiões. |
| **O Pesquisador (Você)** | Doutorando, precisa que o processo e o produto gerem dados válidos para a tese. | Documentação rigorosa, aderência à metodologia, dados de uso do sistema. |

### 3.2. Épicos e User Stories

**Épico 1: Análise de Território**
- **Como Senadora,** quero consultar os indicadores de um município para entender seus pontos fortes e fracos.
- **Como equipe,** quero um resumo da análise dimensional de um município para incluir no plano de governo.

**Épico 2: Análise Comparativa**
- **Como Senadora,** quero comparar os indicadores de dois municípios para preparar um debate.
- **Como equipe,** quero comparar as microrregiões do Bico do Papagaio e do Sudeste para definir estratégias de campanha diferentes.

**Épico 3: Acesso via WhatsApp**
- **Como Senadora,** quero enviar uma pergunta por áudio no WhatsApp e receber uma resposta em texto para usar em uma entrevista.
- **Como Senadora,** quero digitar uma pergunta simples no WhatsApp e receber uma resposta imediata.

**Épico 4: Navegação via Dashboard**
- **Como equipe,** quero um dashboard visual para navegar pelos municípios e indicadores, com um mapa interativo do Tocantins.
- **Como equipe,** quero poder conversar com a IA diretamente no dashboard para aprofundar a análise.

### 3.3. Funcionalidades Essenciais (MVP)

| ID | Funcionalidade | Prioridade | User Stories Associadas |
| :--- | :--- | :--- | :--- |
| F-01 | Consulta de indicadores de um município | **Crítica** | Épico 1 |
| F-02 | Análise dimensional resumida | **Crítica** | Épico 1 |
| F-03 | Análise comparativa (2 municípios/microrregiões) | **Crítica** | Épico 2 |
| F-04 | Dashboard web com mapa e IA integrada | **Crítica** | Épico 4 |
| F-05 | Integração WhatsApp (consulta por texto) | **Crítica** | Épico 3 |
| F-06 | Integração WhatsApp (consulta por voz) | **Alta** | Épico 3 |
| F-07 | Análise multidimensional (1 município, N dimensões) | **Alta** | Épico 1, 2 |
| F-08 | Exportação de análises (PDF/Texto) | **Média** | Épico 4 |

### 3.4. Requisitos Não-Funcionais

| Categoria | Requisito | Métrica de Sucesso |
| :--- | :--- | :--- |
| **Performance** | Respostas a consultas simples (WhatsApp/Dashboard) devem ser < 3 segundos. | 95% das consultas atendidas em < 3s. |
| **Confiabilidade** | O sistema deve ter 99% de uptime durante o período da campanha. | Menos de 4 horas de downtime por mês. |
| **Segurança** | As conversas e dados de uso devem ser confidenciais. | Acesso restrito à equipe autorizada. |
| **Escalabilidade** | A arquitetura deve suportar a adição de novos estados e agentes no futuro. | O design deve prever a inclusão de `state_id` e `country_id` nas tabelas. |
| **Usabilidade** | A interface (Dashboard e WhatsApp) deve ser intuitiva para usuários não-técnicos. | Um novo usuário da equipe deve conseguir fazer uma consulta com < 1 minuto de treinamento. |

---

## 4. Roadmap e Milestones

**Prazo Alvo do MVP:** Início da campanha eleitoral de 2026.

| Milestone | Duração Estimada | Entregáveis Principais | Critério de Sucesso |
| :--- | :--- | :--- | :--- |
| **M1: Setup e Planejamento** | 2 semanas | - Novo repositório GitHub criado.<br>- PRD e Plano de Projeto validados.<br>- Diários de pesquisa-ação migrados.<br>- Ambiente de desenvolvimento (n8n, Replit, Supabase) configurado. | Ambiente 100% funcional e documentado. |
| **M2: Núcleo de Dados e Agentes** | 4 semanas | - Banco de dados no Supabase populado.<br>- 4 agentes dimensionais (ECON, SOCIAL, TERRA, AMBIENT) e Orquestrador migrados e validados.<br>- Testes unitários para cada agente. | Agentes capazes de gerar análises simples e multidimensionais via API. |
| **M3: Interface e Interação** | 4 semanas | - Dashboard web básico com mapa e chat.<br>- Integração do Dashboard com o backend dos agentes.<br>- Integração com WhatsApp (texto e voz) via Evolution API. | Usuário consegue fazer uma consulta completa pelo Dashboard e pelo WhatsApp. |
| **M4: Testes e Validação** | 2 semanas | - Testes de ponta-a-ponta.<br>- Sessão de validação com usuários-piloto (equipe da campanha).<br>- Documentação final do usuário. | Sistema validado pela equipe da Senadora como "pronto para uso na campanha". |

---

## 5. Métricas de Sucesso

### 5.1. Sucesso do Produto (MVP)

- **Engajamento:** Nº de consultas realizadas pela equipe durante a campanha.
- **Qualidade:** Feedback qualitativo da Senadora e equipe sobre a utilidade das análises.
- **Confiabilidade:** Uptime do sistema e tempo de resposta dentro dos SLAs definidos.

### 5.2. Sucesso da Pesquisa (Doutorado)

- **Rigor Metodológico:** Aderência aos 5 critérios de Heikkinen et al. e aos critérios de Herr & Anderson, validada através dos diários de pesquisa-ação.
- **Coleta de Dados:** Qualidade e profundidade dos registros reflexivos e das evidências coletadas em cada ciclo.
- **Publicação:** Submissão de pelo menos um artigo para um periódico de alto impacto (e.g., *Action Research*, *Government Information Quarterly*).

---

## 6. Referências

[1] Tripp, D. (2005). Pesquisa-ação: uma introdução metodológica. *Educação e Pesquisa*, 31(3), 443-466.
[2] Heikkinen, H. L., Huttunen, R., & Syrjälä, L. (2007). Action research as narrative: Five principles for validation. *Educational Action Research*, 15(1), 5-19.
[3] Herr, K., & Anderson, G. L. (2015). *The Action Research Dissertation: A Guide for Students and Faculty* (2nd ed.). SAGE Publications.
