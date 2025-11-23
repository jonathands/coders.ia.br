---
title: "Análise estática de código com PHPStan e Larastan"
description: "Como usar PHPStan e Larastan para encontrar bugs antes de rodar o código e melhorar a qualidade do seu projeto Laravel"
date: 2025-11-25
category: "Desenvolvimento"
author: "Jonathan dos Santos"
tags: ["php", "laravel", "phpstan", "larastan", "qualidade", "testes"]
---

Se você trabalha com PHP, especialmente Laravel, já deve ter passado por aquela situação frustrante: seu código passa em todos os testes, você faz deploy, e aí aparece um erro de tipo que poderia ter sido evitado. "Undefined property", "Call to undefined method", "Argument type mismatch"... Erros que o PHP só descobre em runtime.

Análise estática de código resolve exatamente isso. PHPStan e Larastan analisam seu código **sem executá-lo**, encontrando erros de tipo, lógica e inconsistências antes mesmo de você rodar a aplicação.

Neste artigo, vou mostrar como configurar e usar essas ferramentas no seu projeto Laravel, e como elas podem salvar horas de debug.

## O que é análise estática e por que você precisa

Análise estática é quando uma ferramenta lê seu código-fonte e procura por problemas potenciais **sem executar** o código. É como ter um revisor extremamente meticuloso que verifica cada linha antes de você commitar.

### O problema com PHP

PHP é uma linguagem **dinamicamente tipada**. Isso significa que você pode fazer coisas assim:

```php
function getUserName($user) {
    return $user->name;
}

// Isso compila normalmente
getUserName("string qualquer"); // Mas quebra em runtime!
```

O PHP não reclama até você realmente executar esse código. Se esse trecho estiver numa parte pouco usada da aplicação, o bug pode ficar escondido por dias ou semanas.

### A solução: PHPStan

PHPStan analisa seu código e detecta problemas como:

```php
// PHPStan detecta: Property App\Models\User::$name is not defined
$user->name;

// PHPStan detecta: Parameter #1 expects User, string given
getUserName("string");

// PHPStan detecta: Method App\Models\Product::getPrice() should return float but returns string
public function getPrice(): float {
    return "19.99"; // Oops!
}
```

Tudo isso **antes** de rodar o código. É quase como ter TypeScript para PHP.

## PHPStan vs Larastan: Qual usar?

### PHPStan

É a ferramenta base, funciona com qualquer projeto PHP. Muito poderosa, configurável, e amplamente adotada.

**Use se:**
- Trabalha com PHP puro ou frameworks que não Laravel
- Quer máximo controle sobre configurações
- Está começando com análise estática

### Larastan

É o PHPStan **otimizado para Laravel**. Entende Facades, Eloquent, helpers do Laravel, e outras magias que o PHPStan sozinho não compreende bem.

**Use se:**
- Trabalha com Laravel (99% dos casos)
- Quer menos configuração manual
- Quer análise específica de padrões Laravel

**Minha recomendação:** Se você usa Laravel, use Larastan. Ele é PHPStan + extensões Laravel. Melhor dos dois mundos.

## Instalando Larastan no Laravel

Vou mostrar o processo completo com Larastan, mas os conceitos aplicam-se a PHPStan também.

### Passo 1: Instalar via Composer

```bash
composer require --dev nunomaduro/larastan
```

O `--dev` instala apenas no ambiente de desenvolvimento. Não precisa dessa ferramenta em produção.

### Passo 2: Criar arquivo de configuração

Crie `phpstan.neon` na raiz do projeto:

```neon
includes:
    - ./vendor/nunomaduro/larastan/extension.neon

parameters:
    paths:
        - app
        - config
        - database
        - routes

    level: 5

    ignoreErrors:
        - '#Unsafe usage of new static#'

    excludePaths:
        - ./*/*/FileToBeExcluded.php

    checkMissingIterableValueType: false
```

Vamos entender cada parte:

**includes:** Carrega as configurações do Larastan.

**paths:** Onde o PHPStan deve analisar. Geralmente `app`, `config`, `database`, `routes`.

**level:** Nível de rigor (0 a 9). Quanto maior, mais estrito. Começe com 5, depois aumente gradualmente.

**ignoreErrors:** Erros específicos que você quer ignorar (use com moderação).

**excludePaths:** Arquivos ou pastas para ignorar completamente.

### Passo 3: Executar análise

```bash
./vendor/bin/phpstan analyse
```

Você vai ver algo assim:

```
 ------ ----------------------------------------------------------------
  Line   app/Http/Controllers/UserController.php
 ------ ----------------------------------------------------------------
  23     Parameter #1 $user of method getUserName() expects
         App\Models\User, string given.
  45     Property App\Models\User::$email is not defined.
 ------ ----------------------------------------------------------------

 [ERROR] Found 2 errors
```

Agora você sabe exatamente onde estão os problemas, sem rodar o código!

## Níveis de análise: Do básico ao hardcore

PHPStan tem 10 níveis (0-9). Quanto maior o nível, mais checagens são feitas.

### Level 0 - Básico

Checa apenas erros óbvios:
- Classes não existentes
- Métodos não definidos
- Propriedades inexistentes

```php
// Level 0 pega isso
$user->metodoQueNaoExiste();
```

### Level 5 - Recomendado para começar

Adiciona checagens de tipos:
- Parâmetros de função
- Tipos de retorno
- Tipos de propriedades

```php
// Level 5 pega isso
public function getAge(): int {
    return "vinte e cinco"; // Tipo errado
}
```

### Level 8-9 - Modo paranóico

Checa absolutamente tudo:
- Propriedades não usadas
- Métodos privados desnecessários
- Dead code
- Mixed types (quando não consegue inferir tipo)

```php
// Level 8+ pega isso
private function helperNuncaUsado() {
    // Method is never used
}
```

**Estratégia recomendada:**

1. Comece com level 5
2. Corrija todos os erros
3. Aumente para level 6
4. Corrija, aumente, repita
5. Pare em level 7 ou 8 (9 é bem extremo)

## Integrando no workflow

Não adianta ter PHPStan instalado se ninguém roda. Integre no seu workflow automático.

### Git Hooks com Husky/Lint-staged

Se você usa Node.js no projeto (geralmente tem pra compilar assets):

```bash
npm install --save-dev husky lint-staged
npx husky install
```

Configure `.husky/pre-commit`:

```bash
#!/bin/sh
./vendor/bin/phpstan analyse --error-format=table
```

Agora toda vez que você tentar commitar, PHPStan roda automaticamente. Commit só passa se análise estiver limpa.

### CI/CD (GitHub Actions)

Adicione no seu `.github/workflows/tests.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  phpstan:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.2
          extensions: mbstring, pdo, pdo_mysql

      - name: Install dependencies
        run: composer install --prefer-dist --no-progress

      - name: Run PHPStan
        run: ./vendor/bin/phpstan analyse --error-format=github
```

Agora todo push e PR roda análise estática. PRs com erros não passam no CI.

### Script Composer

Adicione no `composer.json`:

```json
{
    "scripts": {
        "phpstan": "phpstan analyse",
        "phpstan:baseline": "phpstan analyse --generate-baseline"
    }
}
```

Agora pode rodar simplesmente:

```bash
composer phpstan
```

## Casos de uso práticos

Vamos ver exemplos reais de bugs que PHPStan encontra.

### 1. Typos em nomes de métodos/propriedades

```php
// Controller
public function store(Request $request) {
    $user = User::create($request->all());

    // Typo: deveria ser 'email', não 'emial'
    Mail::to($user->emial)->send(new WelcomeEmail());
}
```

**PHPStan detecta:**
```
Property App\Models\User::$emial is not defined.
```

Sem PHPStan, isso só seria descoberto quando alguém se cadastrasse e o email não fosse enviado.

### 2. Tipos errados em funções

```php
// Service
public function calculateDiscount(Product $product, int $percentage): float {
    // Alguém passou string ao invés de int
    return $product->price * ($percentage / 100);
}

// Controller
$discount = $this->calculateDiscount($product, "10"); // String!
```

**PHPStan detecta:**
```
Parameter #2 $percentage of method calculateDiscount() expects int, string given.
```

### 3. Retornos inconsistentes

```php
public function getUserRole(User $user): string {
    if ($user->isAdmin()) {
        return 'admin';
    }

    if ($user->isModerator()) {
        return 'moderator';
    }

    // Esqueceu de retornar algo aqui!
}
```

**PHPStan detecta:**
```
Method getUserRole() should return string but return statement is missing.
```

### 4. Relações Eloquent erradas

```php
// Model
class Post extends Model {
    public function author() {
        return $this->belongsTo(User::class);
    }
}

// Controller
$posts = Post::with('autor')->get(); // Typo: 'autor' ao invés de 'author'
```

**PHPStan (com Larastan) detecta:**
```
Call to undefined relationship 'autor' on model Post.
```

## Baseline: Lidando com projetos legados

Se você adicionar PHPStan num projeto existente, provavelmente vai encontrar centenas ou milhares de erros. Corrigir tudo de uma vez é inviável.

### Solução: Baseline

Baseline "congela" os erros atuais e só alerta sobre erros **novos**.

```bash
./vendor/bin/phpstan analyse --generate-baseline
```

Isso cria `phpstan-baseline.neon` com todos os erros atuais. Atualize `phpstan.neon`:

```neon
includes:
    - ./vendor/nunomaduro/larastan/extension.neon
    - phpstan-baseline.neon  # Adicione esta linha

parameters:
    # ... resto da configuração
```

Agora PHPStan ignora erros que já existiam, mas pega qualquer erro novo que você introduzir.

**Estratégia com baseline:**

1. Gere baseline inicial
2. Configure CI para rodar PHPStan
3. Aos poucos, corrija erros antigos
4. Periodicamente, regenere baseline para diminuir a lista
5. Eventualmente, elimine o baseline completamente

## Configurações avançadas

### Ignorar erros específicos

Às vezes PHPStan reclama de algo que você **sabe** que está correto. Você pode ignorar especificamente:

```neon
parameters:
    ignoreErrors:
        # Ignorar erro específico em arquivo específico
        - message: '#Access to an undefined property#'
          path: app/Legacy/OldCode.php

        # Ignorar padrão de erro em todos os arquivos
        - '#Cannot call method format\(\) on DateTime\|null#'
```

Use com moderação. Se você ignora tudo, perde o benefício da ferramenta.

### Checagem de tipos em arrays

Por padrão, PHPStan é permissivo com arrays. Para ser mais estrito:

```neon
parameters:
    checkMissingIterableValueType: true
```

Agora você precisa documentar tipos de arrays:

```php
/**
 * @param array<int, User> $users
 * @return array<string, string>
 */
public function formatUsers(array $users): array {
    // ...
}
```

### Stub files para código problemático

Se você usa biblioteca externa que não tem tipagem boa, crie stub files:

```php
// stubs/ProblematicLibrary.stub

namespace ProblematicVendor;

class SomeClass {
    public function someMethod(string $param): array {}
}
```

Configure no `phpstan.neon`:

```neon
parameters:
    stubFiles:
        - stubs/ProblematicLibrary.stub
```

## PHPStan com IA (Claude Code)

Aqui fica interessante. PHPStan encontra erros, mas você ainda precisa corrigi-los. Com Claude Code, esse processo fica muito mais rápido.

### Workflow com IA

1. **Rode PHPStan:**
```bash
./vendor/bin/phpstan analyse
```

2. **Copie os erros e peça ao Claude:**
```
PHPStan encontrou estes erros no UserController:

Line 23: Parameter #1 expects User, string given
Line 45: Property User::$email is not defined

Corrija estes erros mantendo a funcionalidade.
```

3. **Claude analisa o código e corrige:**
- Adiciona type hints corretos
- Ajusta chamadas de métodos
- Corrige propriedades inexistentes
- Sugere melhorias de arquitetura

4. **Rode PHPStan novamente** pra confirmar que está limpo.

### Dica: Use PHPStan durante desenvolvimento com IA

Quando estiver criando features novas com Claude Code:

```
Crie um serviço de processamento de pagamentos.
Use Stripe API e salve no banco de dados.
IMPORTANTE: O código precisa passar no PHPStan level 6.
```

Claude vai criar código já com:
- Type hints corretos
- DocBlocks apropriados
- Null safety
- Tipos de retorno explícitos

Resultado: menos refatoração depois.

## Conclusão

PHPStan e Larastan transformam PHP de linguagem dinâmica (onde erros aparecem em runtime) para quase estaticamente tipada (erros encontrados antes de rodar).

**Benefícios concretos:**

✅ **Menos bugs em produção** - Erros de tipo são pegos antes de deploy
✅ **Refatoração segura** - Pode mudar código com confiança
✅ **Documentação automática** - Type hints documentam o código
✅ **Onboarding mais rápido** - Novos devs entendem contratos de funções
✅ **CI/CD confiável** - Análise estática pega erros que testes não pegam

**Próximos passos:**

1. Instale Larastan no seu projeto Laravel
2. Comece com level 5
3. Configure no CI/CD
4. Vá aumentando o level gradualmente
5. Use com Claude Code para corrigir erros rapidamente

E lembre: análise estática **não substitui** testes automatizados. São complementares. Testes validam comportamento, PHPStan valida tipos e estrutura. Use os dois.

---

## Referências

- [PHPStan - Documentação Oficial](https://phpstan.org/)
- [Larastan - GitHub](https://github.com/nunomaduro/larastan)
- [PHPStan Rules Reference](https://phpstan.org/user-guide/rule-levels)
- [Laravel Best Practices](https://laravel.com/docs/master)

---

*Última atualização: Novembro 2025*
