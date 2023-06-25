import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SseService {
  private readonly sseSubject = new Subject<string>();

  send(data: string): void {
    this.sseSubject.next(data);
  }

  getObservable(): Observable<string> {
    return this.sseSubject.asObservable();
  }
}
