export type Category = {
  id: string
  name: string
  createdAt: Date
}

export type Ingredient = {
  id: string
  name: string
  createdAt: Date
}

export type Recipe = {
  id: string
  title: string
  description?: string
  ingredients: { ingredientId: string; quantity: number; unit: string }[]
  steps: string[]
  servings: number
  categoryId: string
  createdAt: Date
  status:'draft' | 'published' | 'archived'///Status adicionado em recipes
}

export type CreateRecipeInput = {
  title: string
  description?: string
  ingredients: { name: string; quantity: number; unit: string }[]
  steps: string[]
  servings: number
  categoryId: string
}
