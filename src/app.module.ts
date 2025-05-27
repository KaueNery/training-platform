import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { WorkoutModule } from './workout/workout.module';
import { ActivityModule } from './activity/activity.module';

@Module({
  imports: [PrismaModule, UserModule, WorkoutModule, ActivityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
