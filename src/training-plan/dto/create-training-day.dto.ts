import { IsString, IsOptional, IsInt, IsBoolean, IsDateString } from 'class-validator';

export class CreateTrainingDayDto {
  @IsInt()
  trainingPlanId: number;

  @IsDateString()
  date: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  durationMinutes: number;

  @IsString()
  type: string; // e.g., 'interval', 'long run', 'easy'

  @IsString()
  createdBy: 'coach' | 'athlete';

  @IsString()
  lastEditedBy: 'coach' | 'athlete';

  @IsBoolean()
  @IsOptional()
  isEditableByAthlete?: boolean = true;
} 