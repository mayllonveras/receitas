import { Recipe, CreateRecipeInput } from "../models.js"

export interface IRecipeService {
  list(filter?: { categoryId?: string; categoryName?: string; search?: string }): Promise<Recipe[]>
  get(id: string): Promise<Recipe>
  create(input: CreateRecipeInput): Promise<Recipe>
  update(id: string, data: Partial<CreateRecipeInput>): Promise<Recipe>
  delete(id: string): Promise<void>
  /**
   * MODIFICAÇÃO: Métodos para alterar o status da receita
   * @param id - Identificador da receita a ser modificada. 
   */
  publish(id: string): Promise<Recipe>
  archive(id: string): Promise<Recipe>
    /**
   * CÓDIGO NOVO
   * Escalonamento inteligente de porções (sem persistência).
   */
  scaleRecipe(id: string, newServings: number): Promise<Recipe>

  /**
   * CÓDIGO NOVO
   * Geração de lista de compras consolidada.
   */
  generateShoppingList(
    recipeIds: string[]
  ): Promise<{ ingredientId: string; unit: string; quantity: number }[]>
}
