import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnimalService } from './animal.service';
import dayjs from 'dayjs';

@Controller('animal')
export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  @Get()
  async findAll(@Query() query): Promise<any> {
    return await this.animalService.getAnimals(query);
  }

  @Get('service')
  async findServiceAnimals(@Query() query): Promise<any> {
    return await this.animalService.getServiceAnimals(query);
  }

  @Get('service/:id')
  async findServiceAnimal(@Param() param): Promise<any> {
    return await this.animalService.getServiceAnimal(param.id);
  }

  @Get('analytics/:period')
  async analyticsPeriod(@Param() param): Promise<any> {
    return await this.animalService.analyticsPeriod(param.period ?? dayjs().format('YYYY-MM'));
  }

  @Get('latest')
  async findLatest(@Query() query): Promise<any> {
    return await this.animalService.getLatestAnimals(4);
  }

  @Get('realtime')
  async realtime(): Promise<any> {
    return await this.animalService.realtime();
  }

  // @Get('shelters')
  // async getShelters(): Promise<any> {
  //   return await this.animalService.getShelters();
  // }

  @Get('region/1')
  async getFirstRegion(): Promise<any> {
    return await this.animalService.getFirstRegions();
  }
}
