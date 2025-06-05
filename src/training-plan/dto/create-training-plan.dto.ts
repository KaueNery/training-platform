import { IsString, IsOptional, IsDateString, IsInt } from 'class-validator';

export class CreateTrainingPlanDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  goal?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  userId: number;

  @IsInt()
  @IsOptional()
  coachId?: number;
} 