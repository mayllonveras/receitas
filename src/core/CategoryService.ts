import crypto from "node:crypto"
import { store } from "./store.js"
import { Category } from "./models.js"

export class CategoryService {
  async list(): Promise<Category[]> {
    return [...store.categories]
  }

  async get(id: string): Promise<Category> {
    const found = store.categories.find((c) => c.id === id)
    if (!found) throw new Error("Category not found")
    return found
  }

  async findByName(name: string): Promise<Category | undefined> {
    return store.categories.find((c) => c.name === name)
  }

  async create(data: { name: string }): Promise<Category> {
    const name = data.name.trim()
    if (!name) throw new Error("Name is required")
    
    const exists = await this.findByName(name)
    if (exists) throw new Error("Category name must be unique")

    const category: Category = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
    }
    store.categories.push(category)
    return category
  }

  async update(id: string, data: { name?: string }): Promise<Category> {
    const idx = store.categories.findIndex((c) => c.id === id)
    if (idx < 0) throw new Error("Category not found")
    const current = store.categories[idx]

    let name = current.name
    if (data.name !== undefined) {
      name = data.name.trim()
      const exists = await this.findByName(name)
      if (exists && exists.id !== id) {
        throw new Error("Category name must be unique")
      }
    }

    const updated = { ...current, name }
    store.categories[idx] = updated
    return updated
  }

  async delete(id: string): Promise<void> {
    // Check usage in recipes
    const hasRecipes = store.recipes.some((r) => r.categoryId === id)
    if (hasRecipes) throw new Error("Cannot delete category with recipes")
    
    const idx = store.categories.findIndex((c) => c.id === id)
    if (idx >= 0) {
      store.categories.splice(idx, 1)
    }
  }
}
