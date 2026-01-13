import crypto from "node:crypto"
import { store } from "./store.js"
import { Ingredient } from "./models.js"
import { IIngredientService } from "./interfaces/IIngredientService.js"
import { normalizeText } from "./utils/normalizeText.js"

export class IngredientService implements IIngredientService {
  async list(): Promise<Ingredient[]> {
    return [...store.ingredients]
  }

  async get(id: string): Promise<Ingredient> {
    const found = store.ingredients.find((i) => i.id === id)
    if (!found) throw new Error("Ingredient not found")
    return found
  }

    /**
 * CÓDIGO MODIFICADO
 *
 * Implementa busca por nome de categoria de forma que ignora espaços adicionais e
 * vira case-insensitive.
 *
 * A função `normalizeText` remove acentos, converte para minúsculas e aplica
 * `.trim()`, garantindo que variações como:
 * "Ovo", " ovo ", "ÔVO" ou "ôvo"
 * sejam tratadas como equivalentes.
 *
 * Isso impede duplicidades lógicas e garante integridade e consistência
 * dos dados no sistema.
 */
  async findByName(name: string): Promise<Ingredient | undefined> {
  const normalized = normalizeText(name)

  return store.ingredients.find(i =>
    normalizeText(i.name) === normalized
  )
}

/**
 * CÓDIGO MODIFICADO
 *
 * Implementa criação de ingredientes de forma robusta.
 * 
 * - Converte `data.name` para string, evitando erro caso seja `null` ou `undefined`.
 * - Aplica `.trim()` para remover espaços extras no início e no fim.
 * - Garante que o nome não seja vazio após normalização.
 * - Valida duplicidade usando nome normalizado (sem acentos, em minúsculas e sem espaços).
 *
 */

async create(data: { name: string }): Promise<Ingredient> {
  const name = String(data.name ?? "").trim()

  if (!name) {
    throw new Error("Ingredient name is required")
  }

  // verifica duplicidade (sem acentos, minúsculo, trim)
  const existing = await this.findByName(name)
  if (existing) {
    throw new Error("Ingredient name already exists")
  }

  const ingredient: Ingredient = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date()
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
