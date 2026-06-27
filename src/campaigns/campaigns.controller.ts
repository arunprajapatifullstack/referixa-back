import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/create-campaign.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BusinessId } from '../common/decorators/business.decorator';

@ApiTags('Campaigns')
@Controller('campaigns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Get()
  @ApiOperation({ summary: 'List all campaigns' })
  findAll(@BusinessId() businessId: string) {
    return this.campaignsService.findAll(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single campaign by ID' })
  findOne(@BusinessId() businessId: string, @Param('id') id: string) {
    return this.campaignsService.findOne(businessId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  create(@BusinessId() businessId: string, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(businessId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a campaign' })
  update(
    @BusinessId() businessId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(businessId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a campaign' })
  remove(@BusinessId() businessId: string, @Param('id') id: string) {
    return this.campaignsService.remove(businessId, id);
  }
}
