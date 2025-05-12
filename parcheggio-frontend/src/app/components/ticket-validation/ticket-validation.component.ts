import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
@Component({
    selector: 'app-ticket-validation',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule,
        MatProgressSpinner
    ],
    templateUrl: './ticket-validation.component.html',
    styleUrls: ['./ticket-validation.component.css']
})
export class TicketValidationComponent {
    ticketId: string = '';
    isLoading = false;

    constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

    onValidateTicket() {
        if (!this.ticketId) {
            this.snackBar.open('Inserisci un ticket ID', 'Chiudi', { duration: 3000 });
            return;
        }
        this.isLoading = true;
        // Chiamata al backend per verificare il ticket
        this.http.get(`http://localhost:8080/api/reservations/validate-ticket/${this.ticketId}`, { responseType: 'text' }).subscribe({
            next: (response) => {
                this.snackBar.open(response, 'Chiudi', { duration: 3000 });
                this.isLoading = false;
            },
            error: (error) => {
                this.snackBar.open(error.error || 'Errore nella verifica del ticket', 'Chiudi', { duration: 3000 });
                this.isLoading = false;
            }
        });
    }
}
