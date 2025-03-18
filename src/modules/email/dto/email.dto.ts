import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class EmailJobDto {
  email: string;
  userId?: string;
  fullName: string;
  phoneNumber?: string;
}

export class UserEmailDto {
  @ApiProperty({ description: 'The unique identifier of the user' })
  email: string;
}

export class GetAllJobs {
  @ApiProperty({ description: 'The unique identifier of the job' })
  id: string;

  @ApiProperty({
    description: 'The current status of the job',
    enumName: 'Status',
    enum: Status,
  })
  status: Status;

  @ApiProperty({ description: 'Reason for the job status' })
  reason: string;

  @ApiProperty({ description: 'Date and time when the job was created' })
  createdAt: Date;

  @ApiProperty({
    description: 'User details associated with the job',
    type: () => UserEmailDto,
  })
  user: UserEmailDto;
}

export class GetAllJobsResponse {
  @ApiProperty({ description: 'List of all email jobs', type: [GetAllJobs] })
  emails: GetAllJobs[];

  @ApiProperty({ description: 'Total number of jobs' })
  count: number;

  @ApiProperty({ description: 'Limit of jobs per page' })
  limit: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;
}
