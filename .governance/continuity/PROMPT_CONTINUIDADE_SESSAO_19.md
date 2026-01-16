# Prompt de Continuidade para Sessão #19

**Framework de Inteligência Territorial V6.0**

**Para:** Você (Henrique) do futuro
**De:** Manus (CTO), encerrando a Sessão #18

---

## Contexto

Na sessão anterior (#18), concluímos um ciclo completo de integração e implantação. O conhecimento arquitetural que estava fragmentado foi integrado ao repositório `ia-collab-os` (PR #1, já aprovado e mergeado) e, mais importante, a infraestrutura de coleta de dados foi totalmente implantada no n8n Cloud. Todos os 4 workflows (Orchestrator, IBGE, INEP, MapBiomas) estão salvos e prontos para serem ativados.

O trabalho de "setup" está feito. Agora, entramos na fase de **ativação e validação**.

## Objetivo da Próxima Sessão (Sessão #19)

**Testar a funcionalidade do pipeline de coleta de dados de ponta a ponta.**

O objetivo é ativar os workflows e realizar um teste controlado para garantir que o sistema está operando conforme o esperado, desde a orquestração até a coleta de dados de um especialista.

## Plano de Ação Sugerido

1.  **Ativação dos Workflows:**
    -   Navegar até o n8n Cloud.
    -   Ativar os 3 workflows especialistas (IBGE, INEP, MapBiomas).
    -   Ativar o workflow `Data Collection Orchestrator`.

2.  **Preparação do Teste:**
    -   Acessar o banco de dados Supabase.
    -   Verificar a tabela `indicator_dictionary` e garantir que temos um indicador do IBGE pronto para ser coletado (e.g., `status = 'pending'`).
    -   *Pergunta em aberto da sessão anterior:* Qual indicador específico do IBGE (e para qual município/ano) devemos usar para o teste?

3.  **Execução do Teste:**
    -   Executar manualmente o workflow `Data Collection Orchestrator`.

4.  **Verificação dos Resultados:**
    -   Analisar os logs de execução do Orchestrator para ver se ele identificou o indicador pendente.
    -   Verificar os logs de execução do workflow especialista do IBGE para confirmar que ele foi chamado via webhook.
    -   Checar o banco de dados para ver se o dado coletado foi salvo corretamente e se o status do indicador foi atualizado para `completed`.

## Documentação de Apoio

-   **Diário da Sessão #18:** `docs/01-research/diaries/2026-01-15_sessao-18.md` - Contém a narrativa completa do que foi feito.
-   **Workflows Importados:** `docs/01-research/diaries/assets/workflows-importados.md` (ou similar) - Contém os IDs e URLs dos workflows no n8n.

---

**Vamos fazer a engrenagem girar. A base está pronta, agora é hora de ver o sistema em ação.**
