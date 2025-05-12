import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CityService {
    private apiUrl = 'http://localhost:8080/api/cities';

    constructor(private http: HttpClient) {}

    getAllCities(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }
}