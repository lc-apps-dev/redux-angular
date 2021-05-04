
import { Action } from "@ngrx/store";
import { Ingredient } from "../../shared/Ingredient.model";
import * as ShoppingListActions from "./shopping-list.action";

export interface State {
  ingredients: Ingredient[],
  editedIngredient: Ingredient,
  editedIngredientIndex: number
}

export interface AppState {
  shoppingList: State
}

const initialState: State = { 
    ingredients: [
        new Ingredient('Apple', 5),
        new Ingredient('Tomatoes', 10),
      ],
      editedIngredient: null,
      editedIngredientIndex: -1
}

export function shoppingListReducer(state: State = initialState, action: ShoppingListActions.ShoppingListActions) {

  switch(action.type) {

    case ShoppingListActions.ADD_INGREDIENT:
      return {
        ...state,
        ingredients: [...state.ingredients, (<ShoppingListActions.AddIngredient>action).payload]
      };

      case ShoppingListActions.ADD_INGREDIENTS:
        
        return {
          ...state,
          ingredients: [...state.ingredients].concat((<ShoppingListActions.AddIngredients>action).payload)
        };

      case ShoppingListActions.UPDATE_INGREDIENT:
      
        const action2: ShoppingListActions.UpdateIngredient = <ShoppingListActions.UpdateIngredient> action;

        const ingredient = state.ingredients[state.editedIngredientIndex];
        const updatedIngredient = {
          ...ingredient,
          ...action2.payload
        };

        const updatedIngredients = [...state.ingredients];
        updatedIngredients[state.editedIngredientIndex] = updatedIngredient;

        return {
          ...state,
          ingredients: updatedIngredients,
          editedIngredient: null,
          editedIngredientIndex: -1
        };

      case ShoppingListActions.DELETE_INGREDIENT:
    
        return {
          ...state,
          ingredients: state.ingredients.filter((ig, elIndex) => {
            return elIndex !== state.editedIngredientIndex;
          }),
          editedIngredient: null,
          editedIngredientIndex: -1
        };

      case ShoppingListActions.START_EDIT:
        return {
          ...state,
          editedIngredientIndex: (<ShoppingListActions.StartEdit>action).payload,
          editedIngredient: {...state.ingredients[(<ShoppingListActions.StartEdit>action).payload]}
        };

      case ShoppingListActions.STOP_EDIT:
        return {
          ...state,
          editedIngredientIndex: -1,
          editedIngredient: null
        };

      default:
        return state;
  }

}