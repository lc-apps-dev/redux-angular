import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../user.model';
import * as AuthActions from './auth.actions';

export interface AuthResponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean
}

const handleAuthentication = (expiresIn: number, email: string, userId: string, token: string) => {

    const expirationDate = new Date(new Date().getTime() + (+expiresIn * 1000));

    const user = new User(email, userId, token, expirationDate);
    localStorage.setItem('userData', JSON.stringify(user));

    return (new AuthActions.AuthenticateSuccess({
        email: email,
        userId: userId,
        token: token,
        expirationDate: expirationDate
    }));
};

const handleError = (errorRes: any) => {

    let errorMessage = 'An unknown error occured';

    if(!errorRes.error || !errorRes.error.error) {
        return of(new AuthActions.AuthenticateFail(errorMessage));
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

    return of(new AuthActions.AuthenticateFail(errorMessage));
};


@Injectable()
export class AuthEffects {

    @Effect()
    authSignup = this.actions$.pipe(
        ofType(AuthActions.SIGNUP_START),
        switchMap((signupAction: AuthActions.SignupStart) => {
            return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey, 
            {
                email: signupAction.payload.email,
                password: signupAction.payload.password,
                returnSecureToken: true
            })
            .pipe(
                map(resData => {
                    return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
                }), 
                
                catchError(errorRes => {
                    return handleError(errorRes);
                })
            )
        
        })
    );


    @Effect()
    authLogin = this.actions$.pipe(
        ofType(AuthActions.LOGIN_START),
        switchMap((authData: AuthActions.LoginStart) =>
        {
            return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
                {
                    email: authData.payload.email,
                    password: authData.payload.password,
                    returnSecureToken: true
                }
            ).pipe(
                 
                
                map(resData => {
                    return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
                }), 
                
                catchError(errorRes => {
                    return handleError(errorRes);
                }),
        )
        }), 
    );


    @Effect()
    autoLogin = this.actions$.pipe(
        
        ofType(AuthActions.AUTO_LOGIN), 
        
        map( () => {

            const dummyAction = {type: 'DUMMY'};

            const userData : {
                email: string;
                id: string;
                _token: string;
                _tokenExpirationDate: string;
            } = JSON.parse(localStorage.getItem('userData'));
            
            if(!userData) {
                console.log("No userData in local storage");
                return dummyAction;
            }
     
            const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));
     
            if(loadedUser.token) {
                //this.userSub.next(loadedUser);
                 return new AuthActions.AuthenticateSuccess({
                     email: loadedUser.email,
                     userId: loadedUser.id,
                     token: loadedUser.token,
                     expirationDate: new Date(userData._tokenExpirationDate)
                 });
     
                // const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
                // this.autoLogout(expirationDuration);
            }

            return dummyAction;

        }
    ))

    @Effect({dispatch: false})
    authSRedirect = this.actions$.pipe(ofType(AuthActions.AUTHENTICATE_SUCCESS, AuthActions.LOGOUT), tap(() => {
        this.router.navigate(['/']);
    }))



    @Effect({dispatch: false})
    authLogout = this.actions$.pipe(ofType(AuthActions.LOGOUT), tap(() => {
        localStorage.removeItem('userData');
    }))

    constructor(private actions$: Actions,
        private http: HttpClient,
        private router: Router) {}


}