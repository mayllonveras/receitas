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

  router.get("/:id/scale", async (req, res, next) => {
  try {
    const id = req.params.id
    const servings = Number(req.query.servings)

    const result = await service.scaleRecipe(id, servings)

    res.json(result)
  } catch (error) {
    next(error)
  }
})

  return router
}

