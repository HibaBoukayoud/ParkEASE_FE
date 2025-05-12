import { Routes } from '@angular/router';
import { ReservationFormComponent } from './components/reservation-form/reservation-form.component';
import { ReservationListComponent } from './components/reservation-list/reservation-list.component';
import { HomeComponent } from './components/home/home.component';
import { InfoComponent } from './components/info/info.component';
import { ContactsComponent } from './components/contact/contact.component';
import { ReservationBusFormComponent } from './components/reservation-bus-form/reservation-bus-form.component';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // Home page
    { path: 'prenotazioni', component: ReservationFormComponent }, // Form di prenotazione
    { path: 'BUS', component: ReservationBusFormComponent }, // Form di prenotazione
    { path: 'gestione-prenotazioni', component: ReservationListComponent }, // Gestione delle prenotazioni
    { path: 'info', component: InfoComponent }, // Pagina Info
    { path: 'contatti', component: ContactsComponent }, // Pagina Contatti
    { path: '**', redirectTo: '' } // Reindirizza a Home per percorsi non trovati
];
