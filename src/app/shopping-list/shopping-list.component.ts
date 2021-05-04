import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { LoggingService } from '../logging.service';
import {Ingredient} from '../shared/Ingredient.model'
import { ShoppingListService } from './shopping-list.service';
import * as ShoppingListActions from './store/shopping-list.action';
import * as fromApp from '../store/app.reducer';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {

  ingredients : Observable <{ ingredients: Ingredient[] }>;

  private idChangeSub: Subscription;

  constructor(private shoppingListService: ShoppingListService, 
    private loggingService: LoggingService,
    private store: Store<fromApp.AppState>) { }

  ngOnInit(): void {
    this.ingredients = this.store.select('shoppingList');

    /*this.ingredients = this.shoppingListService.getIngredients();
    this.idChangeSub = this.shoppingListService.ingredientsChanged.subscribe(
      (ingredients: Ingredient[]) => {
        console.log('received ingredients= ' + ingredients);
        this.ingredients = ingredients;
      }
    )*/

    this.loggingService.printLog('Hello from ShoppingListComponent ngOnInit()');
  }

  ngOnDestroy(): void {
    //this.idChangeSub.unsubscribe();
  }

  onEditItem(i: number) {
    this.store.dispatch(new ShoppingListActions.StartEdit(i));
    //this.shoppingListService.startEditing.next(i);
  }

}
