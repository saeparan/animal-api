import { Inject, Injectable, Logger } from '@nestjs/common';

import * as dayjs from 'dayjs';
import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
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
    private readonly prismaService: PrismaService,
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

  async getAnimals(query: any) {
    const { startDate, endDate, type, orgs } = query;
    const data = await this.prismaService.animals.findMany({
      where: {
        // kindCd: '고양이',
        processState: '보호중',
        // processStateReason: '입양',
        happenDt: {
          gte: dayjs(!startDate ? "" : startDate).toDate(),
          lte: dayjs(`${!endDate ? "" : endDate}T23:59:59`).toDate(),
        },
        // kindCd: type ? { $in: type?.replaceAll(' ', '').split(',') } : { $not: { $eq: '개' } },
        orgNm: orgs ? { in: orgs?.replaceAll(' ', '').split(',') } : {},
        // noticeEndDate: {
        //   $gte: dayjs('2024-03-10').toDate(),
        // },
      },
      orderBy: {
        noticeStartDate: 'asc',
      },
    });
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
      rows: await this.prismaService.animals.findMany({
        where: filter,
        skip: (query.page - 1) * 12,
        take: 12,
        orderBy: {
          id: 'desc',
        },
      }),
      page: Number(query.page),
    };
  }

  async getServiceAnimal(id: string) {
    return await this.prismaService.animals.findFirst({
      where: {
        id,
      },
    });
  }

  async getLatestAnimals(limit: number = 5) {
    return await this.prismaService.animals.findMany({
      where: {
        processState: '보호중',
      },
      select: {
        id: true,
        popFile: true,
        fileName: true,
      },
      orderBy: {
        id: 'desc',
      },
      take: limit,
    });
  }

  // async getShelters() {
  //   const rows = await this.prismaService..findMany();
  //   const data = rows.map((r) => {
  //     return {
  //       ...r.toObject(),
  //       id: r.id,
  //     };
  //   });

  //   return data;
  // }

  async getAnimal(id: string) {
    return await this.prismaService.animals.findFirst({
      where: {
        id,
      },
    });
  }
  

  async analyticsPeriod(period: string) {
    const killAnalytics = await this.prismaService.animals.groupBy({
      by: ['orgNm'],
      where: {
        AND: [
          {
            happenDt: {
              gte: dayjs(`${period}-01`).toDate(),
              lte: dayjs(`${period}-01`).endOf('month').toDate(),
            }
          },
          {
            processStateReason: {
              in: ['자연사', '안락사']
            }
          }
        ]
      },
      _count: {
        _all: true
      }
    });


    const adoptionAnalytics = await this.prismaService.animals.groupBy({
      by: ['orgNm'],
      where: {
        AND: [
          {
            happenDt: {
              gte: dayjs(`${period}-01`).toDate(),
              lte: dayjs(`${period}-01`).endOf('month').toDate(),
            }
          },
          {
            processStateReason: {
              in: ['입양']
            }
          }
        ]
      },
      _count: {
        _all: true
      }
    });

    const allAnalytics = await this.prismaService.animals.groupBy({
      by: ['orgNm'],
      where: {
        AND: [
          {
            happenDt: {
              gte: dayjs(`${period}-01`).toDate(),
              lte: dayjs(`${period}-01`).endOf('month').toDate(),
            }
          },
        ]
      },
      _count: {
        _all: true
      }
    });
    

    const processAnalytics = await this.prismaService.animals.groupBy({    
      by: ['processState', 'processStateReason'],
      where: {
        happenDt: {
          gte: dayjs(`${period}-01`).toDate(),
          lte: dayjs(`${period}-01`).endOf('month').toDate(),
        }
      },
      _count: {
        _all: true
      },
      orderBy: {
        processState: 'asc'
      }
    });

    return {
      processAnalytics,
      killAnalytics,
      adoptionAnalytics,
      allAnalytics
    }
    // const data = await this.prismaService.animals.findMany({
    //   where: {
    //     happenDt: {
    //       gte: dayjs().subtract(period, 'day').toDate(),
    //     },
    //   },
    // });
  }

  // async getDetailOrg(orgFirst: string) {
  //   return (await this.orgModel.find({ 'org.0': orgFirst }).sort({ 'org.1': 1 })).map((row) => {
  //     return { ...row, ...{ org: row.org.slice(1) } };
  //   });
  // }

  // async setHitAnimal(id: string) {
  //   return await this.prismaService.animals.update({
  //     where: {
  //       id,
  //     },
  //     data: {
  //       hit: { increment: 1 },
  //     },
  //   });
  // }

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

  // async getFirstRegions() {
  //   let data = await this.cacheManager.get('region-first');
  //   if (data === undefined) {
  //     data = await this.prisma.region.findMany({
  //       select: {
  //         orgCd: true,
  //         orgdownNm: true,
  //       },
  //       where: {
  //         uprCd: null,
  //       },
  //     });

  //     await this.cacheManager.set('region-first', data, 0);
  //   }

  //   return data;
  // }
}
