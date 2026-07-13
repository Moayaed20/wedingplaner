import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Decoration, DecorationSchema } from './schemas/decoration.schema';
import { DecorationsController } from './decorations.controller';
import { DecorationsService } from './decorations.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Decoration.name, schema: DecorationSchema },
    ]),
  ],
  controllers: [DecorationsController],
  providers: [DecorationsService],
  exports: [DecorationsService],
})
export class DecorationsModule {}
