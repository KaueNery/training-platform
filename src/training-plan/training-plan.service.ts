import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';
import { UpdateTrainingPlanDto } from './dto/update-training-plan.dto';

@Injectable()
export class TrainingPlanService {
  constructor(private prisma: PrismaService) {}

  async create(createTrainingPlanDto: CreateTrainingPlanDto) {
    return this.prisma.trainingPlan.create({
      data: {
        ...createTrainingPlanDto,
        version: 1, // Initial version
        isActive: true,
      },
      include: {
        user: true,
        coach: true,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.trainingPlan.findMany({
      where: {
        OR: [
          { userId },
          { coachId: userId },
        ],
      },
      include: {
        user: true,
        coach: true,
        trainingDays: true,
      },
    });
  }

  async findOne(id: number) {
    const trainingPlan = await this.prisma.trainingPlan.findUnique({
      where: { id },
      include: {
        user: true,
        coach: true,
        trainingDays: true,
      },
    });

    if (!trainingPlan) {
      throw new NotFoundException(`Training plan with ID ${id} not found`);
    }

    return trainingPlan;
  }

  async update(id: number, updateTrainingPlanDto: UpdateTrainingPlanDto) {
    // First check if the plan exists
    await this.findOne(id);

    return this.prisma.trainingPlan.update({
      where: { id },
      data: updateTrainingPlanDto,
      include: {
        user: true,
        coach: true,
        trainingDays: true,
      },
    });
  }

  async remove(id: number) {
    // First check if the plan exists
    await this.findOne(id);

    return this.prisma.trainingPlan.delete({
      where: { id },
    });
  }
} 