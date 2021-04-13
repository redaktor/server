import { Get, Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiProduces/*, ApiUseTags*/ } from '@nestjs/swagger';
import { TagsRO } from './tag.entity';
import TagService from './tag.service';

@ApiBearerAuth()
@ApiProduces('application/json')
//@ApiUseTags('tags')
@Controller('tags')
export default class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async findAll(): Promise<TagsRO> {
    return await this.tagService.findAll();
  }

}
