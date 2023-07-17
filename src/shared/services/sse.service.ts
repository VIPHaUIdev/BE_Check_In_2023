import { Injectable } from '@nestjs/common';
import { Observable, Subject, Subscription } from 'rxjs';

@Injectable()
export class SseService {
  private readonly sseSubject = new Subject<string>();
  private sseSubscription: Subscription;

  send(data: string): void {
    this.sseSubject.next(data);
  }

  getObservable(): Observable<string> {
    return this.sseSubject.asObservable();
  }

  unsubscribe(): void {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
  }
}
