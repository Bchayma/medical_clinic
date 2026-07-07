import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from './schemas/appointment.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiBearerAuth('access-token')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  // Prise de rendez-vous : par le patient (ou saisie par le médecin/admin)
  @Post()
  @Roles(Role.PATIENT, Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  create(@Body() body: any) {
    return this.appointmentsService.create(body);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get('by-doctor/:doctorId')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.appointmentsService.findByDoctor(doctorId);
  }

  @Get('by-cabinet/:cabinetId')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL)
  findByCabinet(@Param('cabinetId') cabinetId: string) {
    return this.appointmentsService.findByCabinet(cabinetId);
  }

  @Get('by-patient/:patientId')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL, Role.PATIENT)
  findByPatient(@Param('patientId') patientId: string) {
    return this.appointmentsService.findByPatient(patientId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL, Role.PATIENT)
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  // Accepter / refuser / annuler un rendez-vous
  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL, Role.PATIENT)
  updateStatus(@Param('id') id: string, @Body('status') status: AppointmentStatus) {
    return this.appointmentsService.updateStatus(id, status);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL, Role.PATIENT)
  update(@Param('id') id: string, @Body() body: any) {
    return this.appointmentsService.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
