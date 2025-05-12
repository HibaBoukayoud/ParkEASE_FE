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
import { ParkingSpot } from '../../services/parking-spot.service';

interface City {
    id: number;
    name: string;
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
    selector: 'app-reservation-bus-form',
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
        MatIconModule    ],
    templateUrl: './reservation-bus-form.component.html',
    styleUrls: ['./reservation-bus-form.component.css']
})
export class ReservationBusFormComponent {      cities: City[] = [];
    parkingSpots: ParkingSpot[] = [];
    selectedCity: number | null = null;    
    isEmailValid: boolean = false;
    formVisible: boolean = false;
    reservationSuccess: boolean = false;    lastVehiclePlate: string = '';
    lastStartDate: string | Date = '';
    lastStartTime: string = '';
    lastEndDate: string | Date = '';
    lastEndTime: string = '';
    emailError: string = '';
    emailValidationStep: boolean = true;
    
    reservation: Reservation = {
        parkingSpotId: 0,
        vehiclePlate: '',
        email: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
    };
    
    today = new Date(); // Data di oggi per limitare il selettore di date
    
    spotReservations: { startTime: string, endTime: string }[] = [];
    @Output() reservationCreated = new EventEmitter<void>();

    constructor(private http: HttpClient, private snackBar: MatSnackBar) {
        this.loadCities();
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

    // Formatta una data in formato leggibile (es. "10 Maggio 2025")
    formatReadableDate(date: string | Date): string {
        if (!date) return '';
        const d = new Date(date);
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return d.toLocaleDateString('it-IT', options);
    }
    
    // Formatta un'ora in formato leggibile (es. "14:30")
    formatTime(time: string): string {
        if (!time) return '';
        return time;
    }    // Funzione per verificare se una data è nel passato
    isPastDate(date: Date | string): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset dell'ora per confrontare solo la data
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate < today;
    }    loadCities() {
        this.http.get<City[]>('http://localhost:8080/api/cities').subscribe({
            next: (data: City[]) => {
                this.cities = data;
            },
            error: (error: any) => {
                this.snackBar.open('Errore nel caricamento delle città', 'Chiudi', { duration: 3000 });
            }
        });
    }onCityChange() {
        if (this.selectedCity) {
            this.http.get<ParkingSpot[]>(`http://localhost:8080/api/parking-spots/city/${this.selectedCity}/bus`).subscribe({
                next: (data: ParkingSpot[]) => {
                    this.parkingSpots = data;
                },
                error: (error: any) => {
                    this.snackBar.open('Errore nel caricamento dei posti bus', 'Chiudi', { duration: 3000 });
                }
            });
        } else {
            this.parkingSpots = [];
        }
    }
      onSubmit() {
        if (!this.selectedCity || !this.reservation.parkingSpotId || !this.reservation.vehiclePlate ||
            !this.reservation.startDate || !this.reservation.startTime || !this.reservation.endTime) {
            this.snackBar.open('Compila tutti i campi', 'Chiudi', { duration: 3000 });
            return;
        }

        // Verifica che l'email contenga "@busexpress"
        if (!this.reservation.email || !this.reservation.email.includes('@busexpress')) {
            this.snackBar.open('Inserisci una mail aziendale valida (@busexpress)', 'Chiudi', { duration: 3000 });
            this.emailError = 'È richiesta una mail aziendale (@busexpress)';
            return;
        }
        this.emailError = '';
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
            endTime: formatLocalDateTime(endDateTime),
            isBusReservation: true  // Aggiungiamo questo flag per distinguere le prenotazioni bus
        };

        this.http.post('http://localhost:8080/api/reservations', reservationData).subscribe({
            next: (response: any) => {
                this.snackBar.open('Posto bus riservato correttamente!', 'Chiudi', { duration: 3000 });                this.reservationSuccess = true;
                this.lastVehiclePlate = this.reservation.vehiclePlate;
                this.lastStartDate = this.reservation.startDate;
                this.lastStartTime = this.reservation.startTime;
                this.lastEndDate = this.reservation.endDate;
                this.lastEndTime = this.reservation.endTime;
                
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
                this.selectedCity = null;
                this.parkingSpots = [];
                this.reservationCreated.emit();
            },            error: (error: any) => {
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
        this.http.put(`http://localhost:8080/api/parking-spots/${spotId}`, { 
            isOccupied: isOccupied, 
            vehiclePlate: vehiclePlate 
        }).subscribe({
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
    }    onParkingSpotChange() {
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

    // Metodo per validare l'email e verificare che sia un'email BusExpress
    validateEmail() {
        if (!this.reservation.email) {
            this.emailError = 'L\'email è obbligatoria';
            return false;
        }
        
        if (!this.reservation.email.includes('@busexpress')) {
            this.emailError = 'È richiesta una mail aziendale (@busexpress)';
            return false;
        }
        
        this.emailError = '';
        this.emailValidationStep = false;
        this.isEmailValid = true;
        return true;
    }
}