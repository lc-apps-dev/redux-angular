import { EventEmitter } from "@angular/core";
import { Subject } from "rxjs";
import { Ingredient } from "../shared/Ingredient.model";


export class ShoppingListService {

    ingredientsChanged = new Subject<Ingredient[]>();

    startEditing = new Subject<number>();

    private ingredients : Ingredient[] = [
        new Ingredient('Apple', 5),
        new Ingredient('Tomatoes', 10),
    
      ];

      getIngredients() {
          return this.ingredients.slice();
      }


    addIngredient(ingredient: Ingredient) {
        console.log('addIngredient: ingredient=' + ingredient);
        this.ingredients.push(ingredient);
        this.ingredientsChanged.next(this.ingredients.slice());
    }

    addIngredients(ingredients: Ingredient[]) {

        console.log('addIngredients: ingredients list=' + ingredients);

        this.ingredients.push(...ingredients);
        this.ingredientsChanged.next(this.ingredients.slice());
    }

    getIngredient(index: number) {
        return this.ingredients[index];
    }
    
    updateIngredient(index: number, newIng: Ingredient) {
        this.ingredients[index] = newIng;
        this.ingredientsChanged.next(this.ingredients.slice());
    }


    deleteIngredient(index: number) {
        this.ingredients.splice(index, 1);
        this.ingredientsChanged.next(this.ingredients.slice());
    }
}