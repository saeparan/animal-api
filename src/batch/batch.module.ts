import { HttpModule } from '@nestjs/axios';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { PrismaService } from '../prisma.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  controllers: [BatchController],
  providers: [BatchService, PrismaService],
})
export class BatchModule {}
