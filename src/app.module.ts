import { BatchModule } from './batch/batch.module';
import { BatchService } from './batch/batch.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [BatchModule, HttpModule],
  controllers: [AppController],
  providers: [BatchService, AppService, PrismaService],
})
export class AppModule {}
