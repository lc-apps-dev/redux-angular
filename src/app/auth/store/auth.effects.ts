import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as AuthActions from './auth.actions';

export interface AuthResponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean
}

@Injectable()
export class AuthEffects {

    @Effect()
    authSignup = this.actions$.pipe(
        ofType(AuthActions.SIGNUP_START)
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
                    const expirationDate = new Date(new Date().getTime() + (+resData.expiresIn * 1000));
                    return (new AuthActions.AuthenticateSuccess({
                        email: resData.email,
                        userId: resData.localId,
                        token: resData.idToken,
                        expirationDate: expirationDate
                    })
                );
                }), 
                
                catchError(errorRes => {

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
                }),
        )
        }),

        
    );

    @Effect({dispatch: false})
    authSuccess = this.actions$.pipe(ofType(AuthActions.AUTHENTICATE_SUCCESS), tap(() => {
        this.router.navigate(['/']);
    }))

    constructor(private actions$: Actions,
        private http: HttpClient,
        private router: Router) {}


}