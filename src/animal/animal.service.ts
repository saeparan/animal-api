import { Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Animal } from '../schemas/animal.schema';
import { Org } from '../schemas/org.schema';
import * as dayjs from 'dayjs';

export type IAnimals = IAnimal[];
export interface IAnimal {
  desertionNo: string;
  filename: string;
  happenDt: string;
  happenPlace: string;
  kindCd: string;
  colorCd: string;
  age: string;
  weight: string;
  noticeNo: string;
  noticeSdt: string;
  noticeEdt: string;
  popfile: string;
  processState: string;
  sexCd: string;
  neuterYn: string;
  specialMark: string;
  careNm: string;
  careTel: string;
  careAddr: string;
  orgNm: string;
  chargeNm: string;
  officetel: string;
}

@Injectable()
export class AnimalService {
  constructor(
    @InjectModel(Animal.name) private readonly animalModel: Model<Animal>,
    @InjectModel(Org.name) private readonly orgModel: Model<Org>,
    private readonly httpService: HttpService,
  ) {}
  private readonly logger = new Logger(AnimalService.name);

  async getAnimals() {
    return await this.animalModel.find().limit(10).sort({ _id: -1 });
  }

  async getAnimal(id: string) {
    return await this.animalModel.findOne({ _id: id });
  }

  async getDetailOrg(orgFirst: string) {
    return (await this.orgModel.find({ 'org.0': orgFirst }).sort({ 'org.1': 1 })).map((row) => {
      return { ...row, ...{ org: row.org.slice(1) } };
    });
  }
}
