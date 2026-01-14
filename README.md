# Receitas — Sistema de Gerenciamento de Receitas e Categorias

Aplicação em camadas (SRP) construída com Node.js, TypeScript e Express, com contêiner simples de injeção de dependências. Inclui serviços de negócio, repositórios em memória e API HTTP.

## 📋 Sumário
- Visão Geral
- Arquitetura
- Pré-requisitos
- Instalação
- Execução
- Endpoints
- Clientes HTTP (Insomnia/Postman)
- Novas funcionalidades adicionadas
- Exemplos rápidos (Windows)
- Estrutura do projeto
- Colaboradores

## 👁️ Visão Geral
- CRUD de Categorias, Ingredientes e Receitas.
- Busca e filtragem de receitas por `categoryId` e por texto (`search`).
- Regras de negócio:
  - Unicidade de nome para Categoria e Ingrediente.
  - Receita deve referenciar uma Categoria existente.
  - Bloqueio de exclusão de Categoria quando houver Receitas relacionadas.
  - **NOVO: receitas agora possuem estados (draft, published, archived) e apenas receitas publicadas aparecem na listagem.**

## 🏗️ Arquitetura Simplificada (2 Camadas)
- `core`: Contém toda a lógica de negócio, modelos de dados, interfaces e acesso aos dados (armazenamento em memória).
- `presentation`: API HTTP (Express), rotas e configuração do servidor.

O projeto aplica o princípio da **Inversão de Dependência (DIP)**:
- A camada `presentation` depende de **interfaces** definidas no `core` (`ICategoryService`, etc.), e não das implementações concretas.
- Isso desacopla as camadas e facilita testes e manutenção.

### 📁 Estrutura do Código
- Servidor e rotas: `src/presentation/http`.
- Interfaces (Contratos): `src/core/interfaces`.
- Implementação de Serviços: `src/core/*Service.ts`.
- Modelos e DTOs: `src/core/models.ts`.
- Dados em memória: `src/core/store.ts`.

### 📊 Documentação Visual
Diagramas UML estão disponíveis na pasta `docs/diagrams`:
- `package-diagram.puml`: Visão geral das camadas e componentes.
- `class-diagram.puml`: Detalhes das classes, interfaces e relacionamentos.
- `use-case-diagram.puml`: Casos de uso e interações do usuário.

### 🔄 Fluxo de Dados
1. Requisição HTTP chega na `presentation`.
2. Controller/Rota chama o `Service` correspondente no `core`.
3. `Service` valida regras e manipula o `store` (banco de dados em memória).
4. Resposta retorna pela `presentation`.

## 📦 Pré-requisitos
- Node.js 18+ (recomendado 20+)
- npm 9+

## ⚙️ Instalação
1. Baixar o repositório:
   ```bash
   git clone https://github.com/mayllonveras/receitas/
   cd receitas
   ```
2. Instalar dependências:
   ```bash
   npm install
   ```

## ▶️ Execução
- Desenvolvimento:
  ```bash
  npm run dev
  ```
- Produção local:
  ```bash
  npm run build
  npm start
  ```
- Porta: `PORT` (opcional). Padrão `3000`.

## 🔗 Endpoints

### Categorias
- `GET /categories` — lista todas
- `GET /categories/:id` — detalhe
- `POST /categories` — cria `{ name }`
- `PUT /categories/:id` — atualiza `{ name? }`
- `DELETE /categories/:id` — remove (bloqueado se houver receitas)

### Ingredientes
- `GET /ingredients` — lista todos
- `GET /ingredients/:id` — detalhe
- `POST /ingredients` — cria `{ name }`
- `PUT /ingredients/:id` — atualiza `{ name? }`
- `DELETE /ingredients/:id` — remove

### Receitas
- `GET /recipes?categoryId=&search=` — lista com filtros
- `GET /recipes/:id` — detalhe
- `POST /recipes` — cria `{ title, description?, ingredients: [{ name, quantity, unit }], steps[], categoryId }`
- `PUT /recipes/:id` — atualiza parcial dos mesmos campos
- `DELETE /recipes/:id` — remove

⚠️ **Importante**: A listagem `/recipes` agora retorna apenas receitas publicadas (`published`).

### Novos Endpoints para Workflow de Estados
- `POST /recipes/:id/publish` — publica uma receita (draft → published)
- `POST /recipes/:id/archive` — arquiva uma receita (published → archived)

### Novos Endpoints para Funcionalidades Avançadas
- `POST /recipes/:id/scale` — recalcula ingredientes para novas porções
- `POST /recipes/actions/shopping-list` — gera lista de compras consolidada

Códigos de erro: as validações retornam `400` com `{ error: "mensagem" }` (middleware em `src/presentation/http/middlewares/errorHandler.ts`).

## 📤 Clientes HTTP (Insomnia/Postman)
- A pasta `requests` contém coleções de requisições prontas:
  - `Insomnia_recipes_requests.yaml`: Coleção completa para importação direta no **Insomnia**.
  - `recipes_requests.yaml`: Especificação OpenAPI/Swagger (se aplicável) ou coleção genérica.
- Base URL: `http://localhost:3000` (ajuste `PORT` se necessário).
- Headers: `Content-Type: application/json` para requisições com corpo.
- Fluxo sugerido:
  - Criar Categoria
    - Método: `POST`
    - URL: `/categories`
    - Body (raw JSON): `{ "name": "Sobremesa" }`
  - Criar Ingrediente
    - Método: `POST`
    - URL: `/ingredients`
    - Body: `{ "name": "Leite" }`
  - Criar Receita
    - Método: `POST`
    - URL: `/recipes`
    - Body:
      ```json
      {
        "title": "Pavê de chocolate",
        "description": "Camadas de biscoito e creme",
        "ingredients": [
          { "name": "biscoito", "quantity": 200, "unit": "g" },
          { "name": "creme", "quantity": 300, "unit": "ml" },
          { "name": "chocolate", "quantity": 100, "unit": "g" }
        ],
        "steps": ["misturar", "montar", "gelar"],
        "servings": 8,
        "categoryId": "<ID_DA_CATEGORIA>"
      }
      ```
  - **Testar Novos Estados:**
    - Publicar receita: `POST /recipes/:id/publish`
    - Arquivar receita: `POST /recipes/:id/archive`
  - **Testar Escalonamento:**
    - `POST /recipes/:id/scale` com body `{ "servings": 12 }`
  - **Testar Lista de Compras:**
    - `POST /recipes/actions/shopping-list` com body `{ "recipeIds": ["id1", "id2"] }`

- Listagens e filtros:
  - `GET /categories`, `GET /ingredients`, `GET /recipes`
  - `GET /recipes?categoryId=<ID>` para filtrar por categoria
  - `GET /recipes?search=<texto>` para buscar por título/descrição/ingredientes
  - **Lembrete:** `GET /recipes` retorna apenas receitas `published`

- Dicas de uso:
  - Crie um ambiente com variável `base_url` e use `{{ base_url }}` nas requisições.
  - Salve exemplos de corpo usando os arquivos em `requests/`.

## ✨ Novas funcionalidades adicionadas

### 🏷️ Categorias Pré-definidas
O sistema passou a incluir um conjunto de categorias prontas, permitindo ao usuário criar rapidamente estruturas comuns sem precisar definir tudo manualmente. As categorias disponíveis são:
- **Carnes**
- **Massas**
- **Saladas**
- **Sopas**
- **Sobremesas**

Essas opções facilitam o início do fluxo de cadastro, oferecendo uma base sólida para a organização das receitas.

### 📊 Escalonamento de Porções
Recalcula os ingredientes de uma receita para um novo número de porções, sem modificar ou persistir a receita original.

#### Regras implementadas:
- O valor de `servings` deve ser maior que 0.
- A receita deve existir.
- As quantidades dos ingredientes são ajustadas proporcionalmente.
- A operação não altera o estado do sistema.
- A receita original permanece inalterada.

#### Cálculo:
- `factor = newServings / recipe.servings`

#### Endpoint:
```http
POST /recipes/:id/scale
```

#### Body:
```json
{
  "servings": 8
}
```

#### Exemplo de resposta:
```json
{
  "id": "123",
  "name": "Bolo de Cenoura",
  "servings": 8,
  "ingredients": [
    { "ingredientId": "farinha", "quantity": 600, "unit": "g" },
    { "ingredientId": "cenoura", "quantity": 4, "unit": "un" }
  ]
}
```

### 🛒 Lista de Compras Consolidada
A lista de compras **não é um recurso independente** no sistema. Ela é tratada como uma **ação do contexto de Receitas**, responsável por gerar uma visão consolidada dos ingredientes a partir de múltiplas receitas.

#### Regras implementadas:
- O array `recipeIds` deve existir e não pode ser vazio.
- Cada ID deve corresponder a uma receita existente.
- Ingredientes iguais (mesmo `ingredientId` e mesma `unit`) são somados.
- A operação não altera o estado do sistema.
- Nenhuma receita é modificada ou persistida.
- O retorno é apenas uma lista consolidada em memória.

#### Endpoint:
```http
POST /recipes/actions/shopping-list
```

#### Body:
```json
{
  "recipeIds": ["123", "456", "789"]
}
```

#### Exemplo de resposta:
```json
[
  { "ingredientId": "farinha", "unit": "g", "quantity": 1200 },
  { "ingredientId": "cenoura", "unit": "un", "quantity": 6 },
  { "ingredientId": "açúcar", "unit": "g", "quantity": 800 }
]
```

### 🔄 Estados da Receita (Workflow)
Controla o ciclo de vida das receitas, garantindo regras claras para criação, edição, publicação e arquivamento.

#### Regras principais:
- Receitas começam sempre como `draft`.
- Apenas receitas `published` aparecem nas listagens públicas.
- Receitas `draft` podem ser editadas e excluídas.
- Receitas `published` não podem ser excluídas (somente arquivadas).
- Receitas `archived` não podem ser editadas.
- Receitas `archived` não podem ser acessadas (tratadas como inexistentes).

#### Transições de Estado:
- `draft` → `published`
- `published` → `archived`

#### Endpoints:
- **Publicar receita:** `POST /recipes/:id/publish`
- **Arquivar receita:** `POST /recipes/:id/archive`

#### Exemplos de comportamento:
- **Tentativa de editar receita arquivada:**
  ```txt
  Erro: "Recipe is archived and cannot be edited"
  ```
- **Tentativa de excluir receita publicada:**
  ```txt
  Erro: "Only draft or archived recipes can be deleted"
  ```
- **Tentativa de acessar receita arquivada:**
  ```txt
  Erro: "Recipe not found"
  ```

## 💻 Exemplos rápidos (Windows PowerShell)
- Criar categoria usando arquivo:
  ```powershell
  curl.exe -s -X POST http://localhost:3000/categories -H "Content-Type: application/json" --data @requests/category.json
  ```
- Criar ingrediente usando arquivo:
  ```powershell
  curl.exe -s -X POST http://localhost:3000/ingredients -H "Content-Type: application/json" --data @requests/ingredient.json
  ```
- Criar receita (ajuste `categoryId`):
  ```powershell
  curl.exe -s -X POST http://localhost:3000/recipes -H "Content-Type: application/json" --data @requests/recipe.json
  ```
- Publicar receita:
  ```powershell
  curl.exe -s -X POST http://localhost:3000/recipes/123/publish -H "Content-Type: application/json"
  ```
- Escalonar receita:
  ```powershell
  curl.exe -s -X POST http://localhost:3000/recipes/123/scale -H "Content-Type: application/json" --data '{"servings": 12}'
  ```
- Listar categorias:
  ```powershell
  curl.exe -s http://localhost:3000/categories
  ```
- Listar ingredientes:
  ```powershell
  curl.exe -s http://localhost:3000/ingredients
  ```
- Filtrar receitas por texto:
  ```powershell
  curl.exe -s "http://localhost:3000/recipes?search=chocolate"
  ```

## 📁 Estrutura do projeto
```
receitas/
├─ src/
│  ├─ core/
│  │  ├─ utils/
│  │  │  └─ normalizeText.ts
│  │  ├─ CategoryService.ts
│  │  ├─ IngredientService.ts
│  │  ├─ RecipeService.ts
│  │  ├─ models.ts
│  │  └─ store.ts
│  └─ presentation/
│     └─ http/
│        ├─ middlewares/errorHandler.ts
│        ├─ routes/categories.ts
│        ├─ routes/ingredients.ts
│        ├─ routes/recipes.ts
│        └─ server.ts
├─ requests/
│  ├─ category.json
│  ├─ ingredient.json
│  ├─ ingredient-update.json
│  ├─ recipe.json
│  ├─ Insomnia_recipes_requests.yaml
│  └─ recipes_requests.yaml
├─ package.json
├─ tsconfig.json
└─ README.md
```

## 🛠️ Composição do servidor
 - O servidor instancia diretamente os repositórios em memória e os serviços.

### Observação sobre DTOs de criação
- Os repositórios recebem entidades já criadas com `id` e `createdAt` (gerados pela fábrica/serviço).
- As requisições HTTP enviam apenas os campos de entrada (ex.: `{ name }` para categoria/ingrediente; `{ title, description?, ingredients[], steps[], categoryId }` para receita).

## 📜 Scripts
- `npm run dev` — inicia em modo desenvolvimento (ts-node)
- `npm run build` — compila TypeScript
- `npm start` — executa o build compilado

## 👥 Colaboradores
- Francisco de Cássio — @Cassiosampaio2016
- Francisco Mailson — @MailsonSousa88
- Mateus de Araujo — @MateusARJ
- Rikelry Monteiro — @Rikelry
- Vitor Lopes — @Vcoder-00

---
