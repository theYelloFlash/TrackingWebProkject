import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({providedIn : 'root'})
export class resetFormServ{
    isReset! : boolean
    private resetSubject =  new BehaviorSubject<boolean>(this.isReset);

    setReset(isreset : boolean){
        this.resetSubject.next(isreset);
      }
    
      getReset(): Observable<boolean> {
        return this.resetSubject.asObservable();
      }
}