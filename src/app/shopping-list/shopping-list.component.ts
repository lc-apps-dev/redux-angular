import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggingService } from '../logging.service';
import {Ingredient} from '../shared/Ingredient.model'
import { ShoppingListService } from './shopping-list.service';
@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {

  ingredients : Ingredient[];

  private idChangeSub: Subscription;

  constructor(private shoppingListService: ShoppingListService, 
    private loggingService: LoggingService) { }

  ngOnInit(): void {
    this.ingredients = this.shoppingListService.getIngredients();
    this.idChangeSub = this.shoppingListService.ingredientsChanged.subscribe(
      (ingredients: Ingredient[]) => {
        console.log('received ingredients= ' + ingredients);
        this.ingredients = ingredients;
      }
    )

    this.loggingService.printLog('Hello from ShoppingListComponent ngOnInit()');
  }

  ngOnDestroy(): void {
    this.idChangeSub.unsubscribe();
  }

  onEditItem(i: number) {
    this.shoppingListService.startEditing.next(i);
  }

}
