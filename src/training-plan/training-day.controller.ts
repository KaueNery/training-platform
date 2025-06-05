import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { TrainingDayService } from './training-day.service';
import { CreateTrainingDayDto } from './dto/create-training-day.dto';
import { UpdateTrainingDayDto } from './dto/update-training-day.dto';

@Controller('training-days')
export class TrainingDayController {
  constructor(private readonly trainingDayService: TrainingDayService) {}

  @Post()
  create(@Body() createTrainingDayDto: CreateTrainingDayDto) {
    return this.trainingDayService.create(createTrainingDayDto);
  }

  @Get('plan/:trainingPlanId')
  findAll(@Param('trainingPlanId', ParseIntPipe) trainingPlanId: number) {
    return this.trainingDayService.findAll(trainingPlanId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trainingDayService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrainingDayDto: UpdateTrainingDayDto,
    @Query('role') role: 'coach' | 'athlete' = 'athlete',
  ) {
    return this.trainingDayService.update(id, updateTrainingDayDto, role);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.trainingDayService.remove(id);
  }
} 