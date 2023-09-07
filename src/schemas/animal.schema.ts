import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type AnimalDocument = HydratedDocument<Animal>;

@Schema()
export class Animal {
  @Prop({ unique: true })
  desertionNo: number;

  @Prop()
  noticeNo: string; 

  @Prop()
  happenDt: Date;

  @Prop()
  happenPlace: string;

  @Prop()
  kindCd: string;

  @Prop()
  kindCdDetail: string;

  @Prop()
  colorCd: string;

  @Prop()
  age: number;

  @Prop()
  weight: string;

  @Prop()
  noticeStartDate: Date;

  @Prop()
  noticeEndDate: Date;

  @Prop()
  fileName: string;

  @Prop()
  popFile: string;

  @Prop()
  processState: string;

  @Prop()
  processStateReason: string;

  @Prop()
  sex: string;

  @Prop()
  neuter: string;

  @Prop()
  specialText: string;

  @Prop()
  careName: string;

  @Prop()
  officeTel: string;

  @Prop()
  careTel: string;

  @Prop()
  careAddress: string;

  @Prop()
  orgNm: string[];

  @Prop()
  chargeNm: string;

  @Prop({ type: SchemaTypes.Date, default: Date.now })
  created_at: Date;

  @Prop({ type: SchemaTypes.Date, default: Date.now })
  updated_at: Date;
}

export const AnimalSchema = SchemaFactory.createForClass(Animal);
