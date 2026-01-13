import { Injectable, BadRequestException, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { lastValueFrom } from 'rxjs';
import { In } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    
    @Inject('STANDS_SERVICE') private readonly standsClient: ClientProxy,
  ) {}

  async create(createProductDto: CreateProductDto, user: any) {
    const validation = await lastValueFrom(
      this.standsClient.send(
        { cmd: 'validate_stand_ownership' }, 
        { standId: createProductDto.standId, userId: user.userId }
      )
    );

    if (!validation.valid) {
      throw new ForbiddenException(validation.message); 
    }

    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(filters: FilterProductDto) {
    const { category, standId, minPrice, maxPrice, search } = filters;
    const where: any = { isActive: true };
    if (category) where.category = category;
    if (standId) where.standId = standId;
    
    if (minPrice && maxPrice) {
      where.price = Between(minPrice, maxPrice);
    } else if (minPrice) {
      where.price = MoreThanOrEqual(minPrice);
    } else if (maxPrice) {
      where.price = LessThanOrEqual(maxPrice);
    }

    if (search) {
      where.name = Like(`%${search}%`); 
    }

    return await this.productRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: string) {
    return this.productRepository.findOneBy({ id });
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: any) {
    const product = await this.findOne(id);
    if (!product) throw new NotFoundException('Producto no encontrado');

    const currentStandValidation = await lastValueFrom(
      this.standsClient.send(
        { cmd: 'validate_stand_ownership' },
        { standId: product.standId, userId: user.userId }
      )
    );

    if (!currentStandValidation.valid) {
      throw new ForbiddenException('No tienes permiso para editar productos de este puesto.');
    }

    if (updateProductDto.standId && updateProductDto.standId !== product.standId) {
      const newStandValidation = await lastValueFrom(
        this.standsClient.send(
          { cmd: 'validate_stand_ownership' },
          { standId: updateProductDto.standId, userId: user.userId }
        )
      );
      if (!newStandValidation.valid) {
        throw new ForbiddenException(newStandValidation.message);
      }
    }

    if (updateProductDto.stock !== undefined && updateProductDto.stock < 0) {
      throw new BadRequestException('El stock no puede ser negativo');
    }

    this.productRepository.merge(product, updateProductDto);
    return await this.productRepository.save(product);
  }
  
  async remove(id: string, user: any) {
    const product = await this.findOne(id);
    if (!product) throw new NotFoundException('Producto no encontrado');

    // Validar propiedad antes de borrar
    const validation = await lastValueFrom(
      this.standsClient.send(
        { cmd: 'validate_stand_ownership' },
        { standId: product.standId, userId: user.userId }
      )
    );

    if (!validation.valid) throw new ForbiddenException('No tienes permiso para eliminar este producto.');

    return this.productRepository.delete(id);
  }

  async validateAndReduceStock(id: string, quantity: number) {
    const product = await this.findOne(id);
    if (!product) throw new BadRequestException('Producto no encontrado');
    
    if (product.stock < quantity) {
      throw new BadRequestException(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`);
    }

    product.stock -= quantity;
    return await this.productRepository.save(product);
  }

  async validateStock(items: { productId: string; quantity: number }[]) {
    const productIds = items.map((i) => i.productId);
    const products = await this.productRepository.find({ where: { id: In(productIds) } });
    return items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      
      if (!product) {
        throw new RpcException(`Producto ${item.productId} no encontrado`);
      }
      if (!product.isActive) {
         throw new RpcException(`Producto ${product.name} no está disponible`);
      }
      if (product.stock < item.quantity) {
        throw new RpcException(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`);
      }

      return {
        productId: product.id,
        price: product.price,
        name: product.name,
        quantity: item.quantity,
      };
    });
  }

  async reduceStock(items: { productId: string; quantity: number }[]) {
    for (const item of items) {
      const product = await this.findOne(item.productId);
      if (product) {
        product.stock -= item.quantity;
        await this.productRepository.save(product);
      }
    }
    return { success: true };
  }
}