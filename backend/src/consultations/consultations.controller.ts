import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ConsultationsService } from './consultations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiBearerAuth('access-token')
@Controller('consultations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConsultationsController {
  constructor(private consultationsService: ConsultationsService) {}

  @Post()
  @Roles(Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  create(@Body() body: any) {
    return this.consultationsService.create(body);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.consultationsService.findAll();
  }

  @Get('by-patient/:patientId')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL, Role.PATIENT)
  findByPatient(@Param('patientId') patientId: string) {
    return this.consultationsService.findByPatient(patientId);
  }

  @Get('by-doctor/:doctorId')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.consultationsService.findByDoctor(doctorId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL, Role.PATIENT)
  findOne(@Param('id') id: string) {
    return this.consultationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  update(@Param('id') id: string, @Body() body: any) {
    return this.consultationsService.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  remove(@Param('id') id: string) {
    return this.consultationsService.remove(id);
  }
}
