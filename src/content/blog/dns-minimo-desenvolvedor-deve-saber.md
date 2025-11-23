---
title: "DNS: o mínimo que um desenvolvedor deve saber"
description: "Entenda DNS de forma prática: o que é, como funcionam os registros básicos, onde gerenciar e como configurar emails profissionais"
date: 2025-11-23
category: "Infraestrutura"
author: "Jonathan dos Santos"
tags: ["dns", "infraestrutura", "domínios", "cloudflare", "registro-br", "email"]
featured: false
image: "/images/blog/dns-minimo-desenvolvedor-deve-saber.jpg"
---

DNS é uma daquelas coisas que todo desenvolvedor precisa lidar em algum momento, mas muita gente vai empurrando com a barriga até ser obrigado a aprender na urgência. Já vi projetos inteiros atrasarem porque o desenvolvedor não sabia apontar um domínio pro servidor certo, ou emails importantes sendo perdidos por configuração errada de DNS.

A boa notícia é que você não precisa ser especialista em infraestrutura pra entender o essencial de DNS. Com alguns conceitos básicos, você consegue resolver 95% das situações do dia a dia. Vamos direto ao que importa.

## O que é DNS e porque é importante entender

**DNS (Domain Name System)** é basicamente a agenda telefônica da internet. Quando você digita `google.com` no navegador, seu computador não faz ideia de onde fica o Google. Ele precisa perguntar pro DNS: "ei, qual o endereço IP desse domínio?". O DNS responde algo como "74.125.224.72", e aí sim o navegador consegue se conectar.

Sem DNS, você teria que decorar endereços IP pra acessar sites. Imagina ter que lembrar que o YouTube é `142.250.185.206` ao invés de simplesmente `youtube.com`. Seria horrível.

Mas pra desenvolvedor, DNS é importante por razões muito mais práticas. Quando você faz deploy de uma aplicação, precisa apontar seu domínio pro servidor onde ela está rodando. Se você usa um serviço de email profissional como Google Workspace ou Outlook, precisa configurar registros DNS específicos. Quer usar CDN? Precisa mexer no DNS. Quer configurar HTTPS? Alguns certificados precisam de validação via DNS.

A diferença entre um desenvolvedor que entende DNS e um que não entende é simples: um consegue fazer essas tarefas em 5 minutos, o outro passa horas tentando descobrir por que nada funciona.

O DNS funciona de forma hierárquica e distribuída. Quando você registra um domínio como `seusite.com.br`, você está basicamente alugando aquele nome por um período (normalmente 1 ano). Mas registrar o domínio não faz nada sozinho - você precisa configurar **onde** aquele domínio aponta.

É aí que entram os **nameservers**. Nameservers são servidores que guardam os registros DNS do seu domínio. Quando alguém tenta acessar seu site, o navegador pergunta pros nameservers: "onde fica esse domínio?". Os nameservers respondem com base nos registros que você configurou.

Por padrão, quando você registra um domínio, ele vem com nameservers do próprio registrador (Registro.br, GoDaddy, etc). Mas você pode trocar os nameservers pra usar serviços especializados como Cloudflare, que oferecem recursos extras como cache, proteção DDoS, e interface mais amigável.

## Os registros básicos de DNS e como funcionam

Registros DNS são instruções que você configura pra dizer como seu domínio deve se comportar. Existem vários tipos, mas você vai usar principalmente quatro no dia a dia:

### Registro A (Address)

O registro **A** aponta um domínio ou subdomínio diretamente pra um endereço IPv4. É o mais comum e provavelmente o primeiro que você vai configurar.

**Exemplo prático:**
```
Nome: @
Tipo: A
Valor: 192.168.1.100
TTL: 3600
```

Isso significa: quando alguém acessar `seudominio.com` (o @ representa o domínio raiz), mande pra `192.168.1.100`. Você usa registro A quando tem um servidor com IP fixo rodando sua aplicação.

Se você quer que `www.seudominio.com` aponte pro mesmo servidor:
```
Nome: www
Tipo: A
Valor: 192.168.1.100
TTL: 3600
```

O **TTL (Time To Live)** indica quanto tempo em segundos essa informação pode ficar em cache. Um TTL de 3600 significa 1 hora. Se você vai fazer mudanças, é bom reduzir o TTL antes pra as mudanças se propagarem mais rápido.

### Registro CNAME (Canonical Name)

O registro **CNAME** cria um alias, ou seja, faz um domínio apontar pra outro domínio ao invés de um IP direto. É muito útil quando você usa serviços de terceiros.

**Exemplo prático:**
```
Nome: blog
Tipo: CNAME
Valor: seusite.vercel.app
TTL: 3600
```

Isso faz `blog.seudominio.com` apontar pra `seusite.vercel.app`. Quando alguém acessa seu blog, o DNS resolve primeiro o CNAME, descobre que deve ir pra Vercel, e então resolve o IP do servidor da Vercel.

**Regra importante:** você NÃO pode usar CNAME no domínio raiz (@). Então isso aqui é **errado**:
```
Nome: @
Tipo: CNAME
Valor: seusite.vercel.app
```

É uma limitação técnica do protocolo DNS. Pra domínio raiz, você precisa usar registro A ou então o CNAME especial da Cloudflare (que tecnicamente é um A dinâmico, mas funciona como CNAME).

### Registro MX (Mail Exchange)

O registro **MX** define quais servidores recebem emails do seu domínio. Se você usa Google Workspace, Outlook, ou qualquer serviço de email profissional, precisa configurar registros MX.

**Exemplo prático (Google Workspace):**
```
Nome: @
Tipo: MX
Prioridade: 1
Valor: aspmx.l.google.com
TTL: 3600

Nome: @
Tipo: MX
Prioridade: 5
Valor: alt1.aspmx.l.google.com
TTL: 3600
```

A **prioridade** indica qual servidor deve ser tentado primeiro. Quanto menor o número, maior a prioridade. Você normalmente configura vários servidores MX pra ter redundância - se o primeiro não responder, o email tenta o próximo.

### Registro TXT (Text)

O registro **TXT** armazena texto arbitrário e é usado principalmente pra verificações e configurações de segurança. Você vai usar TXT em três situações principais:

**1. Verificação de domínio:**
Quando você configura Google Workspace, GitHub Pages, ou qualquer serviço que precise confirmar que você é dono do domínio, eles pedem pra você adicionar um registro TXT específico.

```
Nome: @
Tipo: TXT
Valor: google-site-verification=abc123xyz
TTL: 3600
```

**2. SPF (Sender Policy Framework):**
Define quais servidores podem enviar email em nome do seu domínio. Ajuda a prevenir spam e phishing.

```
Nome: @
Tipo: TXT
Valor: v=spf1 include:_spf.google.com ~all
TTL: 3600
```

**3. DKIM e DMARC:**
Autenticação avançada de emails. O provedor de email fornece os valores que você deve configurar.

Esses quatro tipos de registro (A, CNAME, MX, TXT) cobrem 99% do que você vai precisar como desenvolvedor. Existem outros como AAAA (pra IPv6), NS (nameservers), CAA (certificados SSL), mas você só mexe neles em casos específicos.

## Registro.br, Cloudflare e seu Provedor

Agora que você entende os registros, vamos falar sobre **onde** você gerencia isso. Existem basicamente três opções, e cada uma tem suas vantagens.

### Registro.br - Gerenciamento direto

Se você registrou um domínio `.br` no Registro.br, pode gerenciar os DNS diretamente pela plataforma deles. A interface não é a mais bonita do mundo, mas funciona.

**Vantagens:**
- Controle total, sem intermediários
- Gratuito (já incluído no registro)
- Funciona bem pra configurações simples

**Desvantagens:**
- Interface antiga e pouco intuitiva
- Sem recursos extras (cache, proteção DDoS, analytics)
- Propagação pode ser mais lenta

**Quando usar:** Se você tem um site simples, com poucas mudanças de DNS, e não precisa de funcionalidades avançadas, o Registro.br resolve tranquilo.

Para acessar: vá em registro.br, faça login, entre em "Domínios" → "Gerenciar" → "DNS". Lá você pode adicionar registros A, CNAME, MX, TXT e outros.

### Cloudflare - O favorito dos desenvolvedores

A Cloudflare oferece **DNS gerenciado gratuito** com uma interface excelente e recursos extras poderosos. É a escolha mais popular entre desenvolvedores.

**Vantagens:**
- Interface moderna e muito intuitiva
- Propagação instantânea (literalmente segundos)
- CDN grátis incluído
- Proteção DDoS automática
- SSL/HTTPS gratuito com certificado automático
- Analytics detalhado de tráfego
- Cache inteligente que acelera seu site
- Suporte técnico bom no plano gratuito

**Desvantagens:**
- Você precisa trocar os nameservers (isso pode parecer assustador no início)
- Se a Cloudflare cair, seu site cai também (raramente acontece)

**Quando usar:** Se você se importa com performance, segurança, ou simplesmente quer uma interface decente pra gerenciar DNS, use Cloudflare. É grátis e vale muito a pena.

**Como configurar:**
1. Crie conta na Cloudflare (cloudflare.com)
2. Adicione seu domínio
3. A Cloudflare vai escanear seus registros DNS atuais
4. Ela vai te dar dois nameservers (tipo `ava.ns.cloudflare.com` e `bob.ns.cloudflare.com`)
5. Vá no Registro.br (ou onde você registrou o domínio) e troque os nameservers pros da Cloudflare
6. Aguarde algumas horas pra propagar (normalmente é rápido)
7. Pronto! Agora você gerencia tudo pela Cloudflare

### Seu Provedor (Vercel, Netlify, etc)

Se você usa plataformas como Vercel, Netlify ou similares, elas oferecem DNS gerenciado também. É conveniente porque fica tudo no mesmo lugar.

**Vantagens:**
- Tudo integrado (deploy + DNS)
- Configuração automática pra seus projetos
- Uma ferramenta a menos pra gerenciar

**Desvantagens:**
- Se você mudar de provedor, precisa migrar o DNS também
- Menos flexível que Cloudflare pra casos de uso diversos

**Quando usar:** Se você tem apenas um projeto rodando na Vercel/Netlify e não planeja ter outros serviços no mesmo domínio, faz sentido usar o DNS deles mesmo.

**Minha recomendação pessoal:**
Para domínios `.br`, registre no Registro.br (é o mais barato e confiável), mas use Cloudflare pra gerenciar o DNS. Você paga apenas o registro anual pro Registro.br (~R$40/ano) e tem acesso a toda a infraestrutura da Cloudflare de graça.

## Um pouco a mais: Registros DNS para emails

Configurar email profissional é uma das coisas que mais confunde desenvolvedores iniciantes, mas é mais simples do que parece quando você entende os registros.

Digamos que você registrou `suaempresa.com.br` e quer emails `voce@suaempresa.com.br` usando Google Workspace (antigo G Suite).

### Passo 1: Registros MX

Primeiro, você configura os registros MX pra dizer onde os emails devem ser entregues:

```
Nome: @
Tipo: MX
Prioridade: 1
Valor: aspmx.l.google.com

Nome: @
Tipo: MX
Prioridade: 5
Valor: alt1.aspmx.l.google.com

Nome: @
Tipo: MX
Prioridade: 5
Valor: alt2.aspmx.l.google.com

Nome: @
Tipo: MX
Prioridade: 10
Valor: alt3.aspmx.l.google.com

Nome: @
Tipo: MX
Prioridade: 10
Valor: alt4.aspmx.l.google.com
```

Esses são os servidores MX do Google. Outros provedores têm valores diferentes - eles sempre fornecem a lista exata.

### Passo 2: SPF (evitar que seus emails vão pra spam)

SPF diz quais servidores têm permissão pra enviar emails usando seu domínio:

```
Nome: @
Tipo: TXT
Valor: v=spf1 include:_spf.google.com ~all
```

O `include:_spf.google.com` significa "os servidores do Google podem enviar email por mim". O `~all` no final significa "outros servidores não deveriam, mas não rejeite automaticamente" (é o modo suave).

### Passo 3: DKIM (assinatura digital dos emails)

DKIM adiciona uma assinatura digital nos emails pra provar que eles realmente vieram de você:

```
Nome: google._domainkey
Tipo: TXT
Valor: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA...
```

O Google Workspace fornece esse valor gigante. Você só precisa copiar e colar. Cada provedor tem seu próprio jeito de gerar isso.

### Passo 4: DMARC (política de email)

DMARC define o que fazer com emails que falharem nas verificações SPF/DKIM:

```
Nome: _dmarc
Tipo: TXT
Valor: v=DMARC1; p=quarantine; rua=mailto:dmarc@suaempresa.com.br
```

Esse exemplo diz: "se um email falhar nas verificações, coloque na quarentena (spam) e me envie relatórios".

### Por que tudo isso?

Sem esses registros, seus emails funcionam, mas provavelmente vão direto pra pasta de spam. Gmail, Outlook e outros provedores são muito rigorosos hoje em dia. Se você não tem SPF, DKIM e DMARC configurados, eles assumem que seus emails podem ser spam ou phishing.

**Verificando se está tudo certo:**

Depois de configurar, você pode testar:
1. Envie um email de teste
2. Use ferramentas como mxtoolbox.com ou mail-tester.com
3. Elas vão checar se seus registros estão corretos

**Tempo de propagação:**

Mudanças de DNS não são instantâneas. Quando você adiciona ou modifica um registro, pode levar de alguns minutos até 48 horas pra propagar completamente pela internet. Na prática:

- **Cloudflare:** 2-5 minutos normalmente
- **Registro.br:** 2-4 horas em média
- **Outros provedores:** Varia, mas conte com até 24 horas

Se você vai fazer mudanças importantes (trocar servidor, mudar email), reduza o TTL dos registros com antecedência pra acelerar a propagação.

## Conclusão

DNS não precisa ser complicado. Com esses conceitos básicos, você consegue:
- Apontar seu domínio pro servidor certo (registro A ou CNAME)
- Configurar email profissional (registros MX, SPF, DKIM, DMARC)
- Verificar propriedade de domínio pra serviços (registro TXT)
- Escolher onde gerenciar tudo isso (Cloudflare é minha recomendação)

A melhor forma de aprender é fazendo. Registre um domínio barato, configure na Cloudflare, aponte pra uma aplicação simples. Você vai ver que não é nenhum bicho de sete cabeças.

E lembre: se algo não funciona depois de mexer no DNS, espere algumas horas. A propagação pode levar tempo, e é normal nada funcionar imediatamente.

---

## Referências

- [Cloudflare - O que é DNS?](https://www.cloudflare.com/pt-br/learning/dns/what-is-dns/)
- [Registro.br - Serviços de DNS](https://registro.br/tecnologia/ferramentas/dns/)
- [Google Workspace - Configurar registros MX](https://support.google.com/a/answer/174125)
- [MXToolbox - Ferramentas de diagnóstico DNS](https://mxtoolbox.com/)

---

*Última atualização: Novembro 2025*
