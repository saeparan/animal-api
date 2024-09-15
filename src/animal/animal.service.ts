import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Animal } from '../schemas/animal.schema';
import { Shelter } from '../schemas/shelter.schema';
import { Org } from '../schemas/org.schema';
import Jimp from 'jimp';
import * as dayjs from 'dayjs';
import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(Animal.name) private readonly animalModel: Model<Animal>,
    @InjectModel(Org.name) private readonly orgModel: Model<Org>,
    @InjectModel(Shelter.name) private readonly shelterModel: Model<Shelter>,
    private prisma: PrismaService,
  ) {}
  private readonly logger = new Logger(AnimalService.name);

  async realtime() {
    const date = dayjs().format('YYYYMMDD');
    const response = await axios.get(
      // `https://apis.data.go.kr/1543061/abandonmentPublicSrvc/abandonmentPublic?serviceKey=okitWTxaNH50jvdtAqdoq1B77k%2FOm75PvYlVf80ZzGuDty5c8bWic5HJuO%2BTC7MOeXoE%2BVP5Q%2FvBnUzXjHB7ww%3D%3D&bgnde=20240310&endde=20240420&pageNo=1&numOfRows=500&_type=json&upr_cd=6480000&org_cd=5360000`,
      `https://apis.data.go.kr/1543061/abandonmentPublicSrvc/abandonmentPublic?serviceKey=okitWTxaNH50jvdtAqdoq1B77k%2FOm75PvYlVf80ZzGuDty5c8bWic5HJuO%2BTC7MOeXoE%2BVP5Q%2FvBnUzXjHB7ww%3D%3D&bgnde=${date}&endde=${date}&pageNo=1&numOfRows=500&_type=json`,
      { responseType: 'json' },
    );

    let data = response?.data?.response?.body?.items?.item ?? [];
    data = data.map((r) => {
      let fileName = r.popfile.split('/');
      fileName = fileName[fileName.length - 1];
      fileName = fileName.split('[')[0].replace('.jpg', '') ?? '';
      r.date = dayjs(fileName);
      r.dateTime = r.date.unix();
      r.happenDtFormatted = dayjs(r.happenDt).format('YYYY년 M월 DD일');
      return { ...r };
    });

    data.sort((a, b) => {
      return b.dateTime - a.dateTime;
    });

    // data = data.filter((x) => x.processState === '종료(안락사)');
    return data;
  }

  async saveAnimalImages() {
    return;
    const data = await this.animalModel
      .find({
        // kindCd: '고양이',
        processState: '보호중',
        // processStateReason: '입양',
        happenDt: {
          // $eq: dayjs(dayjs().format('YYYY-MM-DD')).toDate(),
          $eq: dayjs('2024-04-22').toDate(),
        },
        kindCd: { $not: { $eq: '개' } },
        // kindCd: { $eq: '개' },
        // noticeEndDate: {
        //   $gte: dayjs('2024-03-10').toDate(),
        // },
      })
      .sort({ happenDt: 1, careAddress: 1, desertionNo: 1 })
      .limit(3);

    const yyyymmdd = dayjs().format('YYYYMMDD');
    const fileNames = data.map((x) => x.popFile);
    for (const url of fileNames) {
      // await this.downloadImage(url, `/tmp/${yyyymmdd}/`);
    }

    for (let i = 0; i < fileNames.length; i += 3) {
      const chunk = fileNames.slice(i, i + 3);
      if (chunk.length === 3) {
        let fileName1Split = chunk[0]?.split('/');
        let fileName2Split = chunk[1]?.split('/');
        let fileName3Split = chunk[2]?.split('/');
        let fileName1 = fileName1Split[fileName1Split.length - 1];
        let fileName2 = fileName2Split[fileName2Split.length - 1];
        let fileName3 = fileName3Split[fileName3Split.length - 1];

        const image1 = await Jimp.read(`/tmp/${yyyymmdd}/${fileName1}`);
        const image2 = await Jimp.read(`/tmp/${yyyymmdd}/${fileName2}`);
        const image3 = await Jimp.read(`/tmp/${yyyymmdd}/${fileName3}`);
        image1.resize(450, 600);
        image2.resize(450, 600);
        image3.resize(450, 600);

        const mergedImage = new Jimp(image1.bitmap.width * 3 + 10, image1.bitmap.height + 200);
        mergedImage.composite(image1, 10, 10);
        mergedImage.composite(image2, image1.bitmap.width + 20, 10);
        mergedImage.composite(image3, image1.bitmap.width * 2 + 30, 10);

        const mergedImagePath = `/tmp/merge-test.jpg`;
        const image = await Jimp.read(mergedImagePath);

        const font = await Jimp.loadFont('/tmp/Pretendard.ttf');
        const text = 'TEST 테스트 123123123';
        const x = 10;
        const y = 10;

        image.print(font, x, y, {
          text: text,
          alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
          alignmentY: Jimp.VERTICAL_ALIGN_TOP,
        });

        await image.writeAsync(mergedImagePath);
      }
    }
  }

  async getAnimals(query: any) {
    const { startDate, endDate, type, orgs } = query;
    const data = await this.animalModel
      .find({
        // kindCd: '고양이',
        processState: '보호중',
        // processStateReason: '입양',
        happenDt: {
          $gte: dayjs(startDate).toDate(),
          $lte: dayjs(`${endDate}T23:59:59`).toDate(),
        },
        // kindCd: type ? { $in: type?.replaceAll(' ', '').split(',') } : { $not: { $eq: '개' } },
        orgNm: orgs ? { $in: orgs?.replaceAll(' ', '').split(',') } : {},
        // noticeEndDate: {
        //   $gte: dayjs('2024-03-10').toDate(),
        // },
      })
      .sort({ noticeStartDate: 1 });
    return data;
  }

  async getServiceAnimals(query: any) {
    const filter: { [key: string]: any } = {};
    if (query.animalType1 === '개' || query.animalType1 === '고양이' || query.animalType1 === '기타') {
      filter.kindCd = query.animalType1 === '기타' ? '기타축종' : query.animalType1;
    }
    if (query.region1) {
      filter.orgNm = { $in: [query.region1] };
    }

    return {
      rows: await this.animalModel
        .find(filter)
        .skip((query.page - 1) * 12)
        .limit(12)
        .sort({ _id: -1 }),
      page: Number(query.page),
    };
  }

  async getServiceAnimal(id: string) {
    return await this.animalModel.findOne({
      _id: id,
    });
  }

  async getLatestAnimals(limit: number = 5) {
    return await this.animalModel
      .find({
        processState: '보호중',
      })
      .select({ _id: 1, popFile: 1, fileName: 1 })
      .limit(limit)
      .sort({ _id: -1 });
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

  async downloadImage(imageUrl: string, localPath: string) {
    try {
      const response = await axios.get(imageUrl, { responseType: 'stream' });
      const fileNameSplit = imageUrl.split('/');
      if (!existsSync(localPath)) {
        mkdirSync(localPath, { recursive: true });
      }

      const fileStream = createWriteStream(localPath + fileNameSplit[fileNameSplit.length - 1]);
      response.data.pipe(fileStream);

      response.data.on('end', () => {
        fileStream.close();
        console.log(`Image downloaded successfully to ${localPath}`);
      });
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }

  async getFirstRegions() {
    let data = await this.cacheManager.get('region-first');
    if (data === undefined) {
      data = await this.prisma.region.findMany({
        select: {
          orgCd: true,
          orgdownNm: true,
        },
        where: {
          uprCd: null,
        },
      });

      await this.cacheManager.set('region-first', data, 0);
    }

    return data;
  }
}
