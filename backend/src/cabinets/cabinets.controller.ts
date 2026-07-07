import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CabinetsService } from './cabinets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiBearerAuth('access-token')
@Controller('cabinets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CabinetsController {
  constructor(private cabinetsService: CabinetsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() body: any) {
    return this.cabinetsService.create(body);
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL)
  findAll() {
    return this.cabinetsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL)
  findOne(@Param('id') id: string) {
    return this.cabinetsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL)
  update(@Param('id') id: string, @Body() body: any) {
    return this.cabinetsService.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.cabinetsService.remove(id);
  }
}
