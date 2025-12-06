import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DateFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => formatResponseDates(data)),
    );
  }
}

/* -------- Helpers -------- */

// ISO formatdagi datetime ni aniqlash uchun regex
const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

function formatDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function formatResponseDates(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const seen = new WeakSet();

  (function recurse(target: any) {
    if (!target || typeof target !== 'object') return;
    if (seen.has(target)) return;
    seen.add(target);

    if (Array.isArray(target)) {
      for (let i = 0; i < target.length; i++) {
        const v = target[i];
        if (v instanceof Date) target[i] = formatDate(v);
        else if (typeof v === 'string' && ISO_DATE_RE.test(v))
          target[i] = formatDate(new Date(v));
        else if (typeof v === 'object') recurse(v);
      }
      return;
    }

    for (const key of Object.keys(target)) {
      const val = target[key];

      if (val instanceof Date) {
        target[key] = formatDate(val);
      } else if (typeof val === 'string' && ISO_DATE_RE.test(val)) {
        target[key] = formatDate(new Date(val));
      } else if (typeof val === 'object') {
        recurse(val);
      }
    }
  })(obj);

  return obj;
}
