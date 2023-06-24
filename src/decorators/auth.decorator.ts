import { UseGuards, applyDecorators } from '@nestjs/common';
import { RoleType } from 'src/constants';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from './roles.decorator';

export function Auth() {
  return applyDecorators(
    UseGuards(AuthGuard, RolesGuard)
  );
}

export function Admin() {
  return applyDecorators(
    Roles(RoleType.ADMIN),
    UseGuards(AuthGuard, RolesGuard)
  );
}
