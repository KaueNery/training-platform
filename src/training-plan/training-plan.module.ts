import { Module } from '@nestjs/common';
import { TrainingPlanController } from './training-plan.controller';
import { TrainingPlanService } from './training-plan.service';
import { TrainingDayController } from './training-day.controller';
import { TrainingDayService } from './training-day.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TrainingPlanController, TrainingDayController],
  providers: [TrainingPlanService, TrainingDayService],
  exports: [TrainingPlanService, TrainingDayService],
})
export class TrainingPlanModule {} 