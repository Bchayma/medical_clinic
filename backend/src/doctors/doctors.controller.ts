import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { DoctorType } from './schemas/doctor.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiBearerAuth('access-token')
@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  // Ajout d'un médecin (interne ou externe) : réservé à l'admin
  @Post()
  @Roles(Role.ADMIN)
  create(@Body() body: any) {
    return this.doctorsService.create(body);
  }

  @Get()
  findAll(@Query('type') type?: DoctorType) {
    return this.doctorsService.findAll(type);
  }

  @Get('me/profile')
  @Roles(Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  getMyProfile(@CurrentUser() user: any) {
    return this.doctorsService.findByUserId(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  // Affecter un cabinet à un médecin interne : réservé à l'admin
  @Patch(':id/cabinet/:cabinetId')
  @Roles(Role.ADMIN)
  assignCabinet(@Param('id') id: string, @Param('cabinetId') cabinetId: string) {
    return this.doctorsService.assignCabinet(id, cabinetId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  update(@Param('id') id: string, @Body() body: any) {
    return this.doctorsService.update(id, body);
  }

  @Patch(':id/availability')
  @Roles(Role.DOCTOR_INTERNAL, Role.DOCTOR_EXTERNAL)
  updateAvailability(@Param('id') id: string, @Body('availability') availability: any[]) {
    return this.doctorsService.updateAvailability(id, availability);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(id);
  }
}
