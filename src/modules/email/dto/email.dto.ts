import { Status } from '.prisma/client';

export class EmailRespone {
  userId: string;

  status: Status;

  reason?: string;
}

export class EmailJobDto {
  email: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
}
