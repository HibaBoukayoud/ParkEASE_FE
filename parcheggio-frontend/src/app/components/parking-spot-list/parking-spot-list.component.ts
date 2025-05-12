import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingSpot, ParkingSpotService } from '../../services/parking-spot.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-parking-spot-list',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
    templateUrl: './parking-spot-list.component.html',
    styleUrls: ['./parking-spot-list.component.css']
})
export class ParkingSpotListComponent implements OnInit {
    spots: ParkingSpot[] = [];

    constructor(private parkingSpotService: ParkingSpotService) { }

    ngOnInit(): void {
        this.parkingSpotService.getAllSpots().subscribe(data => {
            this.spots = data;
        });
    }
}