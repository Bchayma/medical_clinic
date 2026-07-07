import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PharmaciesService } from './pharmacies.service';
import { PharmacyType } from './schemas/pharmacy.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiBearerAuth('access-token')
@Controller('pharmacies')
export class PharmaciesController {
  constructor(private pharmaciesService: PharmaciesService) {}

  // Création : admin crée la pharmacie centrale et ajoute les pharmacies partenaires
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() body: any) {
    return this.pharmaciesService.create(body);
  }

  // Liste publique (utile pour la recherche de médicaments côté patient)
  @Get()
  findAll(@Query('type') type?: PharmacyType) {
    return this.pharmaciesService.findAll(type);
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER)
  getMyProfile(@CurrentUser() user: any) {
    return this.pharmaciesService.findByUserId(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pharmaciesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER)
  update(@Param('id') id: string, @Body() body: any) {
    return this.pharmaciesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.pharmaciesService.remove(id);
  }
}
