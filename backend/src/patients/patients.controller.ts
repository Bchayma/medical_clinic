import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiBearerAuth('access-token')
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  // Ajout d'un patient par l'admin ou un médecin (interne/externe)
  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  create(@Body() body: any) {
    return this.patientsService.create(body);
  }

  // Liste de tous les patients : admin uniquement (les médecins ont leur propre endpoint filtré)
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.patientsService.findAll();
  }

  @Get('by-doctor/:doctorId')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.patientsService.findByDoctor(doctorId);
  }

  @Get('me/profile')
  @Roles(Role.PATIENT)
  getMyProfile(@CurrentUser() user: any) {
    return this.patientsService.findByUserId(user.userId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL, Role.PATIENT)
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL, Role.PATIENT)
  update(@Param('id') id: string, @Body() body: any) {
    return this.patientsService.update(id, body);
  }

  @Post(':id/notes')
  @Roles(Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  addNote(@Param('id') id: string, @Body('doctorId') doctorId: string, @Body('note') note: string) {
    return this.patientsService.addMedicalNote(id, doctorId, note);
  }

  @Patch(':id/attach-doctor/:doctorId')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  attachDoctor(@Param('id') id: string, @Param('doctorId') doctorId: string) {
    return this.patientsService.attachDoctor(id, doctorId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
