import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ParkingSpot {
    id?: number;
    spotNumber: string;
    isOccupied: boolean;
    vehiclePlate?: string;
    isBusSpot?: boolean;
}

export interface Reservation {
    id?: number;
    parkingSpot: ParkingSpot;
    vehiclePlate: string;
    email?: string;
    startTime: string;
    endTime: string;
    cost: number;
    ticketId?: string;
    isBusReservation?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ParkingSpotService {
    private parkingSpotsApiUrl = 'http://localhost:8080/api/parking-spots';
    private reservationsApiUrl = 'http://localhost:8080/api/reservations';

    constructor(private http: HttpClient) { }

    getParkingSpotsByCity(cityId: number): Observable<ParkingSpot[]> {
        return this.http.get<ParkingSpot[]>(`${this.parkingSpotsApiUrl}/by-city/${cityId}`);
    }

    getAllSpots(): Observable<ParkingSpot[]> {
        return this.http.get<ParkingSpot[]>(this.parkingSpotsApiUrl);
    }
    
    getBusParkingSpotsByCity(cityId: number): Observable<ParkingSpot[]> {
        return this.http.get<ParkingSpot[]>(`${this.parkingSpotsApiUrl}/city/${cityId}/bus`);
    }

    createSpot(spot: ParkingSpot): Observable<ParkingSpot> {
        return this.http.post<ParkingSpot>(this.parkingSpotsApiUrl, spot);
    }

    updateSpot(id: number, spot: Partial<ParkingSpot>): Observable<ParkingSpot> {
        return this.http.put<ParkingSpot>(`${this.parkingSpotsApiUrl}/${id}`, spot);
    }    getAllReservations(): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(this.reservationsApiUrl);
    }

    getReservationsByEmail(email: string): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(`${this.reservationsApiUrl}/by-email/${email}`);
    }

    createReservation(reservation: any): Observable<Reservation> {
        return this.http.post<Reservation>(this.reservationsApiUrl, reservation);
    }
    
    updateReservation(id: number, reservation: any): Observable<Reservation> {
        return this.http.put<Reservation>(`${this.reservationsApiUrl}/${id}`, reservation);
    }
    
    deleteReservation(id: number): Observable<any> {
        return this.http.delete<any>(`${this.reservationsApiUrl}/${id}`);
    }

    getBusReservations(): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(`${this.reservationsApiUrl}/bus`);
    }
}