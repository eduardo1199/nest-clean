# NestJS + Domain-Driven Design (DDD) & Clean Architecture 🚀

Este projeto é um backend de fórum de perguntas e respostas desenvolvido com **NestJS**, **Prisma** (Postgres), **Vitest** e estruturado com base em conceitos avançados de **Clean Architecture** e **Domain-Driven Design (DDD)**.

O objetivo principal desta arquitetura é isolar completamente as regras de negócio do domínio de qualquer acoplamento a frameworks, ORMs, servidores web ou bancos de dados externos.

---

## 🗺️ Visão Geral das Camadas

A estrutura do projeto está organizada em três grandes diretórios sob `src`:

```
src/
├── core/       # Kernel Compartilhado (Shared Kernel) com bases abstratas e utilitários
├── domain/     # Camada de Domínio pura (Regras de Negócio, Entidades, Use Cases)
└── infra/      # Camada de Infraestrutura (NestJS, Prisma, Controladores, Adaptadores)
```

| Camada | Descrição e Componentes | Depende de quem? |
| :--- | :--- | :--- |
| **Core** | Estruturas base de domínio reutilizáveis (`Entity`, `UniqueEntityID`, `Either` para tratamento de erros, `DomainEvents`). | Ninguém |
| **Domain** | Regras de negócio puras (Use Cases, Entidades de Negócio, Interfaces de Repositório). Nenhuma dependência do NestJS ou Prisma. | Core |
| **Infra** | Configurações do NestJS, Controladores HTTP, Banco de dados (Prisma), Cryptografia, Upload de arquivos (S3), Envio de Notificações. | Domain & Core |

---

## 🛠️ Como o NestJS está Configurado no Projeto

O **NestJS** funciona estritamente como um detalhe de implementação dentro da camada de **Infraestrutura** (`src/infra`). As regras de negócio não conhecem a existência do NestJS.

### 🧱 Estrutura de Módulos
O NestJS organiza o projeto através de módulos desacoplados no diretório [src/infra](src/infra):

1. **[app.module.ts](src/infra/app.module.ts)**: O módulo raiz da aplicação, encarregado de carregar a configuração global de variáveis de ambiente (`ConfigModule`), autenticação, HTTP e eventos.
2. **[http.module.ts](src/infra/http/http.module.ts)**: Expõe todos os controladores HTTP (`Controllers`) da aplicação e provê os Casos de Uso (`Use Cases`) importados do domínio.
3. **[database.module.ts](src/infra/database/database.module.ts)**: Configura a conexão com o banco de dados via `PrismaService` e realiza a **Inversão de Dependências**.
4. **[auth.module.ts](src/infra/auth/auth.module.ts)**: Configura as estratégias de autenticação JWT, chaves públicas/privadas RSA e guardas de rotas.
5. **[cryptography.module.ts](src/infra/cryptography/crytography.module.ts)**: Registra os adaptadores de hash (`BCryptHasher`) e criptografia (`JwtEncrypter`).
6. **[events.module.ts](src/infra/events/evetns.module.ts)**: Registra subscribers que reagem a eventos de domínio ocorridos no sistema.

### 🔄 Inversão de Dependências (Dependency Inversion Principle - DIP)
Para garantir que as regras de negócio (`domain`) não dependam do banco de dados (`Prisma` na `infra`), os Use Cases do domínio dependem apenas de **Interfaces/Classes Abstratas**. O NestJS realiza a injeção da implementação concreta no [database.module.ts](src/infra/database/database.module.ts).

**Exemplo de Configuração de Provedor:**
```typescript
{
  provide: QuestionsRepository,       // Token Abstrato do Domínio
  useClass: PrismaQuestionsRepository, // Classe Concreta com Prisma da Infra
}
```

---

## 🏛️ Conceitos de Domain-Driven Design (DDD) Implementados

A lógica de domínio principal está dividida em subdomínios sob `src/domain/`:
* `forum`: Domínio responsável pelas interações de perguntas, respostas, anexos e comentários.
* `notification`: Domínio focado no disparo e leitura de notificações para os usuários.

Dentro de cada subdomínio, temos a seguinte divisão:
* `enterprise`: Regras de negócio da empresa (Entidades, Aggregates, Value Objects) que raramente mudam.
* `application`: Regras de negócio da aplicação (Use Cases, Interfaces de Repositório).

### 🏷️ 1. Entidades vs. Objetos de Valor (Value Objects)
* **Entidades (`Entity`)**: Objetos que possuem uma identidade única contínua, mesmo que seus dados internos mudem.
  * *Exemplo*: `Student`, `Instructor`, `Question`.
  * Representado pela classe base **[entity.ts](src/core/entities/entity.ts)**.
* **Objetos de Valor (`Value Object`)**: Objetos imutáveis que não têm identidade e são definidos apenas pelos seus atributos.
  * *Exemplo*: **[slug.ts](src/domain/forum/enterprise/entities/value-objects/slug.ts)**. Dois Slugs com o mesmo conteúdo textual são semanticamente idênticos.
  * Representado pela classe base **[value-object.ts](src/core/entities/value-object.ts)**.

### 📦 2. Agregados e Raízes de Agregação (Aggregates / Aggregate Roots)
Um **Agregado** é um grupo de entidades e objetos de valor associados que são tratados como uma única unidade de consistência de dados. Apenas a **Raiz de Agregação** (`AggregateRoot`) pode ser acessada diretamente de fora, controlando todo o estado interno.

* *Exemplo*: A entidade **[question.ts](src/domain/forum/enterprise/entities/question.ts)** é uma raiz de agregação. Ela encapsula e gerencia suas listas de anexos (`QuestionAttachmentList`), garantindo que nenhuma alteração nos anexos ocorra violando as regras da pergunta.
* Representado pela classe base **[aggregate-root.ts](src/core/entities/aggregate-root.ts)**.

### 📋 3. Watched List (Coleções Observadas)
Para gerenciar atualizações eficientes em relacionamentos um-para-muitos (como os anexos de uma pergunta), o projeto utiliza uma estrutura chamada **[watched-list.ts](src/core/entities/watched-list.ts)**.

Ela mantém o histórico de itens adicionados e removidos de uma lista durante a execução das operações em memória. Quando chega a hora de salvar as alterações no banco de dados via Prisma, o repositório sabe exatamente quais linhas inserir no banco de dados (`createMany`) e quais deletar (`deleteMany`), evitando recriar todos os registros desnecessariamente.

---

## ⚡ Fluxo de Eventos de Domínio (Domain Events)

Em sistemas complexos, ações em um domínio precisam desencadear reações em outros de forma assíncrona e desacoplada. Para isso, o projeto implementa o padrão de **Eventos de Domínio**.

### Como funciona o ciclo de vida de um Evento:

1. **Registro do Evento**: Quando uma nova resposta é criada na entidade `Answer`, ela registra internamente um evento de criação:
   ```typescript
   this.addDomainEvent(new AnswerCreatedEvent(this))
   ```
2. **Armazenamento em Memória**: O evento fica retido temporariamente no `AggregateRoot` (em memória) para evitar o disparo de eventos de operações que possam falhar no banco de dados.
3. **Persistência e Despacho**: Ao realizar a operação de salvamento (`create` ou `save`) no banco de dados, o repositório concreta chama o despachante:
   ```typescript
   DomainEvents.dispatchEventsForAggregate(answer.id)
   ```
4. **Execução do Subscriber**: O subscriber **[on-answer-created.ts](src/domain/notification/application/subscribers/on-answer-created.ts)** captura o evento de criação e executa o caso de uso de envio de notificação (`SendNotificationUseCase`), alertando o autor da pergunta original.

Este design garante o desacoplamento completo: o domínio `forum` não possui referência direta ao domínio de `notification`.

---

## ↩️ Tratamento de Erros Funcional (Either Monad)

Para evitar o uso de exceções (`throw new Error`) para desvios esperados de fluxo de negócio (como permissão negada, recurso não encontrado), o projeto usa a estrutura **[either.ts](src/core/either.ts)**.

```typescript
export type Either<L, R> = Left<L, R> | Right<L, R>
```

* **`Left`**: Representa um resultado de **Falha/Erro**.
* **`Right`**: Representa um resultado de **Sucesso**.

**Benefício no Use Case:**
O retorno de um Use Case fica tipado de forma explícita, forçando o desenvolvedor (ou controlador HTTP) a tratar tanto o caso de erro quanto o de sucesso:

```typescript
type CreateQuestionUseCaseResponse = Either<
  NotAllowedError, // Erro esperado
  { question: Question } // Sucesso esperado
>
```

---

## 📁 Estrutura de Diretórios Detalhada

Aqui está o mapeamento completo da estrutura de pastas:

```text
src/
├── core/
│   ├── either.ts                   # Estrutura funcional Left/Right para erros/sucessos
│   ├── entities/
│   │   ├── aggregate-root.ts       # Classe base para Raízes de Agregação
│   │   ├── entity.ts               # Classe base de Entidades
│   │   ├── unique-entity-id.ts     # Wrapper para UUIDs
│   │   └── watched-list.ts         # Lista observada para gerenciar coleções
│   └── events/
│       ├── domain-event.ts         # Interface base de evento
│       ├── domain-events.ts        # Despachante e centralizador de eventos
│       └── event-handler.ts        # Interface base para ouvintes (subscribers)
│
├── domain/
│   ├── forum/
│   │   ├── application/            # Camada de Aplicação do Fórum
│   │   │   ├── cryptography/       # Interfaces de hashing e criptografia
│   │   │   ├── repositories/       # Interfaces dos Repositórios (contratos de DB)
│   │   │   └── use-cases/          # Regras de fluxo de aplicação (ex: create-question.ts)
│   │   └── enterprise/             # Camada Enterprise do Fórum
│   │       ├── entities/           # Entidades (Question, Answer, Comment, etc)
│   │       └── events/             # Definição dos eventos específicos (ex: answer-created-event.ts)
│   └── notification/               # Subdomínio de Notificações
│
└── infra/
    ├── app.module.ts               # Módulo raiz do NestJS
    ├── main.ts                     # Arquivo de bootstrap da API NestJS
    ├── auth/                       # Estrutura de autenticação (Passport, JWT, JWT Guards)
    ├── cryptography/               # Implementações concretas de criptografia (Bcrypt, JWT)
    ├── database/
    │   ├── prisma/
    │   │   ├── mappers/            # Tradutores entre Entidade de Domínio e Modelo do Prisma
    │   │   ├── repositories/       # Repositórios concretos do Prisma que implementam as interfaces do Domínio
    │   │   └── prisma.service.ts   # Instância de conexão do cliente Prisma
    │   └── database.module.ts      # Registro de provedores de dados e inversão de dependência
    ├── env/                        # Configuração e validação de variáveis de ambiente com Zod
    ├── http/
    │   ├── controllers/            # Controladores HTTP (NestJS Controllers)
    │   ├── presents/               # Mapeamento do retorno HTTP (JSON Serializers)
    │   └── http.module.ts          # Módulo das rotas e injeções HTTP
    └── storage/                    # Integração com armazenamento de arquivos (ex: AWS S3)
```

---

## 🧪 Estratégia de Testes

O projeto adota uma rigorosa infraestrutura de testes rodando no **Vitest**:

1. **Testes Unitários**:
   * Focam nas regras de negócio e Use Cases do domínio.
   * Utilizam repositórios em memória (*In-Memory Repositories*) simulando o banco de dados de maneira extremamente rápida.
   * Localizados ao lado das implementações dos Use Cases (ex: `create-question.spec.ts`).
2. **Testes End-to-End (E2E)**:
   * Testam o fluxo completo desde a requisição HTTP até a persistência real no banco de dados de teste (Postgres).
   * Localizados na pasta `src/infra` ou em subpastas de infraestrutura (ex: `create-question.e2e-spec.ts`).
   * Utilizam o módulo de testes do NestJS (`Test.createTestingModule`) e criam um esquema isolado de banco de dados para cada suite de teste utilizando um runner customizado.

### 🚀 Comandos Úteis

* **Rodar testes unitários:**
  ```bash
  npm run test
  ```
* **Rodar testes E2E:**
  ```bash
  npm run test:e2e
  ```
* **Executar o servidor em desenvolvimento:**
  ```bash
  npm run start:dev
  ```
