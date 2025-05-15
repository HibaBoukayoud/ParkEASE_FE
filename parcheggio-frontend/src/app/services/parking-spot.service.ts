import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
        const token = localStorage.getItem('jwtToken');
        let headers = new HttpHeaders();
        
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        
        return this.http.get<Reservation[]>(this.reservationsApiUrl, { headers });
    }    getReservationsByEmail(email: string): Observable<Reservation[]> {
        const token = localStorage.getItem('jwtToken');
        let headers = new HttpHeaders();
        
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        
        // Utilizziamo un parametro di query invece che incorporare l'email nell'URL
        return this.http.get<Reservation[]>(`${this.reservationsApiUrl}`, { 
            headers,
            params: { email: email }
        });
    }createReservation(reservation: any): Observable<Reservation> {
        // Assicuriamoci che il token JWT venga incluso nella richiesta
        const token = localStorage.getItem('jwtToken');
        let headers = new HttpHeaders();
        
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        
        return this.http.post<Reservation>(this.reservationsApiUrl, reservation, {
            headers: headers
        });
    }updateReservation(id: number, reservation: any): Observable<Reservation> {
        const token = localStorage.getItem('jwtToken');
        let headers = new HttpHeaders();
        
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        
        return this.http.put<Reservation>(`${this.reservationsApiUrl}/${id}`, reservation, { headers });
    }
    
    deleteReservation(id: number): Observable<any> {
        const token = localStorage.getItem('jwtToken');
        let headers = new HttpHeaders();
        
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        
        return this.http.delete<any>(`${this.reservationsApiUrl}/${id}`, { headers });
    }    getBusReservations(): Observable<Reservation[]> {
        const token = localStorage.getItem('jwtToken');
        let headers = new HttpHeaders();
        
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        
        return this.http.get<Reservation[]>(`${this.reservationsApiUrl}/bus`, { headers });
    }
    
    getReservationsByParkingSpot(parkingSpotId: number): Observable<{ startTime: string, endTime: string }[]> {
        const token = localStorage.getItem('jwtToken');
        let headers = new HttpHeaders();
        
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        
        return this.http.get<{ startTime: string, endTime: string }[]>(
            `${this.reservationsApiUrl}/by-parking-spot/${parkingSpotId}`, { headers }
        );
    }
}