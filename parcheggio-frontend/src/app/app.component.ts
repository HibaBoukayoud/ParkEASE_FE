import { Component, HostListener, OnInit } from '@angular/core';
import { ReservationFormComponent } from './components/reservation-form/reservation-form.component';
import { ReservationListComponent } from './components/reservation-list/reservation-list.component';
import { HomeComponent } from './components/home/home.component';
import { InfoComponent } from './components/info/info.component';
import { ContactsComponent } from './components/contact/contact.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { TicketValidationComponent } from './components/ticket-validation/ticket-validation.component';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,    imports: [
        CommonModule,
        MatToolbarModule, 
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatDialogModule,
        RouterModule
    ],
    templateUrl: './app.component.html',
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
export class AppComponent implements OnInit {    title = 'parcheggio-frontend';
    isScrolled = false;
    isMobileMenuOpen = false;

    constructor(
        private authService: AuthService, 
        private router: Router,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        // Controlla la posizione iniziale dello scroll
        this.checkScroll();
    }

    @HostListener('window:scroll', [])
    checkScroll() {
        // Imposta isScrolled a true se lo scroll è maggiore di 50px
        this.isScrolled = window.scrollY > 50;
    }    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
    }

    isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }    logout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }    toggleAuthModal(): void {
        const dialogRef = this.dialog.open(AuthModalComponent, {
            width: '600px',
            maxWidth: '95vw',
            panelClass: 'auth-modal',
            disableClose: false,
            autoFocus: false,
            position: { top: '60px' }
        });

        dialogRef.afterClosed().subscribe(result => {
            // Gestisci qui eventuali azioni dopo la chiusura della modale
            if (this.authService.isLoggedIn()) {
                // Se l'utente si è autenticato nella modale, fai un refresh o altre azioni
            }
        });
    }
}