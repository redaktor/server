import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map((v) => {
        v = v === null ? '' : v;
        if (typeof v === 'object') {
          //console.log(context.switchToHttp().getRequest())


          if (v.hasOwnProperty('user') && v.user.hasOwnProperty('password')) {
            v.user.password = '[...]';
          } else if (v.hasOwnProperty('password')) {
            v.password = '[...]';
          }
        }
        return v
      }));
  }
}
