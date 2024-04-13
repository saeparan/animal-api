import { HttpModule } from '@nestjs/axios';
import { AnimalController } from './animal.controller';
import { AnimalService } from './animal.service';
import { AnimalResolver, OrgResolver } from './animal.resolver';
import { Module } from '@nestjs/common';
import { AnimalSchema } from '../schemas/animal.schema';
import { OrgSchema } from '../schemas/org.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ShelterSchema } from 'src/schemas/shelter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Animal', schema: AnimalSchema },
      { name: 'Org', schema: OrgSchema },
      { name: 'Shelter', schema: ShelterSchema },
    ]),
    HttpModule,
  ],
  controllers: [AnimalController],
  providers: [AnimalService, AnimalResolver, OrgResolver],
})
export class AnimalModule {}
