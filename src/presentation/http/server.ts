import express from "express"
import { CategoryService } from "../../core/CategoryService.js"
import { RecipeService } from "../../core/RecipeService.js"
import { IngredientService } from "../../core/IngredientService.js"
import { categoriesRoutes } from "./routes/categories.js"
import { recipesRoutes } from "./routes/recipes.js"
import { ingredientsRoutes } from "./routes/ingredients.js"
import { errorHandler } from "./middlewares/errorHandler.js"

const app = express()
app.use(express.json())

const categoryService = new CategoryService()
const recipeService = new RecipeService()
const ingredientService = new IngredientService()

app.use("/categories", categoriesRoutes(categoryService))
app.use("/recipes", recipesRoutes(recipeService))
app.use("/ingredients", ingredientsRoutes(ingredientService))
app.use(errorHandler)

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => {
  process.stdout.write(`server running on http://localhost:${port}\n`)
})
