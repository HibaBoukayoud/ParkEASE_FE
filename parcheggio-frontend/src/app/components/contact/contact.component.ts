import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { FormsModule } from '@angular/forms'; // Per ngModel nel form
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import MatProgressSpinnerModule


@Component({
    selector: 'app-contacts',
    standalone: true,
    imports: [
        CommonModule, // Sostituisci BrowserModule con CommonModule
        FormsModule, // Necessario per ngModel
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule // Add MatProgressSpinnerModule to imports
    ],
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css']
})
export class ContactsComponent {
  isLoading = false; // Variabile per gestire il caricamento
    contactData = {
        name: '',
        email: '',
        message: ''
    };

    constructor(private snackBar: MatSnackBar) {}

    onContactSubmit() {
        console.log('Messaggio inviato:', this.contactData);
        this.snackBar.open('Messaggio inviato con successo!', 'Chiudi', { duration: 3000 });
        this.contactData = { name: '', email: '', message: '' };
    }
}