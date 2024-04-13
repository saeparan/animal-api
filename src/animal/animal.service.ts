import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Animal } from '../schemas/animal.schema';
import { Shelter } from '../schemas/shelter.schema';
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
    @InjectModel(Shelter.name) private readonly shelterModel: Model<Shelter>,
  ) {}
  private readonly logger = new Logger(AnimalService.name);

  async getAnimals() {
    const data = await this.animalModel
      .find({
        // kindCd: '고양이',
        processState: '보호중',
        // processStateReason: '입양',
        happenDt: {
          // $eq: dayjs(dayjs().format('YYYY-MM-DD')).toDate(),
          $eq: dayjs('2024-04-12').toDate(),
        },
        // noticeEndDate: {
        //   $gte: dayjs('2024-03-10').toDate(),
        // },
      })
      .sort({ happenDt: 1, careAddress: 1, desertionNo: 1 });
    console.log(data.length);
    // const randedData = data.slice().sort(() => 0.5 - Math.random());
    // .slice(0, 100);

    return data;
  }

  async getShelters() {
    const rows = await this.shelterModel.find();
    const data = rows.map((r) => {
      return {
        ...r.toObject(),
        id: r.id,
      };
    });

    return data;
  }

  async getAnimal(id: string) {
    return await this.animalModel.findOne({ _id: id });
  }

  async getDetailOrg(orgFirst: string) {
    return (await this.orgModel.find({ 'org.0': orgFirst }).sort({ 'org.1': 1 })).map((row) => {
      return { ...row, ...{ org: row.org.slice(1) } };
    });
  }

  async setHitAnimal(id: string) {
    return await this.animalModel.findOneAndUpdate({ _id: id }, { $inc: { hit: 1 } }, { new: true });
  }
}
