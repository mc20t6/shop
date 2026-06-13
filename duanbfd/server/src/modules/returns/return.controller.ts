import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';
import { ReturnService } from './return.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('returns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STAFF')
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Post()
  create(@Body() createReturnDto: CreateReturnDto) {
    return this.returnService.create(createReturnDto);
  }

  @Get()
  findAll() {
    return this.returnService.findAll();
  }

  @Get('order/:orderId')
  findByOrderId(@Param('orderId') orderId: string) {
    return this.returnService.findByOrderId(orderId);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.returnService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.returnService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReturnDto: UpdateReturnDto) {
    return this.returnService.update(id, updateReturnDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateReturnStatusDto: UpdateReturnStatusDto,
  ) {
    return this.returnService.updateStatus(id, updateReturnStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.returnService.remove(id);
  }
}
