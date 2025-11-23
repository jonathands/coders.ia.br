---
title: "Dicas práticas sobre desenvolvimento web com IA"
description: "Dicas essenciais para criar frontends sólidos que funcionam bem com agentes de IA e facilitam manutenção futura"
date: 2025-11-26
category: "Desenvolvimento"
author: "Jonathan dos Santos"
tags: ["frontend", "ia", "react", "vue", "angular", "svelte", "boas-praticas", "typescript"]
---

Depois de construir dezenas de projetos com Claude Code, Cursor e outros agentes de IA, aprendi quais práticas fazem a diferença entre um frontend que evolui suavemente e um que vira pesadelo de manutenção.

Aqui estão regras práticas para criar frontends que funcionam bem com agentes de IA.

## Por que boas práticas importam com IA

Agentes de IA veem apenas o código que você mostra. Se não for bem estruturado, eles vão criar código duplicado, gerar SVG inline ao invés de usar bibliotecas, e ignorar padrões existentes.

Boas práticas tornam seu código **legível para máquinas**, não só para humanos.

## 1. Use bibliotecas de ícones sólidas

### O problema: SVGs inline

Agentes adoram criar SVG inline para ícones. Isso gera inconsistência visual, duplicação de código, e dificulta manutenção.

### A solução: Bibliotecas estabelecidas

Use bibliotecas com ícones consistentes e bem mantidas:

```jsx
// ✅ Usando Lucide
import { User, Mail, Settings } from 'lucide-react';

function UserProfile() {
  return (
    <div>
      <User size={24} />
      <span>Perfil</span>
    </div>
  );
}
```

### Bibliotecas recomendadas:

- **Lucide** - 1000+ ícones, React/Vue/Svelte
- **Hero Icons** - Perfeito com Tailwind CSS
- **Phosphor Icons** - Muito flexível
- **Feather Icons** - Minimalista e leve

**Documente suas escolhas:**
```typescript
// src/components/README.md
/**
 * ICONS: Always use Lucide Icons
 * Import from: 'lucide-react'
 * Never create inline SVGs
 */
```

## 2. Selecione e configure fontes profissionalmente

### O problema: Google Fonts CDN

Carregar fontes direto do Google Fonts causa problemas de performance (blocking requests), privacidade (tracking), e falta de controle de cache.

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

**Vantagens:** Sem requests externos, melhor performance, privacidade, e controle total sobre versões.

## 3. Separe consumo de dados desde o início

### O problema: Fetch espalhado

Agentes criam fetch direto nos componentes, gerando duplicação, falta de tipagem, e dificuldade de manutenção.

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

Com service layer bem estruturado, agentes encontram e reutilizam código existente, seguindo padrões do projeto automaticamente.

## 4. Use `<figure>` para imagens responsivas

### O problema: `<img>` sem otimização

Tags `<img>` simples não têm lazy loading, responsividade, ou contexto semântico.

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

### Componentes otimizados por framework

**Next.js:** Use `next/image`
**Nuxt:** Use `<NuxtImg>`
**Astro:** Use componente `Image` de `astro:assets`

Sempre documente o padrão de imagens do projeto para guiar agentes.

## 5. Nunca use imagens em Base64 no frontend

### O problema: Base64 inline

Base64 aumenta bundle em ~33%, impede cache do navegador, e polui o Git com diffs gigantes.

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

## 6. Revise e re-revise

Código rápido não é código bom. A diferença entre frontend sólido e bagunça é **revisão**.

### Checklist essencial

✅ **Tipos:** Dados têm tipos explícitos?
✅ **Imports:** Usa bibliotecas corretas?
✅ **Duplicação:** Já existe código similar?
✅ **Acessibilidade:** Labels e ARIA corretos?
✅ **Performance:** Memoization necessário?

### Exemplo

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

Melhorias: tipos explícitos, Link ao invés de window.location, Image component otimizado, formatação de preço, acessibilidade, e memoization.

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
