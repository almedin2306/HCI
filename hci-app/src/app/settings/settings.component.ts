import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel

// Angular Material Modules
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    NgIf
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  selectedTabIndex: number = 0;

  userProfile = {
    firstName: 'Tarik',
    lastName: 'Drnda',
    email: 'tarik@gmail.com',
    username: 'TarikDrnda99',
    dob: new Date('1999-04-04'),
    phoneNumber: '061 123 456',
    country: 'Bosna i Hercegovina',
    canton: 'Kanton Sarajevo',
    city: 'Sarajevo',
    address: 'Soukbunar 108',
    profilePicture: 'https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg'
  };

  userPreferences = {
    language: 'Bosanski',
    dateTimeFormat: 'dd.MM.yyyy HH:mm',
    notificationsEnabled: true,
    receiveEmailNotifications: true,
    darkModeEnabled: false,
    customDashboardEnabled: true,
    twoFactorAuthEnabled: false
  };

  // Password fields for security tab
  showPasswordFields: boolean = false;
  currentPassword!: string;
  newPassword!: string;
  confirmNewPassword!: string;

  // Simulate a current password for validation
  private defaultCurrentPassword: string = 'Pass123!';

  // Password Strength & Validation
  newPasswordStrength: string = ''; // 'Slabo', 'Srednje', 'Jako'
  passwordMismatch: boolean = false;

  // Validation criteria for new password
  isNewPasswordLongEnough: boolean = false;
  isNewPasswordLowercase: boolean = false;
  isNewPasswordUppercase: boolean = false;
  isNewPasswordNumber: boolean = false;
  isNewPasswordSpecialChar: boolean = false;

  languages: string[] = ['Bosanski', 'Hrvatski', 'Srpski', 'English', 'Deutsch'];
  dateTimeFormats: string[] = ['dd.MM.yyyy HH:mm', 'MM/dd/yyyy hh:mm a'];

  constructor(private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  onSaveProfile(): void {
    console.log('Saving profile:', this.userProfile);
    this.snackBar.open('Profil uspješno spremljen!', 'Zatvori', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  onSavePreferences(): void {
    console.log('Saving preferences:', this.userPreferences);
    setTimeout(() => {
      this.snackBar.open('Postavke preferenci uspješno spremljene!', 'Zatvori', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 500);
  }

  onProfilePictureEdit(): void {
    this.snackBar.open('Uređivanje profilne slike...', 'Zatvori', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
    console.log('Edit profile picture clicked');
  }

  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    // Clear password fields and reset validation/strength when hiding them
    if (!this.showPasswordFields) {
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmNewPassword = '';
      this.resetPasswordValidation();
    }
  }

  onNewPasswordChange(): void {
    if (!this.newPassword) {
      this.resetPasswordValidation();
      return;
    }

    this.isNewPasswordLongEnough = this.newPassword.length >= 8;
    this.isNewPasswordLowercase = /[a-z]/.test(this.newPassword);
    this.isNewPasswordUppercase = /[A-Z]/.test(this.newPassword);
    this.isNewPasswordNumber = /[0-9]/.test(this.newPassword);
    this.isNewPasswordSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(this.newPassword);

    // Check strength
    let strengthScore = 0;
    if (this.isNewPasswordLongEnough) strengthScore++;
    if (this.isNewPasswordLowercase) strengthScore++;
    if (this.isNewPasswordUppercase) strengthScore++;
    if (this.isNewPasswordNumber) strengthScore++;
    if (this.isNewPasswordSpecialChar) strengthScore++;

    if (strengthScore < 3) {
      this.newPasswordStrength = 'Slabo';
    } else if (strengthScore < 5) {
      this.newPasswordStrength = 'Srednje';
    } else {
      this.newPasswordStrength = 'Jako';
    }

    // Check new password vs confirm password real-time
    this.passwordMismatch = this.newPassword !== this.confirmNewPassword && this.confirmNewPassword.length > 0;
  }


  resetPasswordValidation(): void {
    this.newPasswordStrength = '';
    this.passwordMismatch = false;
    this.isNewPasswordLongEnough = false;
    this.isNewPasswordLowercase = false;
    this.isNewPasswordUppercase = false;
    this.isNewPasswordNumber = false;
    this.isNewPasswordSpecialChar = false;
  }

  onSaveSecuritySettings(): void {
    if (this.showPasswordFields) {
      // 1. Validate current password
      if (this.currentPassword !== this.defaultCurrentPassword) {
        this.snackBar.open('Trenutna lozinka nije tačna!', 'Zatvori', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // 2. Validate new password strength/criteria
      if (!this.isNewPasswordLongEnough || !this.isNewPasswordLowercase || !this.isNewPasswordUppercase || !this.isNewPasswordNumber || !this.isNewPasswordSpecialChar) {
        this.snackBar.open('Nova lozinka ne ispunjava sve kriterije!', 'Zatvori', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // 3. Validate new password and confirm new password match
      if (this.newPassword !== this.confirmNewPassword) {
        this.snackBar.open('Nova lozinka i potvrda se ne podudaraju!', 'Zatvori', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // If all validations pass
      console.log('Changing password:', {
        current: this.currentPassword,
        new: this.newPassword
      });
      this.snackBar.open('Lozinka uspješno promijenjena!', 'Zatvori', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.togglePasswordFields(); // Hide fields after successful change
    } else {
      // Logic for saving 2FA setting
      console.log('Saving 2FA setting:', this.userPreferences.twoFactorAuthEnabled);
      this.snackBar.open('Postavke sigurnosti uspješno spremljene!', 'Zatvori', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }


  currentPasswordTouched = false;
  confirmTouched = false;
  currentPasswordValid = false;
  currentPasswordInvalid = false;
  onCurrentPasswordChange(): void {
    this.currentPasswordValid = this.currentPassword === this.defaultCurrentPassword;
    this.currentPasswordInvalid = this.currentPassword.length > 0 && !this.currentPasswordValid;

    if (!this.currentPasswordValid) {
      this.newPassword = '';
      this.confirmNewPassword = '';
      this.resetPasswordValidation();
    }
  }

  onConfirmPasswordChange(): void {
    this.passwordMismatch =
      this.confirmNewPassword.length > 0 &&
      this.confirmNewPassword !== this.newPassword;
  }

  canSavePassword(): boolean {
    return this.currentPasswordValid &&
      this.isNewPasswordLongEnough &&
      this.isNewPasswordLowercase &&
      this.isNewPasswordUppercase &&
      this.isNewPasswordNumber &&
      this.isNewPasswordSpecialChar &&
      !this.passwordMismatch;
  }




}
