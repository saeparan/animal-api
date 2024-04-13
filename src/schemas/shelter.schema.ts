import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type ShelterDocument = HydratedDocument<Shelter>;

@Schema()
export class Shelter {
  @Prop()
  careNm: string;
  @Prop()
  orgNm: string;
  @Prop()
  divisionNm: string;
  @Prop()
  saveTrgtAnimal: string;
  @Prop()
  careAddr: string;
  @Prop()
  jibunAddr: string;
  @Prop()
  lat: number;
  @Prop()
  lng: number;
  @Prop()
  dsignationDate: string;
  @Prop()
  weekOprStime: string;
  @Prop()
  weekOprEtime: string;
  @Prop()
  weekCellStime: string;
  @Prop()
  weekCellEtime: string;
  @Prop()
  weekendOprStime: string;
  @Prop()
  weekendOprEtime: string;
  @Prop()
  weekendCellStime: string;
  @Prop()
  weekendCellEtime: string;
  @Prop()
  closeDay: string;
  @Prop()
  vetPersonCnt: number;
  @Prop()
  specsPersonCnt: number;
  @Prop()
  medicalCnt: number;
  @Prop()
  breedCnt: number;
  @Prop()
  quarabtineCnt: number;
  @Prop()
  feedCnt: number;
  @Prop()
  transCarCnt: number;
  @Prop()
  careTel: string;
  @Prop()
  dataStdDt: string;
}

export const ShelterSchema = SchemaFactory.createForClass(Shelter);
