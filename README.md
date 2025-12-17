# Receitas — Sistema de Gerenciamento de Receitas e Categorias

Aplicação em camadas (SRP) construída com Node.js, TypeScript e Express, com contêiner simples de injeção de dependências. Inclui serviços de negócio, repositórios em memória e API HTTP.

## Sumário
- Visão Geral
- Arquitetura
- Pré-requisitos
- Instalação
- Execução
- Endpoints
- Exemplos rápidos (Windows)
- Estrutura do projeto

## Visão Geral
- CRUD de Categorias, Ingredientes e Receitas.
- Busca e filtragem de receitas por `categoryId` e por texto (`search`).
- Regras de negócio:
  - Unicidade de nome para Categoria e Ingrediente.
  - Receita deve referenciar uma Categoria existente.
  - Bloqueio de exclusão de Categoria quando houver Receitas relacionadas.

## Arquitetura Simplificada (2 Camadas)
- `core`: Contém toda a lógica de negócio, modelos de dados e acesso aos dados (armazenamento em memória).
- `presentation`: API HTTP (Express), rotas e configuração do servidor.

- Referências úteis no código:
- Servidor e rotas: `src/presentation/http`.
- Lógica de negócio (Services): `src/core/*Service.ts`.
- Dados em memória: `src/core/store.ts`.

### Fluxo de Dados
1. Requisição HTTP chega na `presentation`.
2. Controller/Rota chama o `Service` correspondente no `core`.
3. `Service` valida regras e manipula o `store` (banco de dados em memória).
4. Resposta retorna pela `presentation`.

## Pré-requisitos
- Node.js 18+ (recomendado 20+)
- npm 9+

## Instalação
1. Baixar o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd receitas
   ```
   Substitua `<URL_DO_REPOSITORIO>` pelo endereço do seu repositório.
2. Instalar dependências:
   ```bash
   npm install
   ```

## Execução
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

## Endpoints
Categorias
- `GET /categories` — lista todas
- `GET /categories/:id` — detalhe
- `POST /categories` — cria `{ name }`
- `PUT /categories/:id` — atualiza `{ name? }`
- `DELETE /categories/:id` — remove (bloqueado se houver receitas)

Ingredientes
- `GET /ingredients` — lista todos
- `GET /ingredients/:id` — detalhe
- `POST /ingredients` — cria `{ name }`
- `PUT /ingredients/:id` — atualiza `{ name? }`
- `DELETE /ingredients/:id` — remove

Receitas
- `GET /recipes?categoryId=&search=` — lista com filtros
- `GET /recipes/:id` — detalhe
- `POST /recipes` — cria `{ title, description?, ingredients: [{ name, quantity, unit }], steps[], categoryId }`
- `PUT /recipes/:id` — atualiza parcial dos mesmos campos
- `DELETE /recipes/:id` — remove

Códigos de erro: as validações retornam `400` com `{ error: "mensagem" }` (middleware em `src/presentation/http/middlewares/errorHandler.ts`).

## Clientes HTTP (Insomnia/Postman)
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
- Listagens e filtros:
  - `GET /categories`, `GET /ingredients`, `GET /recipes`
  - `GET /recipes?categoryId=<ID>` para filtrar por categoria
  - `GET /recipes?search=<texto>` para buscar por título/descrição/ingredientes
- Dicas de uso:
  - Crie um ambiente com variável `base_url` e use `{{ base_url }}` nas requisições.
  - Salve exemplos de corpo usando os arquivos em `requests/`.

## Exemplos rápidos (Windows PowerShell)
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

## Estrutura do projeto
```
receitas/
├─ src/
│  ├─ core/
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
│  └─ recipe.json
├─ package.json
├─ tsconfig.json
└─ README.md
```

## Composição do servidor
- O servidor instancia diretamente os repositórios em memória e os serviços.

### Observação sobre DTOs de criação
- Os repositórios recebem entidades já criadas com `id` e `createdAt` (gerados pela fábrica/serviço).
- As requisições HTTP enviam apenas os campos de entrada (ex.: `{ name }` para categoria/ingrediente; `{ title, description?, ingredients[], steps[], categoryId }` para receita).

## Scripts
- `npm run dev` — inicia em modo desenvolvimento (ts-node)
- `npm run build` — compila TypeScript
- `npm start` — executa o build compilado
