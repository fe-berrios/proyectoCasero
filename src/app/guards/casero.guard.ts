import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { from, map, catchError, of } from 'rxjs';

export const caseroGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  return from(supabase.profile).pipe(
    map((response: any) => {
      const esCasero = response?.data?.casero_status === true;
      if (!esCasero) {
        router.navigate(['/']); // Redirige si no es casero
      }
      return esCasero;
    }),
    catchError((error) => {
      console.error('Error al validar perfil casero:', error);
      router.navigate(['/']);
      return of(false);
    })
  );
};
