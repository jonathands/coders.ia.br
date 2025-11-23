---
title: "Dicas práticas sobre desenvolvimento web com IA"
description: "Dicas essenciais para criar frontends sólidos que funcionam bem com agentes de IA e facilitam manutenção futura"
date: 2025-11-26
category: "Desenvolvimento"
author: "Jonathan dos Santos"
tags: ["frontend", "ia", "react", "vue", "angular", "svelte", "boas-praticas", "typescript"]
---

Angular, Vue, React, Svelte, AlpineJS... Não falta framework para você criar seu frontend. E preferências à parte, todos eles precisam de fundamentos sólidos no desenvolvimento de aplicações, especialmente quando você trabalha com agentes de IA.

Depois de construir dezenas de projetos com Claude Code, Cursor e outros agentes, aprendi na prática quais práticas fazem a diferença entre um frontend que evolui suavemente e um que vira pesadelo de manutenção.

Aqui estão algumas regras que eu sempre sigo para criar frontends que vão ajudar você a usar agentes de forma produtiva e debugar melhor seu código no futuro.

## Por que boas práticas importam ainda mais com IA

Quando você programa sozinho, pode manter contexto mental sobre todo o código. Você lembra por que fez aquela gambiarra, onde está aquele componente específico, qual service busca quais dados.

Com agentes de IA, esse contexto não existe. O agente vê apenas o código que você mostra a ele. Se seu código não for bem estruturado e explícito, o agente vai:

- **Criar código duplicado** porque não encontrou o service existente
- **Gerar SVG inline** ao invés de usar sua biblioteca de ícones
- **Repetir lógica de fetch** porque não viu a camada de dados
- **Ignorar padrões** porque não estão documentados ou óbvios

Boas práticas tornam seu código **legível para máquinas**, não só para humanos. E isso é fundamental quando você trabalha com IA.

## 1. Use bibliotecas de ícones sólidas

### O problema: Agentes adoram criar SVGs

Quando você pede "adicione um ícone de usuário", agentes têm forte tendência a fazer isso:

```jsx
// ❌ Agente criou SVG inline
function UserProfile() {
  return (
    <div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span>Perfil</span>
    </div>
  );
}
```

Problemas com essa abordagem:

- **Inconsistência visual** - Cada ícone vem de fonte diferente
- **Difícil de manter** - SVG gigante no meio do componente
- **Não reutilizável** - Próximo componente que precisar desse ícone vai ter outro SVG
- **Tamanho do bundle** - SVGs inline aumentam código duplicado

### A solução: Bibliotecas estabelecidas

Use bibliotecas com ícones consistentes e bem mantidas:

**Lucide Icons** (minha favorita):
```jsx
// ✅ Usando Lucide
import { User, Mail, Settings, ChevronRight } from 'lucide-react';

function UserProfile() {
  return (
    <div>
      <User size={24} />
      <span>Perfil</span>
    </div>
  );
}
```

**Hero Icons** (excelente para Tailwind):
```jsx
// ✅ Usando Hero Icons
import { UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

function Navigation() {
  return (
    <nav>
      <UserIcon className="w-6 h-6" />
      <EnvelopeIcon className="w-6 h-6" />
    </nav>
  );
}
```

**Por que funciona melhor com IA:**

Quando você documenta no início do projeto:

```typescript
// src/components/README.md
/**
 * ICONS
 * Always use Lucide Icons for all icons in this project
 * Import from: 'lucide-react'
 * Never create inline SVGs
 */
```

Agentes vão respeitar isso e usar a biblioteca correta. Resultado: consistência automática.

### Outras bibliotecas sólidas:

- **Lucide** - 1000+ ícones, React/Vue/Svelte, design clean
- **Hero Icons** - Por Tailwind Labs, perfeito com Tailwind CSS
- **Phosphor Icons** - Muito flexível, vários estilos
- **Feather Icons** - Minimalista, leve
- **Font Awesome** - Clássico, gigante biblioteca (mas pode ser pesado)

**Evite:**
- Ícones de bibliotecas diferentes no mesmo projeto
- SVGs inline (salvo casos muito específicos)
- Icon fonts genéricos sem tree-shaking

## 2. Selecione e configure fontes profissionalmente

### O problema: Fontes mal configuradas

Já viu projeto assim?

```css
/* ❌ Fonte carregada direto no CSS */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
}
```

Problemas:

- **Performance ruim** - Blocking request, FOUT (Flash of Unstyled Text)
- **Privacy** - Google rastreia seus usuários
- **Sem controle de cache** - Depende de CDN externo

### A solução: Fontes auto-hospedadas

Use **Fontsource** ou **FontBunny** (mirror do Google Fonts sem tracking):

```bash
# Instale a fonte como dependência
npm install @fontsource/inter
```

```typescript
// src/main.tsx ou src/app.tsx
import '@fontsource/inter/400.css';  // Regular
import '@fontsource/inter/700.css';  // Bold

// Agora use no Tailwind ou CSS
```

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

**Vantagens:**

✅ **Sem requests externos** - Fonte vem no bundle
✅ **Melhor performance** - Preload automático possível
✅ **Privacidade** - Sem tracking do Google
✅ **Controle total** - Versão fixa, sem surpresas

### Alternativa: FontBunny

Se preferir CDN sem tracking:

```html
<!-- Substitui Google Fonts, mas sem rastreamento -->
<link rel="preconnect" href="https://fonts.bunny.net">
<link href="https://fonts.bunny.net/css?family=inter:400,700" rel="stylesheet">
```

**Dica para agentes:**

Documente escolhas de fonte:

```typescript
// src/styles/typography.md
/**
 * TYPOGRAPHY
 * Primary font: Inter (via Fontsource)
 * Import weights needed: 400 (regular), 700 (bold)
 *
 * Never use Google Fonts CDN directly
 * Always import from @fontsource/inter
 */
```

## 3. Separe consumo de dados desde o início

### O problema: Fetch espalhado por componentes

Código típico que agentes criam:

```tsx
// ❌ Fetch direto no componente
function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return <div>{/* renderiza users */}</div>;
}

// Outro componente faz a mesma coisa
function UserDropdown() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')  // Código duplicado!
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return <select>{/* renderiza users */}</select>;
}
```

Problemas:

- **Duplicação** - Mesma lógica em vários lugares
- **Sem tipagem** - Dados não são tipados
- **Difícil de testar** - Fetch acoplado ao componente
- **Refatoração complexa** - Mudar API requer mexer em N arquivos

### A solução: Camada de dados com services

Estruture assim desde o primeiro dia:

```
src/
├── services/
│   ├── api.service.ts       # Client HTTP base
│   ├── user.service.ts      # User endpoints
│   └── product.service.ts   # Product endpoints
├── types/
│   ├── user.types.ts
│   └── product.types.ts
└── components/
    └── UserList.tsx
```

**1. Defina tipos sólidos:**

```typescript
// src/types/user.types.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}
```

**2. Crie service layer:**

```typescript
// src/services/api.service.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors para auth, error handling, etc
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

```typescript
// src/services/user.service.ts
import { apiClient } from './api.service';
import type { User, CreateUserDto } from '@/types/user.types';

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  async getById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  async create(data: CreateUserDto): Promise<User> {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  async update(id: number, data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
```

**3. Use nos componentes:**

```tsx
// ✅ Componente usa service, não fetch direto
import { useEffect, useState } from 'react';
import { userService } from '@/services/user.service';
import type { User } from '@/types/user.types';

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getAll()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

**Por que isso importa com IA:**

Quando você pede ao agente:

```
Crie um componente que lista produtos
```

Se você tem `productService` bem estruturado, o agente vai:

1. **Encontrar** o service existente
2. **Usar** os tipos definidos
3. **Seguir** o padrão do projeto
4. **Não duplicar** código

Sem service layer, agente cria fetch inline toda vez. Refatoração vira pesadelo.

## 4. Use `<figure>` para imagens responsivas

### O problema: `<img>` simples demais

Código que agentes geram:

```tsx
// ❌ Imagem sem contexto semântico
<img src="/product.jpg" alt="Product" />
```

Problemas:

- Sem lazy loading
- Sem responsividade
- Sem fallback
- Sem caption/créditos

### A solução: Elemento `<figure>`

```tsx
// ✅ Imagem semântica e responsiva
<figure className="product-image">
  <img
    src="/images/product.jpg"
    alt="Notebook Lenovo ThinkPad X1 Carbon"
    loading="lazy"
    width={800}
    height={600}
    className="w-full h-auto object-cover rounded-lg"
  />
  <figcaption className="text-sm text-gray-600 mt-2">
    ThinkPad X1 Carbon Gen 11 - Imagem ilustrativa
  </figcaption>
</figure>
```

**Vantagens:**

✅ **Semântica** - `<figure>` indica conteúdo independente
✅ **Acessibilidade** - Screen readers entendem melhor
✅ **Lazy loading** - `loading="lazy"` otimiza performance
✅ **Responsivo** - Width/height previnem layout shift
✅ **Context** - `<figcaption>` dá contexto visual

### Framework wrappers

Cada framework tem componente otimizado:

**Next.js:**
```tsx
import Image from 'next/image';

<figure>
  <Image
    src="/product.jpg"
    alt="Product"
    width={800}
    height={600}
    className="rounded-lg"
  />
  <figcaption>Product image</figcaption>
</figure>
```

**Nuxt:**
```vue
<template>
  <figure>
    <NuxtImg
      src="/product.jpg"
      alt="Product"
      width="800"
      height="600"
      loading="lazy"
    />
    <figcaption>Product image</figcaption>
  </figure>
</template>
```

**Astro:**
```astro
---
import { Image } from 'astro:assets';
import productImg from '@/assets/product.jpg';
---

<figure>
  <Image src={productImg} alt="Product" />
  <figcaption>Product image</figcaption>
</figure>
```

**Documente para o agente:**

```markdown
# IMAGES

Always wrap images in `<figure>` element with `<figcaption>`.
Use Next.js Image component for optimization.
Always include `alt`, `width`, `height`.
Use `loading="lazy"` for images below the fold.
```

## 5. Nunca use imagens em Base64 no frontend

### O problema: Agentes adoram Base64

Quando você pede "adicione uma logo", agentes fazem isso:

```tsx
// ❌ NUNCA faça isso
const Logo = () => (
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..." />
);
```

Isso parece conveniente, mas é **terrível**:

- **Bundle gigante** - Base64 aumenta tamanho em ~33%
- **Sem cache** - Navegador não pode cachear
- **Difícil de manter** - Impossível editar imagem
- **Git poluído** - Diffs gigantes

### A solução: Arquivos estáticos

```tsx
// ✅ Use arquivo estático
const Logo = () => (
  <img src="/images/logo.png" alt="Company Logo" />
);
```

Ou com import:

```tsx
// ✅ Import direto (Vite/Webpack otimiza)
import logoUrl from '@/assets/logo.png';

const Logo = () => (
  <img src={logoUrl} alt="Company Logo" />
);
```

**Documente explicitamente:**

```markdown
# IMAGES - IMPORTANT

⚠️ NEVER use base64 encoded images in components
⚠️ NEVER use data URIs for images

Always use:
- Static files in `/public/images/`
- Import from `/src/assets/` (build-time optimization)

Example:
```tsx
// ✅ Correct
import logo from '@/assets/logo.png';
<img src={logo} alt="Logo" />

// ❌ Wrong
<img src="data:image/png;base64,..." />
```
```

## 6. Revise e re-revise: Pair programming com IA

### A prática mais importante

Agentes de IA geram código rapidamente. Mas código rápido não é código bom. A diferença entre frontend sólido e bagunça é **revisão**.

### Workflow de revisão

**1. Gere o código inicial:**
```
Crie um componente de formulário de login com validação
```

**2. Revise estrutura:**
```
Revise o LoginForm:
- Tipos estão corretos?
- Validação está usando Zod/Yup?
- Segue padrões do projeto?
- Usa components existentes?
```

**3. Revise qualidade:**
```
Analise o código:
- Há duplicação?
- Acessibilidade está ok?
- Performance está otimizada?
- Testes são necessários?
```

**4. Refatore se necessário:**
```
Extraia validação para hook separado.
Use nosso Button component ao invés de HTML puro.
Adicione error boundary.
```

### Checklist de revisão

Sempre pergunte ao agente:

✅ **Tipos:** Todos os dados têm tipos explícitos?
✅ **Imports:** Está usando bibliotecas corretas do projeto?
✅ **Duplicação:** Código similar já existe em outro lugar?
✅ **Acessibilidade:** Labels, ARIA, keyboard navigation?
✅ **Performance:** Memoization onde necessário?
✅ **Testes:** Precisa de testes unitários?
✅ **Documentação:** Código complexo está documentado?

### Exemplo prático

```tsx
// ❌ Código inicial do agente
function ProductCard({ product }) {
  return (
    <div onClick={() => window.location.href = `/product/${product.id}`}>
      <img src={product.image} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
}
```

**Após revisão:**

```tsx
// ✅ Código depois de revisar com agente
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/Image';
import type { Product } from '@/types/product.types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = memo<ProductCardProps>(({ product }) => {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  return (
    <Link
      to={`/product/${product.id}`}
      className="product-card group"
      aria-label={`Ver detalhes de ${product.name}`}
    >
      <figure>
        <Image
          src={product.image}
          alt={product.name}
          width={300}
          height={300}
          loading="lazy"
          className="group-hover:scale-105 transition-transform"
        />
      </figure>

      <h3 className="text-lg font-semibold mt-4">
        {product.name}
      </h3>

      <p className="text-xl font-bold text-green-600">
        {formattedPrice}
      </p>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';
```

Diferenças:

- **Tipos explícitos** com TypeScript
- **Componente Link** ao invés de window.location
- **Image component** otimizado
- **Formatação de preço** correta para pt-BR
- **Acessibilidade** com aria-label
- **Memo** para performance
- **Semântica** com `<figure>`

## Bônus: Estrutura de projeto que funciona com IA

Organize assim:

```
src/
├── components/
│   ├── ui/              # Componentes base (Button, Input, etc)
│   ├── features/        # Componentes de features específicas
│   └── layouts/         # Layouts (Header, Footer, Sidebar)
├── services/
│   ├── api.service.ts
│   ├── user.service.ts
│   └── product.service.ts
├── types/
│   ├── user.types.ts
│   └── product.types.ts
├── hooks/
│   ├── useAuth.ts
│   └── useProducts.ts
├── utils/
│   ├── format.ts
│   └── validation.ts
├── styles/
│   └── globals.css
└── lib/
    └── constants.ts
```

**Por que essa estrutura?**

- **Previsível** - Agente sabe onde buscar/criar código
- **Escalável** - Fácil adicionar features
- **Manutenível** - Tudo tem lugar certo
- **Colaborativa** - Equipe e IA trabalham bem

## Conclusão

Trabalhar com agentes de IA no frontend não é sobre deixar a IA fazer tudo. É sobre criar estrutura que:

1. **Guia** o agente para decisões corretas
2. **Previne** código ruim através de padrões claros
3. **Facilita** revisão e manutenção
4. **Escala** conforme projeto cresce

**Regras de ouro:**

✅ Use bibliotecas estabelecidas (ícones, fontes)
✅ Separe dados em service layer com tipos
✅ Imagens sempre em `<figure>` com lazy loading
✅ Nunca aceite Base64 inline
✅ Revise tudo que o agente gera

Seguindo essas práticas, você consegue velocidade da IA **sem sacrificar qualidade**. Melhor dos dois mundos.

---

## Referências

- [Lucide Icons](https://lucide.dev/)
- [Hero Icons](https://heroicons.com/)
- [Fontsource](https://fontsource.org/)
- [FontBunny](https://fonts.bunny.net/)
- [MDN - Figure Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

---

*Última atualização: Novembro 2025*
