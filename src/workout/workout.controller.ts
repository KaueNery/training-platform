import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { Prisma } from '@prisma/client';

@Controller('workouts')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Post()
  create(@Body() data: Prisma.WorkoutCreateInput) {
    return this.workoutService.create(data);
  }

  @Get()
  findAll() {
    return this.workoutService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Prisma.WorkoutUpdateInput) {
    return this.workoutService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workoutService.remove(+id);
  }
}
