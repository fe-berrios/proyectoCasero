import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { from, map } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  return from(supabase.profile).pipe(
    map((response: any) => {
      if (response?.data?.admin_status) {
        return true;
      } else {
        router.navigate(['/']); // Redirige al home u otra página si no es admin
        return false;
      }
    })
  );
};
