import { Component, Optional, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: FormGroup;
  
  @Output() switchTab = new EventEmitter<string>();
  
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    @Optional() private dialogRef: MatDialogRef<any>
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  isInModal(): boolean {
    return !!this.dialogRef;
  }
  
  switchToLogin(): void {
    this.switchTab.emit('login');
  }
  onSubmit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.auth.register(email, password).subscribe({
        next: () => {
          // Se siamo in una finestra modale, esegui subito il login
          if (this.dialogRef) {
            this.auth.login(email, password).subscribe({
              next: () => this.dialogRef.close(true),
              error: err => alert('Registrazione completata, ma login fallito')
            });
          } else {
            // Altrimenti, naviga alla pagina di login
            this.router.navigate(['/login']);
          }
        },
        error: err => alert('Registrazione fallita')
      });
    }
  }
}