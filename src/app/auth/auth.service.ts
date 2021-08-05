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

    signup(email: string, password: string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey, 
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        ).pipe(
            catchError(this.handleError),
            tap(d => this.handleAuthentication(d))
        );
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        ).pipe(
            catchError(this.handleError),
            tap(d => this.handleAuthentication(d))
        );
    }

    logout() {
        //this.userSub.next(null);
        this.store.dispatch(new AuthActions.Logout());

        this.router.navigate(['/auth']);
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

    private handleAuthentication(data: AuthResponseData) {

        const expirationDate = new Date(new Date().getTime() + (+data.expiresIn * 1000));
        const user = new User(data.email, data.localId, data.idToken, expirationDate);

        //this.userSub.next(user);
        this.store.dispatch(new AuthActions.AuthenticateSuccess({
            email: data.email,
            userId: data.localId,
            token: data.idToken,
            expirationDate: expirationDate
        }));


        this.autoLogout(+data.expiresIn * 1000);
        localStorage.setItem('userData', JSON.stringify(user));
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


    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = 'An unknown error occured';

        if(!errorRes.error || !errorRes.error.error) {
            
        }
        else {
            switch(errorRes.error.error.message){
                case 'EMAIL_EXISTS':
                    errorMessage = 'This email exists already!';
                    break;
                case 'EMAIL_NOT_FOUND': 
                    errorMessage = 'There is no user record corresponding to this identifier. The user may have been deleted.'
                    break;
                case 'INVALID_PASSWORD': 
                    errorMessage = 'The password is invalid or the user does not have a password.'
                    break;
                case 'USER_DISABLED': 
                    errorMessage = 'The user account has been disabled by an administrator.'
                    break;
            }
        }

        return throwError(errorMessage);
    }
}