import { Injectable } from "@angular/core";

import { Store } from "@ngrx/store";
import * as fromApp from "../store/app.reducer";
import * as AuthActions from "./store/auth.actions";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    //userSub = new BehaviorSubject<User>(null);

    constructor(private store: Store<fromApp.AppState>) {}

    private tokenExpirationTimer: any;



    setLogoutTimer(expirationduration: number) {

        this.tokenExpirationTimer = setTimeout(() => {
            this.store.dispatch(new AuthActions.Logout());
        }, expirationduration);
    }


    clearLogoutTimer() {

        if(this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
            this.tokenExpirationTimer = null;
        }
    }

}