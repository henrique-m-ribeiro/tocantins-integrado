# Registos de Pesquisa-Ação e Artefactos de Sessão

Esta pasta serve como o arquivo central para todos os registos reflexivos e artefactos de comunicação gerados durante o desenvolvimento do projeto "Tocantins Integrado". A sua manutenção rigorosa é fundamental para a aplicação da nossa metodologia de colaboração Humano-IA e para a rastreabilidade do processo de pesquisa-ação.

---

## Conteúdo

- **Diários de Pesquisa-Ação:** Ficheiros Markdown que documentam cada sessão de trabalho. Cada diário é um registo meticuloso e reflexivo que segue a estrutura de Ação-Reflexão.
- **Handoffs de Continuidade:** Ficheiros Markdown, localizados na subpasta `/handoffs`, que servem como pontes de contexto entre sessões ou entre diferentes agentes (humanos ou IA).
- **Tabela de Registo de Sessões:** Um ficheiro (`REGISTRO_SESSOES.md`) que fornece uma visão geral e resumida de todas as sessões realizadas, facilitando a navegação e a compreensão da evolução do projeto.

---

## Protocolo de Encerramento de Sessão

Ao final de cada sessão de trabalho, o seguinte protocolo deve ser executado:

### 1. Criar o Diário de Pesquisa-Ação

Crie um novo ficheiro `.md` para a sessão. O nome do ficheiro deve seguir o padrão `Diario_Pesquisa_Acao_YYYY-MM-DD_Descricao_Breve.md`.

O conteúdo do diário deve ser **meticuloso e reflexivo**, aderindo aos nossos princípios metodológicos. A estrutura recomendada é:

1.  **Contexto e Objetivos Iniciais:**
    *   Situação de Partida
    *   Objetivos Explícitos da Sessão
    *   Pressupostos Epistemológicos
2.  **Evolução da Sessão: Ciclos de Ação-Reflexão:**
    *   **AÇÃO:** O que foi feito.
    *   **OBSERVAÇÃO:** O que foi notado ou percebido.
    *   **REFLEXÃO:** Análise crítica, tensões e insights.
    *   **APRENDIZADO:** Lições extraídas e conhecimento gerado.
3.  **Síntese e Próximos Passos:**
    *   Resumo dos resultados alcançados.
    *   Definição clara dos próximos passos.

### 2. Criar o Handoff de Continuidade

Na subpasta `/handoffs`, crie um novo ficheiro `.md` seguindo o padrão `Handoff_YYYY-MM-DD_Origem_para_Destino.md`. Este documento é crucial para garantir a continuidade e a preservação do contexto para a próxima sessão. Utilize o template definido em `/.governance/templates/HANDOFF_TEMPLATE.md`.

### 3. Atualizar a Tabela de Registo de Sessões

Abra o ficheiro `REGISTRO_SESSOES.md` e adicione uma nova linha à tabela com as informações consolidadas da sessão que acabou de terminar. Esta etapa é vital para manter um índice organizado e de fácil consulta.

### 4. Fazer o Commit

Faça o commit dos novos ficheiros (diário e handoff) e das alterações na tabela de registo para o repositório GitHub. A mensagem do commit deve ser descritiva, por exemplo: `docs: add action-research log for session YYYY-MM-DD`.
