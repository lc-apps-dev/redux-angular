import { Action } from "@ngrx/store"
import { Recipe } from "src/app/recipes/recipe.model";


export const SET_RECIPES = '[Recipes] Set Recipes';


export class SetRecipes implements Action {

    readonly type = SET_RECIPES;

    constructor (public payload: Recipe[]) {} 
}


export type RecipesActions = SetRecipes;