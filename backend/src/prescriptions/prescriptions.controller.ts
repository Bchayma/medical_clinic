import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('prescriptions')
@ApiBearerAuth('access-token')
@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  // Création d'une ordonnance : médecin interne ou externe uniquement
  @Post()
  @Roles(Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL, Role.ADMIN)
  create(@Body() body: any) {
    return this.prescriptionsService.create(body);
  }

  // Consultation de toutes les ordonnances : admin (archivage / suivi)
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.prescriptionsService.findAll();
  }

  @Get('by-patient/:patientId')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL, Role.PATIENT)
  findByPatient(@Param('patientId') patientId: string) {
    return this.prescriptionsService.findByPatient(patientId);
  }

  @Get('by-doctor/:doctorId')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.prescriptionsService.findByDoctor(doctorId);
  }

  @Get(':id/with-pharmacy-stocks')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL, Role.PATIENT)
  @ApiOperation({ summary: 'Récupérer une ordonnance enrichie avec les disponibilités en pharmacie' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Ordonnance enrichie' })
  findOneWithPharmacyAvailability(@Param('id') id: string) {
    return this.prescriptionsService.findOneWithPharmacyAvailability(id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL, Role.PATIENT)
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  update(@Param('id') id: string, @Body() body: any) {
    return this.prescriptionsService.update(id, body);
  }

  // Archiver une ordonnance : admin
  @Patch(':id/archive')
  @Roles(Role.ADMIN)
  archive(@Param('id') id: string) {
    return this.prescriptionsService.archive(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(id);
  }
}
