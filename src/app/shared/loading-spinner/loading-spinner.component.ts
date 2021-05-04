import { Component } from "@angular/core";


//source: https://loading.io/css/

@Component({
    selector: 'app-loading-spinner',
    template: '<div class="lds-ripple"><div></div><div></div></div>',
    styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinner {

}