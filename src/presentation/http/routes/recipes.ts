import { Router } from "express"
import { IRecipeService } from "../../../core/interfaces/IRecipeService.js"

export function recipesRoutes(service: IRecipeService) {
  const router = Router()

  router.get("/", async (req, res, next) => {
    try {
      const items = await service.list({
        categoryId: req.query.categoryId as string | undefined,
        categoryName: req.query.categoryName as string | undefined,
        search: req.query.search as string | undefined,
      })
      res.json(items)
    } catch (error) {
      next(error)
    }
  })

  router.get("/:id", async (req, res, next) => {
    try {
      const item = await service.get(req.params.id)
      res.json(item)
    } catch (error) {
      next(error)
    }
  })

  router.post("/", async (req, res, next) => {
    try {
      const item = await service.create({
        title: String(req.body.title ?? ""),
        description: req.body.description,
        ingredients: Array.isArray(req.body.ingredients)
          ? req.body.ingredients.map((i: any) => ({
              name: String(i?.name ?? ""),
              quantity: Number(i?.quantity ?? 0),
              unit: String(i?.unit ?? ""),
            }))
          : [],
        steps: Array.isArray(req.body.steps) ? req.body.steps.map(String) : [],
        servings: Number(req.body.servings ?? 0),
        categoryId: String(req.body.categoryId ?? ""),
      })
      res.status(201).json(item)
    } catch (error) {
      next(error)
    }
  })

  router.put("/:id", async (req, res, next) => {
    try {
      const item = await service.update(req.params.id, {
        title: req.body.title,
        description: req.body.description,
        ingredients: req.body.ingredients,
        steps: req.body.steps,
        servings: req.body.servings,
        categoryId: req.body.categoryId,
      })
      res.json(item)
    } catch (error) {
      next(error)
    }
  })

  router.delete("/:id", async (req, res, next) => {
    try {
      await service.delete(req.params.id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  /**
   * CÓDIGO NOVO
   * Endpoint para escalonamento de porções
   * Não persiste dados, apenas retorna cálculo proporcional
   */
  router.post("/:id/scale", async (req, res, next) => {
    try {
      const servings = Number(req.body.servings)
      const recipe = await service.scaleRecipe(req.params.id, servings)
      res.json(recipe)
    } catch (error) {
      next(error)
    }
  })

  /**
   * CÓDIGO NOVO
   *  Ação do contexto de receitas para geração de lista de compras consolidada
   */
  router.post("/actions/shopping-list", async (req, res, next) => {
    try {
      const recipeIds = req.body.recipeIds
      const result = await service.generateShoppingList(recipeIds)
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  /**
   * CÓDIGO NOVO
   * Endpoint para publicar receita (draft → published)
   */
  router.post("/:id/publish", async (req, res, next) => {
    try {
      const recipe = await service.publish(req.params.id)
      res.json(recipe)
    } catch (error) {
      next(error)
    }
  })

  /**
   * CÓDIGO NOVO
   * Endpoint para arquivar receita (published → archived)
   */
  router.post("/:id/archive", async (req, res, next) => {
    try {
      const recipe = await service.archive(req.params.id)
      res.json(recipe)
    } catch (error) {
      next(error)
    }
  })

  return router
}
