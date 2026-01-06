import crypto from "node:crypto"
import { store } from "./store.js"
import { Recipe, CreateRecipeInput } from "./models.js"
import { CategoryService } from "./CategoryService.js"
import { IngredientService } from "./IngredientService.js"
import { IRecipeService } from "./interfaces/IRecipeService.js"

export class RecipeService implements IRecipeService {
  async scaleRecipe(id: string, servings: number): Promise<Recipe> {
    if (!(servings > 0)) throw new Error("Servings must be greater than 0");
  const recipe = await this.get(id);
  if (!recipe) throw new Error("Recipe not found");

  const factor = servings / recipe.servings;

  // Cria uma nova receita escalonada (não altera a original)
  return {
    ...recipe,
    servings,
    ingredients: recipe.ingredients.map(ing => ({
      ...ing,
      quantity: ing.quantity * factor
    })),
    createdAt: new Date()
  };
  }

  private categoryService = new CategoryService()
  private ingredientService = new IngredientService()

  async list(filter?: { categoryId?: string; categoryName?: string; search?: string }): Promise<Recipe[]> {
    let categoryId = filter?.categoryId

    if (filter?.categoryName) {
      const category = await this.categoryService.findByName(filter.categoryName.trim())
      if (category) {
        categoryId = category.id
      } else {
        return []
      }
    }

    let items = [...store.recipes]

    items = items.filter(recipe => recipe.status === 'published')
    
    if (categoryId) {
      items = items.filter(r => r.categoryId === categoryId)
    }

    if (filter?.search) {
      const searchQuery = filter.search.trim().toLowerCase()
      const allIngredients = await this.ingredientService.list()
      const nameById = new Map(allIngredients.map((ing) => [ing.id, ing.name.toLowerCase()]))
      
      items = items.filter((recipe) => {
        if (recipe.title.toLowerCase().includes(searchQuery)) return true
        if (recipe.description && recipe.description.toLowerCase().includes(searchQuery)) return true
        return recipe.ingredients.some((ingredient) => {
          const name = nameById.get(ingredient.ingredientId)
          return !!name && name.includes(searchQuery)
        })
      })
    }
    return items
  }

  async get(id: string): Promise<Recipe> {
    const found = store.recipes.find(r => r.id === id)
    if (!found) throw new Error("Recipe not found")
    return found
  }

  async create(input: CreateRecipeInput): Promise<Recipe> {
    const title = input.title.trim()
    if (!title) throw new Error("Title is required")

    // Validate Category
    const category = await this.categoryService.get(input.categoryId).catch(() => null)
    if (!category) throw new Error("Category does not exist")

    // Process Ingredients
    const incoming = Array.isArray(input.ingredients)
      ? input.ingredients.map((i) => ({
          name: String(i.name ?? "").trim(),
          quantity: Number(i.quantity ?? 0),
          unit: String(i.unit ?? "").trim(),
        }))
      : []

    if (incoming.length === 0) throw new Error("Ingredients are required")

    incoming.forEach((i) => {
      if (!i.name) throw new Error("Ingredient name is required")
      if (!(i.quantity > 0)) throw new Error("Ingredient quantity must be > 0")
      if (!i.unit) throw new Error("Ingredient unit is required")
    })

    const resolved = [] as { ingredientId: string; quantity: number; unit: string }[]
    for (const i of incoming) {
      const existing = await this.ingredientService.findByName(i.name)
      const ingredient = existing ?? (await this.ingredientService.create({ name: i.name }))
      resolved.push({ ingredientId: ingredient.id, quantity: i.quantity, unit: i.unit })
    }

    const steps = Array.isArray(input.steps) ? input.steps.map((s) => String(s)) : []
    
    const servings = Number(input.servings)
    if (!(servings > 0)) throw new Error("Servings must be greater than 0")

    const recipe: Recipe = {
      id: crypto.randomUUID(),
      title,
      description: input.description,
      ingredients: resolved,
      steps,
      servings,
      categoryId: input.categoryId,
      status: 'draft',
      createdAt: new Date(),
    }
    store.recipes.push(recipe)
    return recipe
  }

  async update(id: string, data: Partial<CreateRecipeInput>): Promise<Recipe> {
    const idx = store.recipes.findIndex(r => r.id === id)
    if (idx < 0) throw new Error("Recipe not found")
    const current = store.recipes[idx]

    if (current.status === 'archived') {
      throw new Error("Archived recipes cannot be edited")
    }

    const updated = { ...current }

    if (data.categoryId) {
      const category = await this.categoryService.get(data.categoryId).catch(() => null)
      if (!category) throw new Error("Category does not exist")
      updated.categoryId = data.categoryId
    }

    if (data.title !== undefined) {
      const title = data.title.trim()
      if (!title) throw new Error("Title is required")
      updated.title = title
    }

    if (data.description !== undefined) {
      updated.description = data.description
    }

    if (data.steps !== undefined) {
      updated.steps = Array.isArray(data.steps) ? [...data.steps] : []
    }

    if (data.servings !== undefined) {
      const servings = Number(data.servings)
      if (!(servings > 0)) throw new Error("Servings must be greater than 0")
      updated.servings = servings
    }

    if (data.ingredients !== undefined) {
      const incoming = Array.isArray(data.ingredients)
        ? data.ingredients.map((i) => ({
            name: String(i.name ?? "").trim(),
            quantity: Number(i.quantity ?? 0),
            unit: String(i.unit ?? "").trim(),
          }))
        : []

      incoming.forEach((i) => {
        if (!i.name) throw new Error("Ingredient name is required")
        if (!(i.quantity > 0)) throw new Error("Ingredient quantity must be > 0")
        if (!i.unit) throw new Error("Ingredient unit is required")
      })

      const resolved = [] as { ingredientId: string; quantity: number; unit: string }[]
      for (const i of incoming) {
        const existing = await this.ingredientService.findByName(i.name)
        const ingredient = existing ?? (await this.ingredientService.create({ name: i.name }))
        resolved.push({ ingredientId: ingredient.id, quantity: i.quantity, unit: i.unit })
      }
      updated.ingredients = resolved
    }

    store.recipes[idx] = updated
    return updated
  }

  async delete(id: string): Promise<void> {
    const idx = store.recipes.findIndex(r => r.id === id)
    if (idx < 0) throw new Error("Recipe not found")

    const recipe = store.recipes[idx]

    if (recipe.status === 'published') {
    throw new Error("Published recipes cannot be deleted. They must be archived.")
    }

  store.recipes.splice(idx, 1)
}
  async consolidateShoppingList(recipeIds: string[]): Promise<Array<{ name: string; unit: string; quantity: number }>> {
    
    // Search Recipe

    const findRecipesById = await Promise.all(recipeIds.map((id) => this.get(id)));
    
    const allIngredients = await this.ingredientService.list();
    const nameById = new Map(allIngredients.map((ing) => [ing.id, ing.name]));  

    // Consolidate Recipes
    const consolidated = new Map<string, { name : string; unit : string, quantity : number}>();

    for (const recipe of findRecipesById) {
      for (const ing of recipe.ingredients) {
        const key = `${ing.ingredientId}_${ing.unit}`;
        const name = nameById.get(ing.ingredientId) ?? "Unknown";

        if (consolidated.has(key)) {
          consolidated.get(key)!.quantity += ing.quantity;
        } else {
          consolidated.set(key, { name, unit : ing.unit, quantity : ing.quantity});
        }
      }
    }

    return Array.from(consolidated.values());
  }
}
