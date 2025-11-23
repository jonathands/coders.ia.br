---
title: "Como fazer direcionamento via DNS"
description: "Entenda por que DNS não suporta redirecionamentos HTTP e como usar forwarddomain.net para redirecionar domínios de forma simples e eficiente"
date: 2025-10-05
category: "Desenvolvimento Web"
author: "Jonathan dos Santos"
tags: ["dns", "domínio", "redirecionamento", "networking", "forwarddomain"]
image: "/images/blog/como-fazer-direcionamento-via-dns.jpg"
---

## O Problema: DNS Não Faz Redirecionamentos

Vamos direto ao ponto: **DNS não suporta redirecionamentos HTTP**. Muita gente se confunde com isso, então vou explicar de forma clara.

### O Que DNS Realmente Faz

DNS (Domain Name System) é basicamente um tradutor. Ele pega um nome de domínio como `exemplo.com` e devolve um endereço IP como `192.168.1.100`. É só isso. DNS não entende conceitos de HTTP como:

- Redirecionamentos 301 ou 302
- URLs com caminhos (`/pagina`)
- Protocolos (http vs https)
- Parâmetros de query string

Quando você digita `exemplo.com` no navegador, acontece isso:

1. **DNS resolve**: `exemplo.com` → `192.168.1.100`
2. **Navegador conecta**: ao servidor no IP `192.168.1.100`
3. **Servidor responde**: com o conteúdo ou redirecionamento HTTP

O redirecionamento acontece no passo 3, não no DNS. Para fazer um redirecionamento HTTP, você precisa de um servidor web respondendo no IP de destino.

### Por Que Isso É Um Problema?

Se você quer redirecionar `dominio-antigo.com` para `dominio-novo.com`, você não pode simplesmente "configurar no DNS". Você precisa de:

1. Um servidor web rodando
2. Configurado para responder no domínio antigo
3. Que retorne um redirect HTTP 301/302 para o domínio novo

E manter um servidor só para fazer redirecionamentos é caro e trabalhoso.

## A Solução: ForwardDomain.net

É aí que entra o [ForwardDomain.net](https://forwarddomain.net). É um serviço gratuito que faz exatamente isso: fornece o servidor que responde com redirecionamentos HTTP.

### Como Funciona

1. Você aponta seu domínio antigo para o IP do ForwardDomain
2. Você configura no ForwardDomain para onde quer redirecionar
3. Quando alguém acessa seu domínio antigo, o servidor do ForwardDomain responde com um redirect HTTP

Simples assim.

## Como Usar ForwardDomain.net

### Passo 1: Configure o DNS do Seu Domínio

Primeiro, você precisa apontar seu domínio para o ForwardDomain. Vá no painel de controle onde você gerencia seu domínio (Registro.br, Cloudflare, etc.) e adicione estes registros DNS:

```dns
# Registro A para o domínio raiz
@    A    88.198.58.135

# Registro A para www (opcional)
www  A    88.198.58.135
```

**Importante:** Esse IP (`88.198.58.135`) é do ForwardDomain. Verifique sempre o IP atual no site deles, pois pode mudar.

### Passo 2: Configure o Redirecionamento

Agora você precisa informar ao ForwardDomain para onde redirecionar. Você faz isso criando um arquivo de configuração especial:

1. **Acesse seu domínio antigo**: `http://seu-dominio.com/.well-known/forwarddomain.json`

2. **Crie o arquivo** no seu servidor web ou hosting (se você tem acesso), ou use o método alternativo abaixo

O arquivo deve estar em: `/.well-known/forwarddomain.json`

**Conteúdo do arquivo:**

```json
{
  "forward": "https://dominio-novo.com"
}
```

### Método Alternativo: Sem Arquivo de Configuração

Se você não tem onde hospedar o arquivo `.well-known/forwarddomain.json`, você pode usar o método de redirecionamento padrão do ForwardDomain:

1. Aponte o DNS para o IP do ForwardDomain
2. Acesse `http://seu-dominio.com`
3. O ForwardDomain vai mostrar uma página onde você pode configurar o redirecionamento

**Mas atenção:** Este método pode não funcionar para todos os casos. O método recomendado é sempre usar o arquivo de configuração.

### Passo 3: Teste o Redirecionamento

Depois de configurar, teste para garantir que está funcionando:

```bash
# Teste com curl
curl -I http://seu-dominio.com

# Você deve ver algo como:
# HTTP/1.1 301 Moved Permanently
# Location: https://dominio-novo.com
```

Ou simplesmente abra `http://seu-dominio.com` no navegador e veja se redireciona corretamente.

## Configurações Avançadas

### Redirecionar com Caminho Preservado

Se você quer que `dominio-antigo.com/pagina` redirecione para `dominio-novo.com/pagina`, configure assim:

```json
{
  "forward": "https://dominio-novo.com",
  "preserve_path": true
}
```

### Redirecionamento Temporário (302)

Por padrão, o ForwardDomain usa redirect 301 (permanente). Para usar 302 (temporário):

```json
{
  "forward": "https://dominio-novo.com",
  "status_code": 302
}
```

### Redirecionamento com www

Para redirecionar tanto `dominio.com` quanto `www.dominio.com`:

```dns
# Configure ambos os registros A
@    A    88.198.58.135
www  A    88.198.58.135
```

E no arquivo de configuração:

```json
{
  "forward": "https://dominio-novo.com",
  "redirect_www": true
}
```

## Alternativas ao ForwardDomain

Se o ForwardDomain não atender suas necessidades, existem outras opções:

### 1. Cloudflare Page Rules (Gratuito)

Se você usa Cloudflare, pode criar regras de redirecionamento:

1. Vá em **Rules** → **Page Rules**
2. Crie uma regra: `*dominio-antigo.com/*`
3. Selecione **Forwarding URL** → **301 Permanent Redirect**
4. Destino: `https://dominio-novo.com/$2`

**Vantagem:** Integrado com CDN e proteção DDoS
**Desvantagem:** Precisa usar os nameservers do Cloudflare

### 2. Seu Próprio Servidor

Se você tem um servidor, pode configurar um redirect simples:

**Nginx:**
```nginx
server {
    listen 80;
    server_name dominio-antigo.com www.dominio-antigo.com;
    return 301 https://dominio-novo.com$request_uri;
}
```

**Apache (.htaccess):**
```apache
RewriteEngine On
RewriteRule ^(.*)$ https://dominio-novo.com/$1 [R=301,L]
```

### 3. Serviços de Hosting com Redirect

Muitos serviços de hosting oferecem redirecionamento nativo:
- **Netlify**: Redirects via `_redirects` file
- **Vercel**: Redirects via `vercel.json`
- **GitHub Pages**: Limitado, mas possível com meta refresh

## Problemas Comuns e Soluções

### Redirect Não Funciona

**Problema:** Acesso o domínio mas não redireciona

**Soluções:**
```bash
# 1. Verifique se o DNS está apontando corretamente
dig seu-dominio.com A

# Deve retornar o IP do ForwardDomain (88.198.58.135)

# 2. Verifique se o arquivo de configuração está acessível
curl http://seu-dominio.com/.well-known/forwarddomain.json

# Deve retornar o JSON de configuração

# 3. Limpe o cache do navegador
# Ctrl+Shift+Delete (Chrome/Firefox)
```

### Demora para Propagar

**Problema:** Configurei mas ainda não funciona

**Causa:** Propagação DNS pode levar até 48 horas (mas geralmente é mais rápido)

**Solução:**
```bash
# Verifique a propagação em diferentes servidores DNS
# Use: https://dnschecker.org

# Para forçar atualização local (Linux/Mac)
sudo systemd-resolve --flush-caches

# Windows
ipconfig /flushdns
```

### HTTPS Não Funciona

**Problema:** `https://seu-dominio.com` não funciona

**Causa:** ForwardDomain pode não ter certificado SSL para seu domínio

**Solução:** Use um serviço que suporte HTTPS, como Cloudflare Page Rules

## Quando NÃO Usar ForwardDomain

O ForwardDomain é ótimo para redirecionamentos simples, mas não é ideal para:

### 1. Sites de Produção Críticos
- Use serviços pagos com SLA
- Considere Cloudflare ou seu próprio servidor

### 2. Redirecionamentos Complexos
- Múltiplas regras condicionais
- Redirecionamentos baseados em geolocalização
- Precisa de analytics detalhado

### 3. Quando Você Precisa de HTTPS
- ForwardDomain pode ter limitações com SSL
- Use alternativas com certificados gerenciados

## Boas Práticas

### 1. Sempre Use Redirect 301 para Mudanças Permanentes

```json
{
  "forward": "https://dominio-novo.com",
  "status_code": 301
}
```

Isso ajuda com SEO - os buscadores transferem o "ranking" do domínio antigo para o novo.

### 2. Preserve o Caminho Quando Possível

```json
{
  "forward": "https://dominio-novo.com",
  "preserve_path": true
}
```

Assim, links específicos continuam funcionando:
- `dominio-antigo.com/artigo` → `dominio-novo.com/artigo`

### 3. Teste Antes de Anunciar

```bash
# Teste todos os cenários
curl -L http://dominio-antigo.com
curl -L http://www.dominio-antigo.com
curl -L http://dominio-antigo.com/pagina-especifica
curl -L https://dominio-antigo.com
```

### 4. Monitore por Algum Tempo

- Use Google Analytics para ver se há tráfego no domínio antigo
- Configure alertas para saber se o redirecionamento parar de funcionar
- Mantenha o redirecionamento por pelo menos 6-12 meses

## Conclusão

DNS não faz redirecionamentos HTTP porque essa não é a função dele. DNS resolve nomes para IPs, ponto final. Para fazer redirecionamentos, você precisa de um servidor web respondendo com códigos HTTP 301 ou 302.

O ForwardDomain.net resolve esse problema fornecendo gratuitamente a infraestrutura necessária para fazer redirecionamentos simples. É perfeito para:

- Redirecionar domínios antigos para novos
- Criar aliases simples
- Projetos pessoais ou pequenos

Para necessidades mais complexas ou críticas, considere usar Cloudflare, seu próprio servidor, ou serviços pagos com melhor SLA.

## Recursos Úteis

- [ForwardDomain.net](https://forwarddomain.net) - Serviço gratuito de redirecionamento
- [DNSChecker.org](https://dnschecker.org) - Verificar propagação DNS
- [Cloudflare](https://cloudflare.com) - Alternativa com CDN e Page Rules
- [RFC 7231](https://tools.ietf.org/html/rfc7231#section-6.4) - Especificação de redirects HTTP

---

*Última atualização: Novembro 2025*
