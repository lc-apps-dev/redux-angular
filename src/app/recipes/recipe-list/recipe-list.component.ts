import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {Recipe} from '../recipe.model';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy {


  recipes: Recipe [];

  recipeChanged: Subscription;

  constructor(private recipeService: RecipeService,
    private router: Router,
    private route: ActivatedRoute) { }
  

  ngOnInit(): void {
    this.recipes = this.recipeService.getRecipes();

    this.recipeChanged = this.recipeService.recipeChanged.subscribe((newRecipes: Recipe []) => {
      this.recipes = newRecipes;
    });
  }

  ngOnDestroy(): void {
    this.recipeChanged.unsubscribe();
  }

  onNewRecipe() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

}
