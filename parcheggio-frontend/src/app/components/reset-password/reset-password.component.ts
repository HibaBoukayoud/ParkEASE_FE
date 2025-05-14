import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  requestForm: FormGroup;
  resetForm: FormGroup;
  step: 'verify' | 'reset' = 'verify';
  email: string = '';
  message: { text: string, type: 'success' | 'error' } | null = null;
    constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }
    // Validatore per verificare che le password corrispondano
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }  verifyEmail() {
    if (this.requestForm.valid) {
      const email = this.requestForm.get('email')?.value.trim().toLowerCase();
      
      // Resetta qualsiasi messaggio precedente prima di fare la richiesta
      this.message = null;
      
      this.authService.verifyEmail(email).subscribe({
        next: (response: any) => {
          console.log('Verifica email riuscita:', response);
          
          // Verifica che la risposta contenga una chiave che indica che l'utente esiste
          if (response && response.exists === true) {
            this.email = email;
            this.step = 'reset';
          } else {
            // Se la risposta non conferma l'esistenza dell'utente
            this.message = {
              text: 'Nessun account trovato con questa email.',
              type: 'error'
            };
            this.step = 'verify';
          }
        },
        error: (error) => {
          console.error('Verifica email fallita:', error);
          this.message = {
            text: 'Nessun account trovato con questa email.',
            type: 'error'
          };
          // Mantiene l'utente sul form di verifica email
          this.step = 'verify';
        }
      });
    }
  }resetPassword() {
    if (this.resetForm.valid) {
      const newPassword = this.resetForm.get('password')?.value;
      
      // Assicurati che l'email sia normalizzata
      const normalizedEmail = this.email.trim().toLowerCase();
      console.log('Attempting password reset with email:', normalizedEmail);
      
      this.authService.updatePassword(normalizedEmail, newPassword).subscribe({
        next: (response) => {
          console.log('Password reset successful:', response);
          this.message = {
            text: 'Password reimpostata con successo! Ora puoi accedere con la tua nuova password.',
            type: 'success'
          };
          
          // Reindirizza alla pagina di login dopo 2 secondi
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          console.error('Password reset error:', error);
          this.message = {
            text: error.error?.error || error.error?.message || 'Si è verificato un errore durante la reimpostazione della password.',
            type: 'error'
          };
        }
      });
    }
  }
}
