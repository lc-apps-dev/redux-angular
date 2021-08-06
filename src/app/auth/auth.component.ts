import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceholderDirective } from "../shared/placeholder/placeholder.directive";
import { AuthService } from "./auth.service";
import * as fromApp from "../store/app.reducer";
import { Store } from "@ngrx/store";
import * as AuthActions from "./store/auth.actions";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {

    constructor(
        private authService: AuthService, 
        private router: Router,
        private componentFactoryResolver: ComponentFactoryResolver,
        private store: Store<fromApp.AppState>) {}


    ngOnInit(): void {

        this.storeSub = this.store.select('auth').subscribe(authState => {
            this.isLoading = authState.loading;
            this.error = authState.authError;

            if(this.error) {
                this.showErrorAlert(this.error);
            }
        });
    }


    isLoginMode = true;
    isLoading = false;
    error: string = null;

    private closeSub : Subscription;

    private storeSub : Subscription;


    @ViewChild(PlaceholderDirective, { static: false }) alertHost: PlaceholderDirective;

    onSwitchMode() {
        this.isLoginMode = !this.isLoginMode;
    }

    onSubmit(authForm: NgForm) {

        if(!authForm.valid) {
            return;
        }

        const email = authForm.value.email;
        const password = authForm.value.email;


        if(this.isLoginMode) {
            //authObs = this.authService.login(email, password);
            this.store.dispatch(new AuthActions.LoginStart({email: email, password: password}));
        }
        else {           
            this.store.dispatch(new AuthActions.SignupStart({email: email, password: password}));
        }        
        
        authForm.reset();
    }

    onHandleError() {
        this.store.dispatch(new AuthActions.ClearError());
    }

    private showErrorAlert(message: string) {

        const alertComponentFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
        const hostViewContainerRef = this.alertHost.viewContainerRef;
        
        hostViewContainerRef.clear();

        const componentRef = hostViewContainerRef.createComponent(alertComponentFactory);

        componentRef.instance.message = message;
        this.closeSub = componentRef.instance.close.subscribe(() => {
            this.closeSub.unsubscribe();
            hostViewContainerRef.clear();
        });
    }

    ngOnDestroy(): void {
        if(this.closeSub) {
            this.closeSub.unsubscribe();
        }

        if(this.storeSub) {
            this.storeSub.unsubscribe();
        }
    }

}