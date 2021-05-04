import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Ingredient } from 'src/app/shared/Ingredient.model';
import { ShoppingListService } from '../shopping-list.service';
import * as ShoppingListActions from '../store/shopping-list.action';
import * as fromShoppingList from '../store/shopping-list.reducer';


@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {

  @ViewChild('f', {static: true}) shoppingListForm: NgForm;

  //@ViewChild('nameInput', {static: true}) nameInputRef :ElementRef;
  
  //@ViewChild('amountInput', {static: true}) amountInputRef :ElementRef;
  
  //@Output() ingridientAdded = new EventEmitter<Ingredient>();

  subscription: Subscription;
  editMode = false;
  //editedItemIndex: number;

  editedItem: Ingredient;

  constructor(private shoppingListService: ShoppingListService,
    private store: Store<fromShoppingList.AppState>) { }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.store.dispatch(new ShoppingListActions.StopEdit());
  }

  ngOnInit(): void {

    this.subscription = this.store.select('shoppingList').subscribe(stateData => {
      if(stateData.editedIngredientIndex>-1) {
        this.editMode = true;
        this.editedItem = stateData.editedIngredient;

        this.shoppingListForm.setValue({
          name: this.editedItem.name,
          amount: this.editedItem.amount
        });

      } else {
        this.editMode = false;
      }
    });

  /*
    this.subscription = this.shoppingListService.startEditing.subscribe(
      (index: number) => {
        this.editMode = true;
        this.editedItemIndex = index;
        this.editedItem = this.shoppingListService.getIngredient(index);
        
      }
    );*/

  }

  onSubmit(form: NgForm) {

    const value = form.value;
    //const ingName = this.nameInputRef.nativeElement.value;
    //const ingAmount = this.amountInputRef.nativeElement.value;
    const newIngredient = new Ingredient(value.name, value.amount);
    //this.ingridientAdded.emit(newIngredient);
    
    if(this.editMode) {
      //this.shoppingListService.updateIngredient(this.editedItemIndex, newIngredient);
      this.store.dispatch(new ShoppingListActions.UpdateIngredient( 
        //index:this.editedItemIndex,  
        newIngredient
      ));
    }
    else {
      //this.shoppingListService.addIngredient(newIngredient);
      this.store.dispatch(new ShoppingListActions.AddIngredient(newIngredient));
    }
    form.reset();

    this.editMode = false;
    console.log('clicked add');
  }

  onClear() {
    this.shoppingListForm.reset();
    this.editMode = false;
    this.store.dispatch(new ShoppingListActions.StopEdit());
  }

  onDelete() {
    this.onClear();
    //this.shoppingListService.deleteIngredient(this.editedItemIndex);
    this.store.dispatch(new ShoppingListActions.DeleteIngredient(/*this.editedItemIndex*/));
  }


}
