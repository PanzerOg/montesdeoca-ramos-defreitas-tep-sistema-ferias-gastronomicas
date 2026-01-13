import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStandDto } from './dto/create-stand.dto';
import { UpdateStandDto } from './dto/update-stand.dto';
import { Stand } from './entities/stand.entity';
import { StandStatus } from './entities/stand.entity';

@Injectable()
export class StandsService {
  constructor(
    @InjectRepository(Stand)
    private readonly standRepository: Repository<Stand>,
  ) {}

  async create(createStandDto: CreateStandDto, user: { userId: string }) {
    try {
      const newStand = this.standRepository.create({
        ...createStandDto,
        entrepreneurId: user.userId,
      });

      return await this.standRepository.save(newStand);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al crear el puesto');
    }
  }

  findAll() {
    return this.standRepository.find();
  }

  findOne(id: string) {
    return this.standRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateStandDto: UpdateStandDto,
    user: { userId: string },
  ) {
    const stand = await this.findOne(id);

    if (!stand) {
      throw new NotFoundException('El puesto no existe');
    }

    if (stand.entrepreneurId !== user.userId) {
      throw new ForbiddenException(
        'No tienes permiso para editar este puesto (No eres el dueño)',
      );
    }

    const { status, ...restData } = updateStandDto;

    this.standRepository.merge(stand, restData);

    if (status) {
       stand.status = status as any; 
    }
    return await this.standRepository.save(stand);
  }

  async remove(id: string) {
    const result = await this.standRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Stand with ID "${id}" not found`);
    }
    return { deleted: true };
  }

  async approveStand(id: string) {
    const stand = await this.findOne(id);
    if (!stand) throw new NotFoundException('Puesto no encontrado');

    stand.status = StandStatus.APPROVED;
    return await this.standRepository.save(stand);
  }

  async toggleActivation(id: string, user: { userId: string }) {
    const stand = await this.findOne(id);
    if (!stand) throw new NotFoundException('Puesto no encontrado');

    if (stand.entrepreneurId !== user.userId) {
      throw new ForbiddenException('No eres el dueño de este puesto');
    }

    if (stand.status === StandStatus.PENDING) {
      throw new ForbiddenException(
        'El puesto aún no ha sido aprobado por el organizador',
      );
    }

    // Si está Aprobado -> Pasa a Activo
    if (stand.status === StandStatus.APPROVED) {
      stand.status = StandStatus.ACTIVE;
    } else if (stand.status === StandStatus.ACTIVE) {
      stand.status = StandStatus.APPROVED;
    }

    return await this.standRepository.save(stand);
  }
}
