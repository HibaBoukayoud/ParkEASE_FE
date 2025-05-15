import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { TicketValidationComponent } from '../ticket-validation/ticket-validation.component';
import { ParkingSpotService } from '../../services/parking-spot.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

interface City {
    id: number;
    name: string;
}

interface ParkingSpot {
    id: number;
    spotNumber: string;
    isOccupied: boolean;
    vehiclePlate: string | null;
}

interface Reservation {
    parkingSpotId: number;
    vehiclePlate: string;
    email: string;
    startDate: string | Date; // Può essere un Date dal datepicker
    startTime: string;
    endDate: string | Date; // Può essere un Date dal datepicker
    endTime: string;
}

@Component({
    selector: 'app-reservation-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatSnackBarModule,
        MatIconModule,
        TicketValidationComponent,
        RouterModule
    ],
    templateUrl: './reservation-form.component.html',
    styleUrls: ['./reservation-form.component.css']
})
export class ReservationFormComponent {
    cities: City[] = [];
    parkingSpots: ParkingSpot[] = [];
    selectedCity: number | null = null;
    emailConfirm: string = '';
    emailsMatch: boolean = true;
    today = new Date(); // Data di oggi per limitare il selettore di date
    
    reservation: Reservation = {
        parkingSpotId: 0,
        vehiclePlate: '',
        email: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
    };
    lastReservationCost: number | null = null;
    lastTicketId: string | null = null;
    spotReservations: { startTime: string, endTime: string }[] = [];
    @Output() reservationCreated = new EventEmitter<void>();    constructor(
        private http: HttpClient, 
        private snackBar: MatSnackBar,
        private parkingSpotService: ParkingSpotService,
        private authService: AuthService
    ) {
        this.loadCities();
        // Imposta automaticamente l'email dell'utente loggato
        const userEmail = this.authService.getUserEmail();
        if (userEmail) {
            this.reservation.email = userEmail;
            this.emailConfirm = userEmail;
        }
    }

    // Funzione per formattare la data in YYYY-MM-DD
    formatDate(date: Date | string): string {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (`0${d.getMonth() + 1}`).slice(-2); // Aggiunge uno zero davanti se necessario
        const day = (`0${d.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    }

    loadCities() {
        this.http.get<City[]>('http://localhost:8080/api/cities').subscribe({
            next: (data: City[]) => {
                this.cities = data;
            },
            error: (error: any) => {
                this.snackBar.open('Errore nel caricamento delle città', 'Chiudi', { duration: 3000 });
            }
        });
    }

    onCityChange() {
        if (this.selectedCity) {
            this.http.get<ParkingSpot[]>(`http://localhost:8080/api/parking-spots/city/${this.selectedCity}`).subscribe({
                next: (data: ParkingSpot[]) => {
                    this.parkingSpots = data;
                },
                error: (error: any) => {
                    this.snackBar.open('Errore nel caricamento dei posti auto', 'Chiudi', { duration: 3000 });
                }
            });
        } else {
            this.parkingSpots = [];
        }
    }    onSubmit() {
        // Verifichiamo prima se l'utente è autenticato
        if (!this.authService.isLoggedIn()) {
            this.snackBar.open('È necessario effettuare il login prima di creare una prenotazione.', 'Vai al login', {
                duration: 5000
            }).onAction().subscribe(() => {
                // Reindirizza alla pagina di login
                window.location.href = '/login';
            });
            return;
        }

        // Assicuriamoci di utilizzare l'email corretta dell'utente
        const userEmail = this.authService.getUserEmail();
        if (userEmail) {
            this.reservation.email = userEmail;
        } else {
            this.snackBar.open('Non è stato possibile recuperare l\'email dell\'utente loggato', 'Chiudi', { duration: 3000 });
            return;
        }

        if (!this.selectedCity || !this.reservation.parkingSpotId || !this.reservation.vehiclePlate ||
            !this.reservation.startDate || !this.reservation.startTime ||
            !this.reservation.endDate || !this.reservation.endTime) {
            this.snackBar.open('Compila tutti i campi', 'Chiudi', { duration: 3000 });
            return;
        }

        // Formatta le date dal datepicker
        const startDateStr = this.formatDate(this.reservation.startDate);
        const endDateStr = this.formatDate(this.reservation.endDate);
        
        // Crea gli oggetti Date
        const startDateTime = new Date(`${startDateStr}T${this.reservation.startTime}`);
        const endDateTime = new Date(`${endDateStr}T${this.reservation.endTime}`);

        // Verifica se la data di inizio è nel passato
        const now = new Date();
        if (startDateTime < now) {
            this.snackBar.open('Non è possibile prenotare per date/orari nel passato', 'Chiudi', { duration: 3000 });
            return;
        }

        // Validazione delle date
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            this.snackBar.open('Inserisci date e orari validi', 'Chiudi', { duration: 3000 });
            return;
        }

        if (endDateTime <= startDateTime) {
            this.snackBar.open('La data di fine deve essere successiva alla data di inizio', 'Chiudi', { duration: 3000 });
            return;
        }

        // Costruzione delle stringhe ISO mantenendo l'ora locale specificata dall'utente
        // Format: YYYY-MM-DDTHH:MM:SS (senza conversione a UTC)
        const formatLocalDateTime = (date: Date): string => {
            const year = date.getFullYear();
            const month = (`0${date.getMonth() + 1}`).slice(-2);
            const day = (`0${date.getDate()}`).slice(-2);
            const hours = (`0${date.getHours()}`).slice(-2);
            const minutes = (`0${date.getMinutes()}`).slice(-2);
            const seconds = (`0${date.getSeconds()}`).slice(-2);
            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };

        const reservationData = {
            parkingSpot: { id: this.reservation.parkingSpotId },
            vehiclePlate: this.reservation.vehiclePlate,
            email: this.reservation.email,
            startTime: formatLocalDateTime(startDateTime),
            endTime: formatLocalDateTime(endDateTime)
        };

        // Utilizziamo il servizio ParkingSpotService per effettuare la richiesta di prenotazione
        this.parkingSpotService.createReservation(reservationData).subscribe({
            next: (response: any) => {
                this.snackBar.open('Prenotazione creata con successo!', 'Chiudi', { duration: 3000 });
                this.lastReservationCost = response.cost;
                this.lastTicketId = response.ticketId;
                if (response.ticketId) {
                    this.snackBar.open(
                        `Il tuo ticket ID è: ${response.ticketId}. Conservalo per uscire dal parcheggio.`,
                        'Chiudi',
                        { duration: 5000 }
                    );
                }
                if (response.parkingSpot?.id !== undefined) {
                    this.updateParkingSpotStatus(response.parkingSpot.id, true, this.reservation.vehiclePlate);
                }

                this.reservation = {
                    parkingSpotId: 0,
                    vehiclePlate: '',
                    email: '',
                    startDate: '',
                    startTime: '',
                    endDate: '',
                    endTime: ''
                };
                this.emailConfirm = '';
                this.selectedCity = null;
                this.parkingSpots = [];
                this.reservationCreated.emit();
            },
            error: (error: any) => {
                // Verifica se c'è un messaggio di errore specifico
                if (error.error && error.error.error) {
                    this.snackBar.open(error.error.error, 'Chiudi', { duration: 5000 });
                } else {
                    this.snackBar.open('Errore durante la prenotazione', 'Chiudi', { duration: 3000 });
                }
            }
        });
    }

    updateParkingSpotStatus(spotId: number, isOccupied: boolean, vehiclePlate: string) {
        this.http.put(`http://localhost:8080/api/parking-spots/${spotId}`, { isOccupied, vehiclePlate }).subscribe({
            next: () => {
                this.onCityChange();
            },
            error: (error: any) => {
                this.snackBar.open('Errore nell\'aggiornamento dello stato del posto', 'Chiudi', { duration: 3000 });
            }
        });
    }
    
    // Metodo per verificare se una prenotazione si estende su più giorni
    isDifferentDay(startTime: string, endTime: string): boolean {
        const startDate = new Date(startTime).toDateString();
        const endDate = new Date(endTime).toDateString();
        return startDate !== endDate;
    }
    
    // Verifica se l'utente è autenticato
    isUserLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }
    
    onParkingSpotChange() {
        if (this.reservation.parkingSpotId) {
            this.http.get<{ startTime: string, endTime: string }[]>(
                `http://localhost:8080/api/reservations/by-parking-spot/${this.reservation.parkingSpotId}`
            ).subscribe({
                next: (data: { startTime: string, endTime: string }[]) => {
                    this.spotReservations = data;
                },
                error: (error: any) => {
                    this.snackBar.open('Errore nel caricamento delle prenotazioni esistenti', 'Chiudi', { duration: 3000 });
                    this.spotReservations = [];
                }
            });
        } else {
            this.spotReservations = [];
        }
    }
}

function onParkingSpotChange() {
    throw new Error('Function not implemented.');
}
