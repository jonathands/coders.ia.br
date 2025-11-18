---
title: "Adicionando suporte a AGENTS.md no Claude Code"
description: "Como adicionar suporte para arquivos AGENTS.md no Claude Code para equipes de ferramentas híbridas"
date: 2025-09-22
category: "Desenvolvimento"
author: "Coders.ia.br"
tags: ["claude", "agents", "desenvolvimento", "ferramentas"]
---

# Adicionando suporte a AGENTS.md no Claude Code

Embora a Anthropic não tenha liberado suporte para AGENTS.md no Claude Code (se eles forem), desenvolvedores em equipes de ferramentas híbridas precisam contornar as convenções de nomenclatura para cada ferramenta.

(Se você não sabe sobre AGENTS.md, dê uma olhada em https://agents.md/)

Para mim, a maneira mais direta de adicionar suporte foi simplesmente usando um hook do Claude Code.

Você pode simplesmente usar um symlink assim: `ln -s AGENTS.md CLAUDE.md`, mas fazer isso em vários projetos pode ficar bem tedioso.

Outra boa opção é criar um Hook global que verifica se o projeto ou o monorepo tem um AGENTS.md e carrega junto com o CLAUDE.md.

Hooks podem parecer assustadores no início, mas não são tão assustadores assim quando você consegue fazê-los funcionar.

Um hook é basicamente um Evento no fluxo REPL do Claude Code. Para isso, usaremos o hook SessionStart, então toda vez que você inicializar uma sessão, o Claude lê o AGENTS.md se ele existir.

## Criando o Hook Global

### Passo 1: Criar o arquivo de hook

Crie o arquivo de hook em `~/.config/claude/hooks/agents-support.md`:

```bash
# Criar o diretório se não existir
mkdir -p ~/.config/claude/hooks

# Criar o arquivo do hook
touch ~/.config/claude/hooks/agents-support.md
```

### Passo 2: Adicionar o conteúdo do hook

Edite o arquivo `~/.config/claude/hooks/agents-support.md` e adicione:

```markdown
---
description: "Hook para carregar AGENTS.md automaticamente se existir"
matcher: "*"
event: SessionStart
---

Se existir um arquivo chamado AGENTS.md no diretório atual ou em qualquer diretório pai (procurando até a raiz do repositório), leia seu conteúdo e incorpore as instruções.

Procure recursivamente por AGENTS.md começando do diretório atual até encontrar:
1. Um arquivo AGENTS.md
2. Um diretório .git (raiz do repositório)
3. O diretório home do usuário

Se encontrar AGENTS.md, leia e siga as instruções nele contidas junto com o CLAUDE.md (se existir).
```

### Passo 3: Como funciona

Quando você inicia uma sessão do Claude Code, o hook será executado automaticamente e:

1. Procura por um arquivo `AGENTS.md` no diretório atual
2. Se não encontrar, procura em diretórios pai
3. Para quando encontra `.git` (indicando raiz do repositório)
4. Se encontrar `AGENTS.md`, carrega o conteúdo junto com `CLAUDE.md`

### Exemplo de AGENTS.md

Aqui está um exemplo de arquivo `AGENTS.md` que você pode usar em seus projetos:

```markdown
# Agent Instructions

## Project Overview
Este é um projeto que usa múltiplas ferramentas de IA (Claude Code, Cursor, etc.)

## Code Style
- Use TypeScript para todos os arquivos
- Prefira programação funcional
- Sempre adicione testes para novas features

## Architecture
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL

## Commands
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm test` - Executa testes
- `npm run build` - Build de produção

## Git Conventions
- Use conventional commits
- Branch naming: feature/, bugfix/, hotfix/
- Sempre crie PR para merge na main
```

## Benefícios dessa Abordagem

### Compatibilidade Universal
- Funciona com Claude Code, Cursor, Windsurf e outras ferramentas
- Mantém um único arquivo de instruções para toda a equipe

### Automação
- Não precisa criar symlinks manualmente
- Funciona automaticamente em novos projetos

### Manutenibilidade
- Um único hook global gerencia tudo
- Fácil de atualizar e modificar

## Verificando se Funciona

Para testar se o hook está funcionando:

```bash
# Crie um AGENTS.md de teste em um projeto
cd seu-projeto
echo "# Test Agent Instructions" > AGENTS.md

# Inicie o Claude Code
claude

# Pergunte se ele viu o AGENTS.md
"Você leu algum arquivo AGENTS.md neste projeto?"
```

## Troubleshooting

### Hook não está sendo executado

```bash
# Verifique se o arquivo existe
ls -la ~/.config/claude/hooks/

# Verifique as permissões
chmod 644 ~/.config/claude/hooks/agents-support.md

# Verifique a sintaxe do hook
cat ~/.config/claude/hooks/agents-support.md
```

### AGENTS.md não está sendo lido

```bash
# Verifique se o arquivo existe
ls -la AGENTS.md

# Verifique o conteúdo
cat AGENTS.md

# Tente com caminho absoluto
pwd
```

## Alternativas

### Opção 1: Symlink (Manual)
```bash
ln -s AGENTS.md CLAUDE.md
```
**Prós:** Simples
**Contras:** Precisa repetir em cada projeto

### Opção 2: Script de Setup
```bash
#!/bin/bash
# setup-agents.sh
if [ -f "AGENTS.md" ]; then
  ln -sf AGENTS.md CLAUDE.md
  echo "✅ Symlink criado"
fi
```
**Prós:** Automatizável
**Contras:** Precisa executar em cada projeto

### Opção 3: Hook Global (Recomendado)
**Prós:** Funciona automaticamente, sem manutenção
**Contras:** Requer configuração inicial

## Conclusão

Adicionar suporte para AGENTS.md no Claude Code através de hooks globais é a melhor solução para equipes que trabalham com múltiplas ferramentas de IA. Isso permite manter um único arquivo de instruções que funciona em todas as ferramentas, sem necessidade de duplicação ou manutenção manual.

### Próximos Passos

1. **Crie o hook global** seguindo os passos acima
2. **Adicione AGENTS.md** aos seus projetos
3. **Teste** para garantir que funciona
4. **Compartilhe** com sua equipe

Com essa configuração, você terá uma experiência consistente independentemente de qual ferramenta de IA você ou sua equipe usar!

---

*Última atualização: Setembro 2025*
