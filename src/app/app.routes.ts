import { Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { authGuard, unauthGaurd } from './guards/auth.guard';
import { LoginPageComponent } from './components/login-page/login-page.component';



export const routes: Routes = [
    { path: 'login',  component: LoginPageComponent ,canActivate: [authGuard] }, // Lazy-load standalone component
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'users', component : UserListComponent, canActivate : [unauthGaurd]},
    { path: 'user-profile/:id', component : UserProfileComponent, canActivate : [unauthGaurd]},
    { path: 'user-form/:id', component : UserFormComponent, canActivate : [unauthGaurd]},
];
