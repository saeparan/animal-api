import { HttpModule } from '@nestjs/axios';
import { AnimalController } from './animal.controller';
import { AnimalService } from './animal.service';
import { AnimalResolver } from './animal.resolver';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [AnimalController],
  providers: [PrismaService, AnimalService, AnimalResolver],
})
export class AnimalModule { }
