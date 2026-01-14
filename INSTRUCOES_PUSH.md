# Instruções: Push do Repositório IA Collab OS

## 📦 Arquivos Disponíveis

Você tem dois arquivos para escolher:

1. **ia-collab-os.tar.gz** (68KB) - Para Linux/Mac
2. **ia-collab-os.zip** (31KB) - Para Windows/Mac

Ambos contêm o mesmo conteúdo completo do repositório.

---

## 🚀 Passo a Passo

### 1. Baixar o Arquivo

Localize o arquivo no Replit:
- Caminho: `/home/user/ia-collab-os.tar.gz` ou `/home/user/ia-collab-os.zip`
- Use o explorador de arquivos do Replit para baixar

### 2. Extrair o Arquivo

**No Linux/Mac** (usando .tar.gz):
```bash
tar -xzf ia-collab-os.tar.gz
cd ia-collab-os
```

**No Windows/Mac** (usando .zip):
```bash
unzip ia-collab-os.zip
cd ia-collab-os
```

### 3. Verificar o Conteúdo

```bash
# Ver estrutura
ls -la

# Ver commit
git log --oneline

# Ver arquivos rastreados
git ls-files
```

Você deve ver:
- ✅ 15 arquivos
- ✅ 1 commit inicial (b78ddcc)
- ✅ Branch main

### 4. Conectar ao GitHub

```bash
# Remover remote antigo se houver
git remote remove origin

# Adicionar o remote correto
git remote add origin https://github.com/henrique-m-ribeiro/ia-collab-os.git

# Verificar
git remote -v
```

### 5. Fazer o Push

```bash
git push -u origin main
```

Se pedir autenticação:
- **Username**: seu username do GitHub
- **Password**: use um Personal Access Token (não senha)

### 6. Verificar no GitHub

Acesse: https://github.com/henrique-m-ribeiro/ia-collab-os

Você deve ver:
- ✅ README.md renderizado
- ✅ 15 arquivos
- ✅ Estrutura de pastas (roles, protocols, templates, case-studies)

---

## 🔑 Criar Personal Access Token (Se Necessário)

Se o GitHub pedir senha e não aceitar:

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Dê um nome: "IA Collab OS Push"
4. Selecione escopo: **repo** (full control)
5. Clique em "Generate token"
6. **Copie o token** (não será mostrado novamente)
7. Use o token como senha no git push

---

## 📋 Conteúdo do Repositório

```
ia-collab-os/
├── README.md                          # Introdução ao framework
├── PRINCIPLES.md                      # 5 princípios fundamentais
├── METHODOLOGY.md                     # Ciclo completo de trabalho
├── LICENSE                            # MIT License
├── .gitignore                         # Git ignore
│
├── roles/                             # Definição de papéis
│   ├── 00_OVERVIEW.md                # Visão geral
│   ├── 01_CEO_HUMAN.md               # Papel CEO
│   ├── 02_CTO_AI.md                  # Papel CTO
│   └── 03_DEV_AI.md                  # Papel Dev
│
├── protocols/                         # Protocolos
│   ├── 01_HANDOFF_PROTOCOL.md        # Handoffs
│   └── 02_ADR_PROTOCOL.md            # ADRs
│
├── templates/                         # Templates
│   ├── HANDOFF.md                    # Template handoff
│   ├── ADR.md                        # Template ADR
│   └── SESSION_LOG.md                # Template log
│
└── case-studies/                      # Casos de estudo
    └── 01_TOCANTINS_INTEGRADO.md    # Caso Tocantins
```

**Total**: 15 arquivos, ~2.114 linhas de documentação

---

## ✅ Verificação Final

Após o push, confirme:

- [ ] README.md aparece na home do repositório
- [ ] Todas as pastas estão visíveis
- [ ] Links internos funcionam (entre .md files)
- [ ] LICENSE aparece no rodapé do repo
- [ ] 1 commit visível no histórico

---

## 🆘 Troubleshooting

### Erro: "authentication failed"
➡️ Use Personal Access Token ao invés de senha

### Erro: "repository not found"
➡️ Verifique se o repositório existe: https://github.com/henrique-m-ribeiro/ia-collab-os

### Erro: "permission denied"
➡️ Verifique se você tem permissão de escrita no repositório

### Push muito lento
➡️ Normal, é a primeira vez. Próximos pushes serão incrementais e rápidos.

---

## 📞 Suporte

Se tiver problemas, o repositório local está em perfeito estado.
Você pode também fazer push de outra máquina ou via GitHub Desktop.

**Boa sorte! 🚀**
