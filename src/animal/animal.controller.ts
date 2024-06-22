import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnimalService } from './animal.service';
import dayjs from 'dayjs';

@Controller('animal')
export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  @Get()
  async findAll(@Query() query): Promise<any> {
    return await this.animalService.getAnimals(query.date, query.type);
  }

  @Get('latest')
  async findLatest(@Query() query): Promise<any> {
    return await this.animalService.getLatestAnimals(4);
  }

  @Get('realtime')
  async realtime(): Promise<any> {
    return await this.animalService.realtime();
  }

  @Get('save/image')
  async saveImages(): Promise<any> {
    return await this.animalService.saveAnimalImages();
  }

  @Get('shelters')
  async getShelters(): Promise<any> {
    return await this.animalService.getShelters();
  }
}
