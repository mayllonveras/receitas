import crypto from "node:crypto"
import { store } from "./store.js"
import { Ingredient } from "./models.js"

export class IngredientService {
  async list(): Promise<Ingredient[]> {
    return [...store.ingredients]
  }

  async get(id: string): Promise<Ingredient> {
    const found = store.ingredients.find((i) => i.id === id)
    if (!found) throw new Error("Ingredient not found")
    return found
  }

  async findByName(name: string): Promise<Ingredient | undefined> {
    return store.ingredients.find((i) => i.name === name)
  }

  async create(data: { name: string }): Promise<Ingredient> {
    const name = data.name.trim()
    if (!name) throw new Error("Name is required")

    const exists = await this.findByName(name)
    if (exists) throw new Error("Ingredient name must be unique")

    const ingredient: Ingredient = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
    }
    store.ingredients.push(ingredient)
    return ingredient
  }

  async update(id: string, data: { name?: string }): Promise<Ingredient> {
    const idx = store.ingredients.findIndex((i) => i.id === id)
    if (idx < 0) throw new Error("Ingredient not found")
    const current = store.ingredients[idx]

    let name = current.name
    if (data.name !== undefined) {
      name = data.name.trim()
      const exists = await this.findByName(name)
      if (exists && exists.id !== id) {
        throw new Error("Ingredient name must be unique")
      }
    }

    const updated = { ...current, name }
    store.ingredients[idx] = updated
    return updated
  }

  async delete(id: string): Promise<void> {
    const idx = store.ingredients.findIndex((i) => i.id === id)
    if (idx >= 0) {
      store.ingredients.splice(idx, 1)
    }
  }
}
