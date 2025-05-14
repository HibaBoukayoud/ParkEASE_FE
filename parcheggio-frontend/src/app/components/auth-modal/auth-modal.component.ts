import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    LoginComponent,
    RegisterComponent,
    RouterModule
  ],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent {
  selectedTabIndex = 0;
  
  constructor(public dialogRef: MatDialogRef<AuthModalComponent>) { }

  closeDialog(): void {
    this.dialogRef.close();
  }
  
  switchToTab(tabName: string): void {
    this.selectedTabIndex = tabName === 'register' ? 1 : 0;
  }
}
