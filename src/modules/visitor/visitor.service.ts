import { Injectable } from '@nestjs/common';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';

@Injectable()
export class VisitorService {
  create(createVisitorDto: CreateVisitorDto) {
    return `This action adds a new visitor: ${JSON.stringify(createVisitorDto)}`;
  }

  findAll() {
    return `This action returns all visitor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} visitor`;
  }

  update(id: number, updateVisitorDto: UpdateVisitorDto) {
    return `This action updates a #${id} visitor: ${JSON.stringify(updateVisitorDto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} visitor`;
  }
}
