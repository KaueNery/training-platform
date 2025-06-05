import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainingDayDto } from './dto/create-training-day.dto';
import { UpdateTrainingDayDto } from './dto/update-training-day.dto';

@Injectable()
export class TrainingDayService {
  constructor(private prisma: PrismaService) {}

  async create(createTrainingDayDto: CreateTrainingDayDto) {
    // First verify that the training plan exists
    const trainingPlan = await this.prisma.trainingPlan.findUnique({
      where: { id: createTrainingDayDto.trainingPlanId },
    });

    if (!trainingPlan) {
      throw new NotFoundException(`Training plan with ID ${createTrainingDayDto.trainingPlanId} not found`);
    }

    return this.prisma.trainingPlanDay.create({
      data: {
        ...createTrainingDayDto,
        isModified: false,
      },
      include: {
        trainingPlan: true,
        activities: true,
      },
    });
  }

  async findAll(trainingPlanId: number) {
    return this.prisma.trainingPlanDay.findMany({
      where: { trainingPlanId },
      include: {
        activities: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const trainingDay = await this.prisma.trainingPlanDay.findUnique({
      where: { id },
      include: {
        trainingPlan: true,
        activities: true,
      },
    });

    if (!trainingDay) {
      throw new NotFoundException(`Training day with ID ${id} not found`);
    }

    return trainingDay;
  }

  async update(id: number, updateTrainingDayDto: UpdateTrainingDayDto, editorRole: 'coach' | 'athlete') {
    const trainingDay = await this.findOne(id);

    // Check if athlete has permission to edit
    if (editorRole === 'athlete' && !trainingDay.isEditableByAthlete) {
      throw new ForbiddenException('Athletes are not allowed to edit this training day');
    }

    return this.prisma.trainingPlanDay.update({
      where: { id },
      data: {
        ...updateTrainingDayDto,
        isModified: true,
        lastEditedBy: editorRole,
      },
      include: {
        trainingPlan: true,
        activities: true,
      },
    });
  }

  async remove(id: number) {
    // First check if the training day exists
    await this.findOne(id);

    return this.prisma.trainingPlanDay.delete({
      where: { id },
    });
  }
} 