import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { WorkoutModule } from './workout/workout.module';

@Module({
  imports: [PrismaModule, UserModule, WorkoutModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
