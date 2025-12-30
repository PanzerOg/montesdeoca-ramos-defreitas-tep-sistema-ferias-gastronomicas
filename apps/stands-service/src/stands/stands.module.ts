import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StandsService } from './stands.service';
import { StandsController } from './stands.controller';
import { Stand } from './entities/stand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stand])],
  controllers: [StandsController],
  providers: [StandsService],
})
export class StandsModule {}
