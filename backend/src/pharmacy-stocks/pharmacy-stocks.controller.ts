import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PharmacyStocksService } from './pharmacy-stocks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreatePharmacyStockDto } from './dto/create-pharmacy-stock.dto';
import { UpdatePharmacyStockDto } from './dto/update-pharmacy-stock.dto';

@ApiTags('pharmacy-stocks')
@ApiBearerAuth('access-token')
@Controller('pharmacy-stocks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PharmacyStocksController {
  constructor(private pharmacyStocksService: PharmacyStocksService) {}

  @Post()
  @Roles(Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER, Role.ADMIN)
  @ApiOperation({ summary: 'Ajouter ou mettre à jour le stock d’un médicament en pharmacie' })
  @ApiResponse({ status: 201, description: 'Stock créé ou mis à jour' })
  create(@Body() body: CreatePharmacyStockDto) {
    return this.pharmacyStocksService.create(body);
  }

  @Get('medicine/:medicineId')
@Roles(Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER, Role.ADMIN)
@ApiOperation({
  summary: 'Lister les pharmacies possédant un médicament',
})
@ApiParam({
  name: 'medicineId',
  required: true,
})
findByMedicine(@Param('medicineId') medicineId: string) {
  return this.pharmacyStocksService.findByMedicine(medicineId);
}

  @Get()
  @Roles(Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER, Role.ADMIN)
  @ApiOperation({ summary: 'Consulter le stock complet' })
  @ApiResponse({ status: 200, description: 'Liste complète des stocks' })
  findAll() {
    return this.pharmacyStocksService.findAll();
  }

  @Get('pharmacy/:pharmacyId')
  @Roles(Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER, Role.ADMIN)
  @ApiOperation({ summary: 'Consulter le stock complet d’une pharmacie' })
  @ApiParam({ name: 'pharmacyId', required: true })
  findByPharmacy(@Param('pharmacyId') pharmacyId: string) {
    return this.pharmacyStocksService.findByPharmacy(pharmacyId);
  }

  @Get('pharmacy/:pharmacyId/available')
  @Roles(Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER, Role.ADMIN)
  @ApiOperation({ summary: 'Lister uniquement les médicaments disponibles dans une pharmacie' })
  @ApiParam({ name: 'pharmacyId', required: true })
  findAvailableByPharmacy(@Param('pharmacyId') pharmacyId: string) {
    return this.pharmacyStocksService.findAvailableByPharmacy(pharmacyId);
  }

  @Get('pharmacy/:pharmacyId/search')
  @Roles(Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER, Role.ADMIN)
  @ApiOperation({ summary: 'Rechercher un médicament dans le stock d’une pharmacie' })
  @ApiParam({ name: 'pharmacyId', required: true })
  @ApiQuery({ name: 'name', required: true })
  @ApiQuery({ name: 'available', required: false, description: 'Filtrer sur quantity > 0' })
  searchByPharmacy(
    @Param('pharmacyId') pharmacyId: string,
    @Query('name') name: string,
    @Query('available') available?: string,
  ) {
    return this.pharmacyStocksService.searchByPharmacy(pharmacyId, name, available === 'true');
  }

  @Get('search')
@Roles(Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER, Role.ADMIN)
@ApiOperation({
  summary: 'Chercher un médicament dans toutes les pharmacies disponibles',
})
@ApiQuery({
  name: 'name',
  required: true,
  description: 'Nom du médicament',
})
searchAllPharmacies(
  @Query('name') name: string,
) {
  return this.pharmacyStocksService.findAvailablePharmaciesForMedicineName(name);
}

  @Get(':id')
  @Roles(Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER, Role.ADMIN)
  @ApiOperation({ summary: 'Consulter un stock précis' })
  @ApiParam({ name: 'id', required: true })
  findOne(@Param('id') id: string) {
    return this.pharmacyStocksService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER, Role.ADMIN)
  @ApiOperation({ summary: 'Modifier un stock de pharmacie' })
  @ApiParam({ name: 'id', required: true })
  update(@Param('id') id: string, @Body() body: UpdatePharmacyStockDto) {
    return this.pharmacyStocksService.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.PHARMACY_CENTRAL, Role.PHARMACY_PARTNER, Role.ADMIN)
  @ApiOperation({ summary: 'Supprimer un stock de pharmacie' })
  @ApiParam({ name: 'id', required: true })
  remove(@Param('id') id: string) {
    return this.pharmacyStocksService.remove(id);
  }
}