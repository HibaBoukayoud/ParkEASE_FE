import { Component, HostListener, OnInit } from '@angular/core';
import { ReservationFormComponent } from './components/reservation-form/reservation-form.component';
import { ReservationListComponent } from './components/reservation-list/reservation-list.component';
import { HomeComponent } from './components/home/home.component'; // Da creare
import { InfoComponent } from './components/info/info.component'; // Da creare
import { ContactsComponent } from './components/contact/contact.component'; // Da creare
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { TicketValidationComponent } from './components/ticket-validation/ticket-validation.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        MatToolbarModule, 
        MatIconModule,
        ReservationFormComponent, 
        ReservationListComponent, 
        RouterModule, 
        HomeComponent, 
        InfoComponent, 
        ContactsComponent, 
        TicketValidationComponent
    ],    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css', './remove-underlines.css'], 
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('500ms', style({ opacity: 1 }))
            ])
        ])
    ]
})
export class AppComponent implements OnInit {
    title = 'parcheggio-frontend';
    isScrolled = false;
    isMobileMenuOpen = false;

    ngOnInit() {
        // Controlla la posizione iniziale dello scroll
        this.checkScroll();
    }

    @HostListener('window:scroll', [])
    checkScroll() {
        // Imposta isScrolled a true se lo scroll è maggiore di 50px
        this.isScrolled = window.scrollY > 50;
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
    }
}