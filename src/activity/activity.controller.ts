import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadActivity(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = 1; // 🔐 replace with req.user.id if using authentication
    return this.activityService.parseAndSaveActivity(file, userId);
  }
}
