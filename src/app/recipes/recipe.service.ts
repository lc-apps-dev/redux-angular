import { EventEmitter, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Subject } from "rxjs";
import { Ingredient } from "../shared/Ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";
import * as ShoppingListActions from "../shopping-list/store/shopping-list.action";
import { Recipe } from "./recipe.model";
import * as fromShoppingList from "../shopping-list/store/shopping-list.reducer";

@Injectable()
export class RecipeService {

    recipeSelected = new Subject<Recipe>();

    recipeChanged = new Subject<Recipe[]>();


    constructor(private shoppingListService: ShoppingListService,
        private store: Store<fromShoppingList.AppState>) {}
    

    private   recipes: Recipe[] = [
        /*new Recipe('Tasty sznycel', 'This is a simply a test', 'https://www.eatwell101.com/wp-content/uploads/2019/08/tuscan-salmon-recipe.jpg', [
            new Ingredient('Meat' , 1), new Ingredient('French Fries' , 20)
        ]),
        new Recipe('Burger', 'This is a simple test', 'https://www.eatwell101.com/wp-content/uploads/2019/08/tuscan-salmon-recipe.jpg', [
            new Ingredient('Buns' , 2), new Ingredient('Meat' , 1)
        ])*/
      ]; 

      setRecipes(recipes: Recipe []) {
          this.recipes = recipes;
          this.emitRecipesChanged();
      }

    getRecipes() {
        return this.recipes.slice();
    }

    getRecipe(id: number) {
        return this.recipes[id];
    }

    addIngredientsToShoppingList(ingredients : Ingredient []){
        //this.shoppingListService.addIngredients(ingredients);
        this.store.dispatch(new ShoppingListActions.AddIngredients(ingredients));
    }

    private emitRecipesChanged() {
        this.recipeChanged.next(this.recipes.slice());
    }

    addRecipe(recipe: Recipe) {
        this.recipes.push(recipe);
        this.emitRecipesChanged();
    }

    updateRecipe(index: number, newRecipe: Recipe) {
        this.recipes[index] = newRecipe;
        this.emitRecipesChanged();
    }

    deleteRecipe(index: number) {
        this.recipes.splice(index, 1);
        this.emitRecipesChanged();
    }
    
}