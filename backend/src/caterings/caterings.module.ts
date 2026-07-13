import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Catering, CateringSchema } from './schemas/catering.schema';
import { CateringsController } from './caterings.controller';
import { CateringsService } from './caterings.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Catering.name, schema: CateringSchema }]),
  ],
  controllers: [CateringsController],
  providers: [CateringsService],
  exports: [CateringsService],
})
export class CateringsModule {}
