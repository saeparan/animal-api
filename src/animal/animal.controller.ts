import { Controller, Get } from '@nestjs/common';
import { AnimalService } from './animal.service';

@Controller('animal')
export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  @Get()
  async findAll(): Promise<any> {
    // return await this.batchService.createAnimalPeriod();
  }
}
