import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";

import { environment } from '../../environments/environment';
import { Store } from "@ngrx/store";
import * as fromApp from "../store/app.reducer";
import * as AuthActions from "./store/auth.actions";

export interface AuthResponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean
}


@Injectable({
    providedIn: 'root'
})
export class AuthService {

    //userSub = new BehaviorSubject<User>(null);

    constructor(private http: HttpClient, private router: Router, private store: Store<fromApp.AppState>) {}

    private tokenExpirationTimer: any;

    

    logout() {
        //this.userSub.next(null);
        this.store.dispatch(new AuthActions.Logout());

        localStorage.removeItem('userData');

        if(this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer)
        }
        this.tokenExpirationTimer = null;
    }

    autoLogout(expirationduration: number) {

        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationduration);
    }

   

    autoLogin() {
       const userData : {
           email: string;
           id: string;
           _token: string;
           _tokenExpirationDate: string;
       } = JSON.parse(localStorage.getItem('userData'));
       
       if(!userData) {
           console.log("No userData in local storage");
           return;
       }

       const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

       if(loadedUser.token) {
           //this.userSub.next(loadedUser);
            this.store.dispatch(new AuthActions.AuthenticateSuccess({
                email: loadedUser.email,
                userId: loadedUser.id,
                token: loadedUser.token,
                expirationDate: new Date(userData._tokenExpirationDate)
            }));

           const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
           this.autoLogout(expirationDuration);
       }
    }


}