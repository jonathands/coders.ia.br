---
title: "Astro: usando o gerador de sites estáticos com IA"
description: "Como usamos Astro e Claude Code para criar, revisar e estruturar artigos em Markdown de forma eficiente e profissional"
date: 2025-11-24
category: "Desenvolvimento"
author: "Jonathan dos Santos"
tags: ["astro", "ia", "claude", "markdown", "blog", "desenvolvimento"]
featured: true
---

Este site que você está lendo agora foi construído com Astro e é mantido com a ajuda de Claude Code. Não é só mais um tutorial sobre "como fazer um blog" - é sobre como combinamos um gerador de sites estáticos moderno com IA para criar conteúdo de forma eficiente, estruturada e escalável.

Se você está cansado de CMS complicados, quer controle total sobre seu conteúdo, e está curioso sobre como IA pode acelerar seu workflow de desenvolvimento e escrita, esse artigo é pra você.

## Por que Astro para um blog técnico?

Existem dezenas de frameworks e geradores de sites: Next.js, Gatsby, Hugo, Jekyll, Eleventy... Por que escolhemos Astro especificamente?

### Performance por padrão

Astro é **zero JavaScript por padrão**. Enquanto outros frameworks enviam todo o JavaScript pro cliente (mesmo que você não precise), Astro só envia HTML e CSS. JavaScript só é carregado se você explicitamente usar componentes interativos.

Na prática? Este blog carrega em menos de 1 segundo mesmo em conexões 3G. Sem frameworks pesados, sem bundles gigantes, sem complexidade desnecessária.

```astro
---
// Este código roda no servidor
const posts = await getCollection('blog');
---

<!-- Resultado: HTML puro, zero JS -->
<div class="posts">
  {posts.map(post => (
    <article>
      <h2>{post.data.title}</h2>
      <p>{post.data.description}</p>
    </article>
  ))}
</div>
```

### Content Collections: TypeScript para seus artigos

Astro introduziu **Content Collections**, que é basicamente TypeScript aplicado aos seus arquivos Markdown. Você define um schema, e o Astro valida automaticamente.

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    author: z.string().default('Jonathan dos Santos'),
    image: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  'blog': blogCollection,
};
```

Se você esquecer um campo obrigatório ou errar o tipo, **o build falha**. Isso previne erros bobos como publicar um artigo sem título ou com data inválida.

### Markdown com superpoderes

Astro suporta Markdown nativamente, mas também permite misturar componentes:

```markdown
---
title: "Meu Artigo"
---

# Introdução

Texto normal em markdown...

<ComponenteInterativo client:load />

Mais texto em markdown...
```

Você escreve em Markdown puro (rápido e simples), mas pode adicionar componentes React, Vue ou Svelte onde precisar de interatividade.

### Deploy trivial

Build do Astro gera HTML estático. Isso significa que você pode hospedar literalmente em qualquer lugar:

- **Vercel/Netlify:** Deploy automático via Git
- **Cloudflare Pages:** Grátis, rápido, global
- **GitHub Pages:** Grátis, simples
- **Seu próprio servidor:** É só servir os arquivos

Sem servidor Node.js rodando, sem banco de dados, sem preocupação com escalabilidade. HTML estático aguenta qualquer volume de tráfego.

## Como criamos artigos: Workflow com Markdown

Todo artigo deste blog é um arquivo `.md` na pasta `src/content/blog/`. Vamos ver como funciona na prática.

### Estrutura de um artigo

```
src/
  content/
    blog/
      astro-gerador-sites-estaticos-com-ia.md
      dns-minimo-desenvolvedor-deve-saber.md
      suporte-agents-claude-code.md
      ...
```

Cada arquivo tem frontmatter (metadados) e conteúdo:

```markdown
---
title: "DNS: O Mínimo que um Desenvolvedor Deve Saber"
description: "Entenda DNS de forma prática..."
date: 2025-11-23
category: "Infraestrutura"
author: "Jonathan dos Santos"
tags: ["dns", "infraestrutura", "cloudflare"]
image: "/images/blog/dns-minimo-desenvolvedor-deve-saber.jpg"
---

DNS é uma daquelas coisas que todo desenvolvedor...
```

O frontmatter define todos os metadados. O Astro valida contra o schema que configuramos. Se algo estiver errado, o build falha antes de ir pra produção.

### Syntax highlighting automático

Astro usa Shiki para syntax highlighting. Configuramos no `astro.config.mjs`:

```javascript
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
```

Agora qualquer bloco de código nos artigos ganha highlighting automático:

```python
def hello_world():
    print("Hello from Astro!")
```

```javascript
const greeting = "Hello from Astro!";
console.log(greeting);
```

### Imagens dos artigos

Cada artigo tem uma imagem destacada que usamos nas listagens e compartilhamento social. As imagens ficam em `public/images/blog/`:

```
public/
  images/
    blog/
      dns-minimo-desenvolvedor-deve-saber.jpg
      astro-gerador-sites-estaticos-com-ia.jpg
```

No frontmatter, referenciamos assim:

```yaml
image: "/images/blog/astro-gerador-sites-estaticos-com-ia.jpg"
```

Geramos essas imagens com IA (Midjourney, DALL-E, ou Stable Diffusion) ou usamos ferramentas como Excalidraw para diagramas técnicos.

## Como usamos Claude Code no workflow

Aqui é onde fica interessante. Claude Code (com Sonnet 4.5) não é só um "ajudante" - é praticamente um co-autor que entende a estrutura do projeto.

### 1. Criação de artigos

Começamos com um prompt simples:

```
Crie um artigo sobre DNS para desenvolvedores.
Explique os conceitos básicos, registros A, CNAME, MX, TXT.
Inclua exemplos práticos e como configurar na Cloudflare.
```

Claude Code:
1. **Lê a estrutura existente** de outros artigos
2. **Identifica o padrão** de frontmatter, tom, formatação
3. **Cria o arquivo Markdown** completo com estrutura consistente
4. **Adiciona exemplos de código** relevantes
5. **Sugere tags e categoria** baseado no conteúdo

O resultado é um artigo pronto que já segue o padrão do site. Não precisamos explicar "use este formato" - ele infere da base de código.

### 2. Revisão e reestruturação

Depois de ter um rascunho, pedimos revisão:

```
Revise o artigo sobre DNS.
Verifique se os exemplos estão corretos.
Melhore a clareza das explicações técnicas.
Adicione seções que estejam faltando.
```

Claude Code:
1. **Valida exemplos técnicos** (verifica se comandos DNS estão corretos)
2. **Identifica gaps** (se faltou explicar algo importante)
3. **Melhora a estrutura** (reorganiza seções se necessário)
4. **Adiciona contexto** (explica "por quê" além de "como")

Por exemplo, no artigo de DNS, Claude adicionou a seção sobre SPF/DKIM/DMARC porque identificou que faltava explicar configuração de email profissional - um caso de uso comum.

### 3. Manutenção do código do site

Não usamos Claude só pra artigos. Usamos pra manter o próprio site:

**Exemplo real:** Queríamos mover as imagens dos artigos para a direita ao invés da esquerda.

```
No artigos list e post em destaque, use a imagem à direita
```

Claude Code:
1. **Identificou** os arquivos relevantes (`src/pages/index.astro`, `src/pages/artigos.astro`)
2. **Analisou** a estrutura Flexbox atual
3. **Reestruturou** o HTML/CSS para mover as imagens
4. **Testou** que a responsividade continuava funcionando
5. **Commitou** com mensagem descritiva

```bash
feat: reposition images to the right in featured post and article listings

- Moved featured post image from top to right side
- Moved article listing images from left to right side
- Updated both index.astro and artigos.astro
```

Tudo isso em menos de 2 minutos. Sem precisar procurar arquivos, sem precisar lembrar sintaxe Flexbox, sem commits mal-escritos.

### 4. Adição de features

Quando precisamos adicionar funcionalidade nova:

```
Adicione um sistema de filtro por categoria na página de artigos
```

Claude Code:
1. **Analisa** a estrutura de categorias existente
2. **Cria** componentes de filtro com JavaScript vanilla
3. **Estiliza** seguindo o design system (Tailwind) do projeto
4. **Adiciona** transições suaves
5. **Documenta** o código inline

O resultado é código que parece que foi escrito pela mesma pessoa desde o início. Consistência total.

## Workflow completo: Da ideia ao artigo publicado

Vamos ver um fluxo real de criação de artigo:

### 1. Ideia inicial

```
Preciso de um artigo explicando como comprar domínio .ia.br
```

### 2. Claude gera estrutura

```markdown
---
title: "Como Comprar um Domínio .ia.br"
description: "Guia completo..."
date: 2025-11-24
category: "Infraestrutura"
tags: ["domínio", "registro.br", "dns"]
---

# Introdução
[Claude escreve introdução contextualizada]

## Passo a passo
[Claude detalha processo]
```

### 3. Revisamos e ajustamos

```
Adicione uma seção sobre custos e renovação.
Explique melhor a diferença entre .ia.br e .com.br
```

Claude adiciona as seções com informações precisas.

### 4. Validação técnica

```
Verifique se todos os exemplos de DNS estão corretos.
Confirme se os links do Registro.br estão atualizados.
```

Claude valida exemplos e atualiza informações desatualizadas.

### 5. Build e preview

```bash
npm run dev
```

Abrimos `localhost:4321` e revisamos visualmente. Como Astro tem hot-reload, mudanças aparecem instantaneamente.

### 6. Deploy

```bash
git add .
git commit -m "feat: add article about .ia.br domains"
git push
```

Vercel detecta o push, roda o build, e publica automaticamente. Em ~2 minutos o artigo está no ar.

## Vantagens dessa stack (Astro + Claude Code)

### Controle total

Diferente de WordPress ou Medium, você tem controle completo:
- **Código-fonte:** Tudo no Git, versionado
- **Design:** Personaliza cada pixel com Tailwind
- **Performance:** Sem bloat de plugins ou temas genéricos
- **Dados:** Seus artigos são Markdown puro, portáteis

### Velocidade de desenvolvimento

Com Claude Code:
- **Criação:** Artigo completo em 10-15 minutos
- **Revisão:** Ajustes em 2-3 minutos
- **Features:** Novas funcionalidades em minutos, não horas

### Consistência

Claude mantém consistência:
- **Tom de escrita:** Aprende o estilo dos artigos existentes
- **Estrutura de código:** Segue padrões do projeto
- **Commits:** Mensagens descritivas e semânticas

### Escalabilidade

Como é site estático:
- **Custo:** Zero ou quase zero (Vercel/Cloudflare Pages gratuitos)
- **Performance:** Aguenta qualquer tráfego
- **Manutenção:** Sem banco de dados pra gerenciar, sem servidor pra atualizar

## Limitações e quando não usar

Astro + IA não é bala de prata. Algumas limitações:

### Conteúdo dinâmico

Se você precisa de:
- Comentários em tempo real
- Dashboards interativos
- Formulários complexos
- Área de membros

Astro pode fazer, mas você vai precisar adicionar serviços externos (Supabase, Firebase) ou usar server-side rendering. Nesse caso, Next.js ou Remix podem ser melhores.

### Múltiplos autores não-técnicos

Se você tem uma equipe grande de escritores que não sabem Git/Markdown, vai precisar de um CMS. Opções:

- **Decap CMS** (antigo Netlify CMS) - interface web pra editar Markdown
- **Sanity** - CMS headless com interface visual
- **WordPress como headless** - usa WP pra conteúdo, Astro pra frontend

### Conteúdo que muda muito

Se você publica 50 artigos por dia ou precisa atualizar conteúdo a cada minuto, rebuild do site pode ficar lento. Sites de notícias geralmente precisam de algo mais dinâmico.

## Dicas práticas

### Organize seus artigos

Use nomes descritivos:
```
como-comprar-dominio-ia-br.md ✅
post-123.md ❌
```

### Defina categorias claras

```typescript
// Mantenha categorias consistentes
const validCategories = [
  "Desenvolvimento",
  "Infraestrutura",
  "IA",
  "Ferramentas"
];
```

### Use drafts

```yaml
---
title: "Artigo em progresso"
draft: true  # Não aparece em produção
---
```

### Otimize imagens

```bash
# Comprima imagens antes de adicionar
npx @squoosh/cli --mozjpeg auto imagem.jpg
```

### Configure SEO

```astro
---
const { title, description, image } = post.data;
---
<head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:image" content={image} />
</head>
```

### Use Claude Code em todo workflow

Não limite Claude à escrita. Use também para:
- **Refatoração:** "Refatore este componente pra usar Tailwind ao invés de CSS inline"
- **Debug:** "Por que essa imagem não está aparecendo?"
- **Performance:** "Otimize o carregamento das imagens"
- **Acessibilidade:** "Adicione atributos ARIA apropriados"

## Exemplos reais deste site

Vamos ver alguns casos reais de como Claude Code ajudou:

### Feature: Filtro de categorias

**Requisito:** Usuários queriam filtrar artigos por categoria.

**Prompt:**
```
Adicione filtros de categoria na página /artigos
```

**Resultado:** Claude:
1. Analisou a estrutura de dados
2. Criou botões de filtro com contador de posts
3. Implementou JavaScript para filtrar dinamicamente
4. Adicionou transições CSS suaves
5. Manteve responsividade mobile

**Tempo:** ~5 minutos

### Refatoração: Layout de imagens

**Requisito:** Mudar posicionamento das imagens.

**Prompt:**
```
Na lista de artigos e post em destaque, use a imagem à direita
```

**Resultado:** Claude:
1. Identificou arquivos corretos
2. Reestruturou Flexbox
3. Manteve responsividade
4. Commitou mudanças

**Tempo:** ~2 minutos

### Novo artigo: DNS

**Requisito:** Explicar DNS para desenvolvedores.

**Prompt:**
```
Crie artigo sobre DNS: registros básicos (A, CNAME, MX, TXT),
como configurar na Cloudflare, e setup de email profissional
```

**Resultado:** Claude criou artigo de 320 linhas:
- Explicações técnicas precisas
- Exemplos práticos de configuração
- Troubleshooting comum
- Referências externas
- Estrutura didática

**Tempo:** ~15 minutos (incluindo revisão)

## Conclusão

Astro + Claude Code é uma combinação poderosa para sites de conteúdo técnico:

**Astro oferece:**
- Performance excepcional
- DX (Developer Experience) excelente
- Flexibilidade total
- Deploy simples

**Claude Code oferece:**
- Velocidade de desenvolvimento
- Consistência de código e conteúdo
- Manutenção facilitada
- Capacidade de escalar sem aumentar equipe

Se você está criando um blog técnico, documentação, ou site de conteúdo, considere essa stack. É moderno, rápido, e surpreendentemente produtivo.

### Próximos passos

1. **Experimente Astro:** `npm create astro@latest`
2. **Configure Content Collections:** Defina schema dos seus posts
3. **Integre Claude Code:** Use para criar conteúdo e features
4. **Deploy:** Vercel ou Cloudflare Pages
5. **Itere:** Adicione features conforme necessário

E lembre-se: você não precisa criar tudo de uma vez. Comece simples - um blog básico com Markdown. Adicione features gradualmente conforme precisar. Astro cresce com você.

---

## Referências

- [Documentação Astro](https://docs.astro.build)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Claude Code - Anthropic](https://www.anthropic.com/claude/code)
- [Markdown Guide](https://www.markdownguide.org/)
- [Vercel - Deploy Astro](https://vercel.com/docs/frameworks/astro)

---

## Código-fonte

O código-fonte completo deste blog está disponível publicamente. Você pode explorar a estrutura, ver como implementamos features, e até usar como base para seu próprio projeto.

**Estrutura principal:**
```
coders.ia.br/
├── src/
│   ├── content/
│   │   ├── blog/           # Artigos em Markdown
│   │   └── config.ts       # Schema dos posts
│   ├── pages/
│   │   ├── index.astro     # Homepage
│   │   ├── artigos.astro   # Lista de artigos
│   │   └── blog/
│   │       └── [slug].astro # Template de artigo
│   └── layouts/
│       └── BaseLayout.astro
├── public/
│   └── images/
│       └── blog/           # Imagens dos artigos
└── astro.config.mjs        # Configuração do Astro
```

Simples, organizado, e fácil de manter.

---

*Última atualização: Novembro 2025*
