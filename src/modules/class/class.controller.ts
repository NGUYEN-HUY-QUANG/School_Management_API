import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';

@ApiTags('Classes')
@Controller('classes')
export class ClassController {
  constructor(
    private readonly classService: ClassService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new class',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateClassDto) {
    return this.classService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all classes',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.classService.findAll();
  }
}