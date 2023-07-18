import { Injectable } from '@nestjs/common';
import { Observable, Subject, Subscription } from 'rxjs';

@Injectable()
export class SseService {
  private readonly sseSubject = new Subject<string>();
  private sseSubscription: Subscription;
  private updatedUserId: string = '';

  send(data: string): void {
    this.sseSubject.next(data);
  }

  getObservable(): Observable<string> {
    return this.sseSubject.asObservable();
  }

  setCheckedinUser(userId: string): void {
    this.updatedUserId = userId;
  }

  getCheckedinUser(): string {
    return this.updatedUserId;
  }

  unsubscribe(): void {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
  }
}
