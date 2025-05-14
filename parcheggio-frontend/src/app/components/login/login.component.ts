import { Component, Optional, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthTestService } from '../../services/auth-test.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  
  @Output() switchTab = new EventEmitter<string>();
    constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    @Optional() private dialogRef: MatDialogRef<any>,
    private authTestService: AuthTestService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  isInModal(): boolean {
    return !!this.dialogRef;
  }
    switchToRegister(): void {
    this.switchTab.emit('register');
  }
  
  navigateToResetPassword(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.router.navigate(['/reset-password']);
  }  onSubmit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.auth.login(email, password).subscribe({
        next: () => {
          // Se siamo in una finestra modale, chiudila
          if (this.dialogRef) {
            this.dialogRef.close(true);
          } else {
            // Altrimenti, naviga alla pagina delle prenotazioni
            this.router.navigate(['/prenotazioni']);
          }
        },        error: err => {          console.error('Login error:', err);
          
          let errorMessage = 'Login fallito: ';
          
          if (err.status === 401) {
            errorMessage += 'credenziali non valide.';
            console.log('Error details:', err.error);
          } else if (err.status === 403) {
            errorMessage += 'accesso negato. Verificare i permessi o il formato della richiesta.';
            // Esegui un test diagnostico automatico
            this.testAuthentication();
          } else if (err.status === 404) {
            errorMessage += 'utente non trovato.';
          } else if (err.error && err.error.message) {
            errorMessage += err.error.message;
          } else {
            errorMessage += 'si è verificato un errore durante l\'accesso. Dettagli: ' + 
              (err.statusText || 'nessun dettaglio disponibile');
          }
          
          // Visualizza l'errore completo in console per debug
          console.log('Full error object:', JSON.stringify(err, null, 2));
          
          alert(errorMessage);
        }
      });
    }
  }

  /**
   * Esegue test diagnostici per identificare il problema di autenticazione
   */
  testAuthentication() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      console.log('Running authentication diagnostics...');
      
      this.authTestService.testAuthentication(email, password).subscribe({
        next: (result) => {
          console.log('Authentication test result:', result);
        },
        error: (err) => {
          console.error('Authentication test failed:', err);
        }
      });
    }
  }
}
