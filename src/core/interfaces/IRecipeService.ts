import { Recipe, CreateRecipeInput } from "../models.js"

export interface IRecipeService {
  list(filter?: { categoryId?: string; categoryName?: string; search?: string }): Promise<Recipe[]>;
  get(id: string): Promise<Recipe>;
  create(input: CreateRecipeInput): Promise<Recipe>;
  update(id: string, data: Partial<CreateRecipeInput>): Promise<Recipe>;
  delete(id: string): Promise<void>;
  consolidateShoppingList(recipeIds: string[]): Promise<Array<{ name: string, unit: string, quantity: number }>>;
  scaleRecipe(id: string, servings: number) : Promise<Recipe>;
}
