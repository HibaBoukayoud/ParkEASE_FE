import { Routes } from '@angular/router';
import { ReservationFormComponent } from './components/reservation-form/reservation-form.component';
import { ReservationListComponent } from './components/reservation-list/reservation-list.component';
import { HomeComponent } from './components/home/home.component';
import { InfoComponent } from './components/info/info.component';
import { ContactsComponent } from './components/contact/contact.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './services/auth.guard';
import { ReservationBusFormComponent } from './components/reservation-bus-form/reservation-bus-form.component';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // Home page
    { path: 'prenotazioni', component: ReservationFormComponent, canActivate:[AuthGuard] }, // Form di prenotazione
    { path: 'BUS', component: ReservationBusFormComponent }, // Form di prenotazione
    { path : 'login', component: LoginComponent }, // Pagina di login
    { path : 'register', component: RegisterComponent }, // Pagina di registrazione
    { path: 'gestione-prenotazioni', component: ReservationListComponent, canActivate:[AuthGuard] }, // Gestione delle prenotazioni
    { path: 'info', component: InfoComponent }, // Pagina Info
    { path: 'contatti', component: ContactsComponent }, // Pagina Contatti
    { path: '**', redirectTo: '' } // Reindirizza a Home per percorsi non trovati
];
