import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MedicationsService } from './medications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiBearerAuth('access-token')
@Controller('medications')
export class MedicationsController {
  constructor(private medicationsService: MedicationsService) {}

  // Recherche publique (patients) : trouver un médicament et les pharmacies où il est disponible
  @Get('search')
  search(@Query('name') name: string) {
    return this.medicationsService.search(name);
  }
  @Get()
findAll() {
  return this.medicationsService.findAll();
}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER, Role.ADMIN)
  create(@Body() body: any) {
    return this.medicationsService.create(body);
  }

  @Get('by-pharmacy/:pharmacyId')
  findByPharmacy(@Param('pharmacyId') pharmacyId: string) {
    return this.medicationsService.findByPharmacy(pharmacyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER, Role.ADMIN)
  update(@Param('id') id: string, @Body() body: any) {
    return this.medicationsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.medicationsService.remove(id);
  }
}
