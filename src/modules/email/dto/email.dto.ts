import { Status } from '@prisma/client';

export class EmailJobDto {
  email: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
}

export class GetAllJobs {
  id: string;
  status: Status;
  reason: string;
  createdAt: Date;
  user: {
    email: string;
  };
}

export class GetAllJobsResponse {
  emails: GetAllJobs[];
  count: number;
  limit: number;
  page: number;
}
