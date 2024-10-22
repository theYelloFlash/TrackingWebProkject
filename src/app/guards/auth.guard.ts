import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';



export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID); // Inject the PLATFORM_ID
  const isPlatFormBrowser = isPlatformBrowser(platformId);

  if (isPlatFormBrowser) {
    const access_token = localStorage.getItem('access_token');
    if (access_token) {
      // If token exists, redirect to the users
      router.navigateByUrl('/users'); // Adjust the route as needed
      return false; // Prevent navigation to login
    }
  }

  return true; // Allow navigation to login if no token is found
};

export const unauthGaurd : CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID); // Inject the PLATFORM_ID
  const isPlatFormBrowser = isPlatformBrowser(platformId);
  if (isPlatFormBrowser) {
    const access_token = localStorage.getItem('access_token');
    if (access_token) {
      return true; // Prevent navigation to login
    }
  }

  return false;
}
