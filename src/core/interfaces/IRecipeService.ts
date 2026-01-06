import { promises } from "node:dns";
import { Recipe, CreateRecipeInput } from "../models.js"

export interface IRecipeService {
  list(filter?: { categoryId?: string; categoryName?: string; search?: string }): Promise<Recipe[]>
  get(id: string): Promise<Recipe>
  create(input: CreateRecipeInput): Promise<Recipe>
  update(id: string, data: Partial<CreateRecipeInput>): Promise<Recipe>
  delete(id: string): Promise<void>
  archivar(id:string): Promise<Recipe>///Necessario pra emplementação status
  publicar(id:string): Promise<Recipe>///Necessario pra emplementação status
}