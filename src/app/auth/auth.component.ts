import { Component, ComponentFactoryResolver, OnDestroy, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceholderDirective } from "../shared/placeholder/placeholder.directive";
import { AuthService, AuthResponseData } from "./auth.service";


@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnDestroy {

    constructor(
        private authService: AuthService, 
        private router: Router,
        private componentFactoryResolver: ComponentFactoryResolver) {}


    isLoginMode = true;
    isLoading = false;
    error: string = null;

    private closeSub : Subscription;

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

        this.isLoading = true;

        let authObs: Observable<AuthResponseData>;

        if(this.isLoginMode) {
            authObs = this.authService.login(email, password);
        }
        else {           
            authObs = this.authService.signup(email, password);
        }

        authObs.subscribe(data => {
                console.log(data);
                this.isLoading = false;
                this.router.navigate(['/recipes']);
            }, 
            errorResponse => {
                console.error(errorResponse);
                this.error = errorResponse;
                this.showErrorAlert(errorResponse);
                this.isLoading = false;
            });
        
        
        authForm.reset();
    }

    onHandleError() {
        this.error = null;
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
    }

}