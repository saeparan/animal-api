import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';

export type Animals = Animal[];
export interface Animal {
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
export class BatchService {
  private readonly logger = new Logger(BatchService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) {}

  async create() {
    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          'https://apis.data.go.kr/1543061/abandonmentPublicSrvc/abandonmentPublic?serviceKey=okitWTxaNH50jvdtAqdoq1B77k%2FOm75PvYlVf80ZzGuDty5c8bWic5HJuO%2BTC7MOeXoE%2BVP5Q%2FvBnUzXjHB7ww%3D%3D&bgnde=20210101&endde=20210101&pageNo=1&numOfRows=1&_type=json',
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    const animals: Animals = data.response?.body?.items.item;

    for (const animal of animals) {
      const regex = /([\d.]+)/;
      const matchAge = animal.age.match(regex);
      const age = parseFloat(matchAge[0]);

      await this.prismaService.animals.create({
        data: {
          desertionNo: parseInt(animal.desertionNo),
          noticeNo: animal.noticeNo,
          age,
        },
      });
    }
  }
}
