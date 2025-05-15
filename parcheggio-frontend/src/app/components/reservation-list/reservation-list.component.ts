import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParkingSpotService, Reservation } from '../../services/parking-spot.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../../services/auth.service';


@Component({
    selector: 'app-reservation-list',
    standalone: true,    imports: [
        CommonModule, 
        FormsModule, 
        MatFormFieldModule, 
        MatInputModule, 
        MatSelectModule, 
        MatButtonModule, 
        MatTableModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './reservation-list.component.html',
    styleUrls: ['./reservation-list.component.css']
})
export class ReservationListComponent implements OnInit {
    reservations: Reservation[] = [];
    userEmail: string = '';
    isLoading: boolean = false;
    searchPerformed: boolean = false;
    displayedColumns: string[] = ['spotNumber', 'startTime', 'endTime', 'cost', 'ticketId', 'actions'];
    selectedReservation: Reservation | null = null;
    isEditMode: boolean = false;
    
    // Proprietà per la modifica delle date/orari
    startDate: Date | null = null;
    startTime: string = '';
    endDate: Date | null = null;
    endTime: string = '';
    
    constructor(
        private parkingSpotService: ParkingSpotService, 
        private http: HttpClient, 
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private authService: AuthService
    ) { }

    ngOnInit() {
        // Carica automaticamente le prenotazioni dell'utente loggato
        const userEmail = this.authService.getUserEmail();
        if (userEmail) {
            this.userEmail = userEmail;
            this.loadUserReservations();
        } else {
            this.snackBar.open('Non è stato possibile recuperare l\'email dell\'utente loggato', 'Chiudi', { duration: 3000 });
        }
    }        public loadUserReservations(): void {
        if (!this.userEmail) {
            this.snackBar.open('Email utente non disponibile', 'Chiudi', { duration: 3000 });
            return;
        }

        this.isLoading = true;
        this.searchPerformed = true;
        
        // Utilizziamo getAllReservations e filtriamo lato client
        this.parkingSpotService.getAllReservations().subscribe({
            next: (data) => {
                // Filtriamo le prenotazioni per email
                this.reservations = data.filter(res => res.email === this.userEmail);
                this.isLoading = false;
                if (this.reservations.length === 0) {
                    this.snackBar.open('Nessuna prenotazione trovata per la tua email', 'Chiudi', { duration: 3000 });
                }
            },
            error: (error) => {
                console.error('Errore nel recupero delle prenotazioni:', error);
                this.snackBar.open('Errore nel recupero delle prenotazioni', 'Chiudi', { duration: 3000 });
                this.isLoading = false;
                this.reservations = [];
            }
        });
    }
    deleteReservation(reservation: Reservation): void {
        if (!reservation.id) {
            this.snackBar.open('ID prenotazione non valido', 'Chiudi', { duration: 3000 });
            return;
        }
        
        if (confirm('Sei sicuro di voler cancellare questa prenotazione?')) {
            this.isLoading = true;
            
            this.parkingSpotService.deleteReservation(reservation.id).subscribe({
                next: () => {
                    this.snackBar.open('Prenotazione cancellata con successo', 'Chiudi', { duration: 3000 });
                    this.loadUserReservations(); // Aggiorna la lista
                },
                error: (error) => {
                    console.error('Errore nella cancellazione della prenotazione:', error);
                    this.snackBar.open('Errore nella cancellazione della prenotazione', 'Chiudi', { duration: 3000 });
                    this.isLoading = false;
                }
            });
        }
    }
      editReservation(reservation: Reservation): void {
        this.selectedReservation = {...reservation};
        this.isEditMode = true;
        
        // Parsing delle date/orari dalla prenotazione selezionata
        const startDateTime = new Date(this.selectedReservation.startTime);
        const endDateTime = new Date(this.selectedReservation.endTime);
        
        this.startDate = startDateTime;
        this.startTime = startDateTime.toTimeString().substring(0, 5); // Estrai HH:MM
        this.endDate = endDateTime;
        this.endTime = endDateTime.toTimeString().substring(0, 5); // Estrai HH:MM
    }
    
    cancelEdit(): void {
        this.selectedReservation = null;
        this.isEditMode = false;
        this.startDate = null;
        this.startTime = '';
        this.endDate = null;
        this.endTime = '';
    }
      updateReservation(): void {
        if (!this.selectedReservation || !this.selectedReservation.id || !this.startDate || !this.endDate) {
            this.snackBar.open('Errore: dati della prenotazione non validi', 'Chiudi', { duration: 3000 });
            return;
        }
        
        // Formatta le date e orari
        const formatDate = (date: Date): string => {
            const year = date.getFullYear();
            const month = (`0${date.getMonth() + 1}`).slice(-2);
            const day = (`0${date.getDate()}`).slice(-2);
            return `${year}-${month}-${day}`;
        };
        
        // Crea le date-ora complete
        const startDateTime = new Date(`${formatDate(this.startDate)}T${this.startTime}:00`);
        const endDateTime = new Date(`${formatDate(this.endDate)}T${this.endTime}:00`);
        
        // Validazione date
        if (endDateTime <= startDateTime) {
            this.snackBar.open('La data di fine deve essere successiva alla data di inizio', 'Chiudi', { duration: 3000 });
            return;
        }
        
        this.isLoading = true;
        
        // Formatta per il backend (ISO string)
        const formatIsoLocalDateTime = (date: Date): string => {
            const year = date.getFullYear();
            const month = (`0${date.getMonth() + 1}`).slice(-2);
            const day = (`0${date.getDate()}`).slice(-2);
            const hours = (`0${date.getHours()}`).slice(-2);
            const minutes = (`0${date.getMinutes()}`).slice(-2);
            const seconds = (`0${date.getSeconds()}`).slice(-2);
            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };
        
        // Prepara i dati da inviare
        const reservationData = {
            parkingSpot: { id: this.selectedReservation.parkingSpot.id },
            vehiclePlate: this.selectedReservation.vehiclePlate,
            email: this.selectedReservation.email,
            startTime: formatIsoLocalDateTime(startDateTime),
            endTime: formatIsoLocalDateTime(endDateTime)
        };
        
        this.parkingSpotService.updateReservation(this.selectedReservation.id, reservationData).subscribe({
            next: (updatedReservation) => {
                this.snackBar.open('Prenotazione aggiornata con successo', 'Chiudi', { duration: 3000 });
                this.isLoading = false;
                this.isEditMode = false;
                this.selectedReservation = null;
                this.loadUserReservations(); // Aggiorna la lista
            },
            error: (error) => {
                console.error('Errore durante l\'aggiornamento della prenotazione:', error);
                
                // Mostra il messaggio di errore specifico se disponibile
                if (error.error && error.error.error) {
                    this.snackBar.open(error.error.error, 'Chiudi', { duration: 3000 });
                } else {
                    this.snackBar.open('Errore durante l\'aggiornamento della prenotazione', 'Chiudi', { duration: 3000 });
                }
                
                this.isLoading = false;
            }
        });
    }
    
    showConfirmationDialog(reservation: Reservation): void {
        const dialogRef = confirm('Sei sicuro di voler eliminare questa prenotazione?');
        
        if (dialogRef) {
            this.deleteReservation(reservation);
        }
    }get filteredReservations() {
        return this.reservations;
    }
}