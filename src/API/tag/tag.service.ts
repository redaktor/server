import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import TagEntity, { TagsRO } from './tag.entity';

@Injectable()
export default class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>
  ) {}

  async findAll(): Promise<TagsRO> {
    const tags = await this.tagRepository.find();
    return {tags}
  }

}
