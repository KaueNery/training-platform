import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkoutService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.WorkoutCreateInput) {
    return this.prisma.workout.create({ data });
  }

  findAll() {
    return this.prisma.workout.findMany();
  }

  async findOne(id: number) {
    const workout = await this.prisma.workout.findUnique({ where: { id } });
    if (!workout) throw new NotFoundException('Workout not found');
    return workout;
  }

  async update(id: number, data: Prisma.WorkoutUpdateInput) {
    await this.findOne(id);
    return this.prisma.workout.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.workout.delete({ where: { id } });
  }
}
