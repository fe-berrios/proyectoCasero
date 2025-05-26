import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { from, map, catchError, of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  return from(supabase.profile).pipe(
    map((response: any) => {
      const isAdmin = response?.data?.admin_status === true;
      if (!isAdmin) {
        router.navigate(['/']); // redirige si no es admin
      }
      return isAdmin;
    }),
    catchError((error) => {
      console.error('Error al validar perfil admin:', error);
      router.navigate(['/']);
      return of(false);
    })
  );
};
