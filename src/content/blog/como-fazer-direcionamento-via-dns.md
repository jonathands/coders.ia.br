---
title: "Como Fazer Direcionamento via DNS"
description: "Guia completo sobre direcionamento via DNS, incluindo tipos de registros, configuração prática e boas práticas para gerenciar seus domínios"
date: 2025-10-05
category: "Desenvolvimento Web"
author: "Coders.ia.br"
tags: ["dns", "domínio", "configuração", "networking", "devops"]
---


## Introdução

O direcionamento via DNS é uma técnica fundamental para gerenciar como os visitantes acessam seus sites e serviços online. Seja para redirecionar um domínio para outro, configurar subdomínios ou implementar balanceamento de carga, entender DNS é essencial para qualquer desenvolvedor ou administrador de sistemas.

## O que é DNS?

O Sistema de Nomes de Domínio (DNS) funciona como uma "agenda telefônica" da internet, traduzindo nomes de domínio legíveis (como exemplo.com) em endereços IP que os computadores podem entender (como 192.168.1.1).

## Tipos de Registros DNS

### Registros Principais

#### A Record
- **Função**: Aponta um domínio para um endereço IPv4
- **Exemplo**: `exemplo.com → 192.168.1.100`
- **Uso**: Direcionamento básico de domínio para servidor

#### AAAA Record
- **Função**: Aponta um domínio para um endereço IPv6
- **Exemplo**: `exemplo.com → 2001:db8::1`
- **Uso**: Suporte a IPv6

#### CNAME Record
- **Função**: Cria um "apelido" para outro domínio
- **Exemplo**: `www.exemplo.com → exemplo.com`
- **Uso**: Redirecionamentos e aliases

#### MX Record
- **Função**: Define servidores de email
- **Exemplo**: `mail.exemplo.com`
- **Uso**: Configuração de email

### Registros para Direcionamento

#### URL Redirect
- **Função**: Redirecionamento HTTP/HTTPS
- **Tipos**: 301 (permanente), 302 (temporário)
- **Uso**: Mudança de domínio, páginas específicas

## Métodos de Direcionamento

### 1. Direcionamento por A Record

```dns
# Configuração básica
exemplo.com.     A     192.168.1.100
www.exemplo.com. A     192.168.1.100
```

**Vantagens:**
- Simples e direto
- Melhor performance
- Controle total

**Desvantagens:**
- Requer endereço IP fixo
- Mudanças exigem atualização manual

### 2. Direcionamento por CNAME

```dns
# Redirecionando subdomínio
www.exemplo.com. CNAME exemplo.com.
blog.exemplo.com. CNAME servidor.hosting.com.
```

**Vantagens:**
- Flexibilidade para mudanças
- Não requer IP fixo
- Facilita migrações

**Desvantagens:**
- Adiciona uma consulta DNS extra
- Não pode ser usado no domínio raiz

### 3. Direcionamento por URL Redirect

```dns
# Redirect 301 permanente
exemplo.com → https://novosite.com

# Redirect 302 temporário
manutencao.exemplo.com → https://exemplo.com/manutencao
```

## Configuração Prática

### Cloudflare

1. **Acesse o painel do Cloudflare**
2. **Selecione seu domínio**
3. **Vá para DNS**
4. **Adicione os registros:**

```dns
Tipo: A
Nome: @
Conteúdo: 192.168.1.100
TTL: Auto

Tipo: CNAME
Nome: www
Conteúdo: exemplo.com
TTL: Auto
```

### Google Domains

1. **Acesse Google Domains**
2. **Selecione seu domínio**
3. **Vá para DNS**
4. **Configure os registros:**

```dns
Host: @
Tipo: A
Dados: 192.168.1.100

Host: www
Tipo: CNAME
Dados: exemplo.com
```

### Registro.br

1. **Acesse o painel do provedor**
2. **Localize configurações DNS**
3. **Adicione/edite registros:**

```dns
exemplo.com.     IN A     192.168.1.100
www.exemplo.com. IN CNAME exemplo.com.
```

## Casos de Uso Comuns

### 1. Redirecionamento www para não-www

```dns
# Método 1: CNAME
www.exemplo.com. CNAME exemplo.com.

# Método 2: A Record
www.exemplo.com. A 192.168.1.100
```

### 2. Subdomínios para Serviços

```dns
api.exemplo.com.  CNAME servidor-api.cloud.com.
blog.exemplo.com. CNAME blog-host.com.
mail.exemplo.com. A     192.168.1.200
```

### 3. Balanceamento de Carga

```dns
exemplo.com. A 192.168.1.100
exemplo.com. A 192.168.1.101
exemplo.com. A 192.168.1.102
```

### 4. Migração de Domínio

```dns
# Redirect permanente
exemplo-antigo.com → https://exemplo-novo.com
```

## Ferramentas de Teste

### Linha de Comando

```bash
# Teste A Record
nslookup exemplo.com

# Teste específico
dig exemplo.com A

# Teste CNAME
dig www.exemplo.com CNAME

# Teste completo
dig exemplo.com ANY
```

### Ferramentas Online
- **DNSChecker.org** - Propagação global
- **MXToolbox** - Análise completa de DNS
- **WhatsMyDNS** - Verificação mundial
- **DNS Propagation Checker**

## Tempo de Propagação (TTL)

### Configuração de TTL

```dns
# TTL baixo para mudanças frequentes
exemplo.com. 300 A 192.168.1.100

# TTL alto para estabilidade
exemplo.com. 86400 A 192.168.1.100
```

### Tempos Típicos
- **300 segundos (5 min)**: Mudanças frequentes
- **3600 segundos (1 hora)**: Padrão recomendado
- **86400 segundos (24 horas)**: Configurações estáveis

## Problemas Comuns e Soluções

### 1. Propagação Lenta
```bash
# Verificar TTL atual
dig exemplo.com

# Limpar cache DNS local
sudo systemctl flush-dns
```

### 2. Loops de CNAME
```dns
# ERRADO - cria loop
www.exemplo.com. CNAME blog.exemplo.com.
blog.exemplo.com. CNAME www.exemplo.com.

# CORRETO
www.exemplo.com. CNAME exemplo.com.
```

### 3. CNAME no Root
```dns
# ERRADO - CNAME no root
exemplo.com. CNAME servidor.host.com.

# CORRETO - usar A record
exemplo.com. A 192.168.1.100
```

## Boas Práticas

### Segurança
- Use HTTPS sempre que possível
- Configure registros SPF para email
- Implemente DMARC quando apropriado
- Monitore mudanças não autorizadas

### Performance
- Configure TTL apropriado
- Use CDN quando necessário
- Minimize número de CNAMEs em cadeia
- Monitore tempos de resposta

### Manutenção
- Documente todas as configurações
- Teste mudanças em ambiente de desenvolvimento
- Mantenha backups das configurações
- Monitore disponibilidade regularmente

## Monitoramento

### Ferramentas Recomendadas
- **UptimeRobot** - Monitoramento gratuito
- **Pingdom** - Análise detalhada
- **StatusCake** - Múltiplas localizações
- **New Relic** - Monitoramento avançado

### Scripts de Monitoramento
```bash
#!/bin/bash
# Script simples de monitoramento DNS
DOMAIN="exemplo.com"
IP=$(dig +short $DOMAIN)
echo "IP atual para $DOMAIN: $IP"
```

## Conclusão

O direcionamento via DNS é uma ferramenta poderosa que permite flexibilidade e controle sobre como seus visitantes acessam seus serviços. Entender os diferentes tipos de registros e suas aplicações é fundamental para uma gestão eficaz de domínios.

## Recursos Adicionais

- [RFC 1035](https://tools.ietf.org/html/rfc1035) - Especificação DNS
- [DNS Learning Center](https://www.cloudflare.com/learning/dns/)
- [Google Public DNS](https://developers.google.com/speed/public-dns)
- [Documentação Registro.br](https://registro.br/tecnologia/dns/)

---

*Última atualização: Setembro 2024*