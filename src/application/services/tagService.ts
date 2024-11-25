// services/TagService.ts
import { ITagRepository } from "../../domain/interfaces/ITagRepository";
import { Logger } from "../../infrastructure/logging/logger";
import { SerializeTag, Tag } from "../../domain/entities/Tag";
import { TagFactory } from "../../domain/factories/TagFactory";
import { Injectable } from "../../lib/di/injectable";
import { Inject } from "../../lib/di/inject";
import { CreateTagDTO, UpdateTagDTO } from "../DTOs/request/tagDto";
import {
  AppResult,
  Paginated,
  PaginationOptions,
  toSerialized,
} from "@carbonteq/hexapp";
import { SuccessInterface } from "./userService";
import { Result } from "@carbonteq/fp";
import { PaginationDTO } from "../DTOs/request/paginationdto";
import { UUIDDTO } from "../DTOs/request/commonDTO";

@Injectable()
export class TagService {
  constructor(
    @Inject("ITagRepository") private tagRepository: ITagRepository,
    @Inject("Logger") private logger: Logger
  ) {}
  async createTag(dto: CreateTagDTO): Promise<AppResult<SerializeTag>> {
    this.logger.log(`Creating tag with name: ${dto.data.name}`);

    const tag = TagFactory.create({
      ...dto.data,
    });

    const tagResult = await this.tagRepository.insert(tag);

    const view = tagResult.map(toSerialized);

    return AppResult.fromResult(view);
  }

  async updateTag(dto: UpdateTagDTO): Promise<AppResult<SerializeTag>> {
    this.logger.log(`Updating tag with id: ${dto.data.id}`);

    // Fetch the tag by ID
    const tagResult = await this.tagRepository.fetchById(dto.data.id);

    //update the Tag
    const updatedTag = tagResult.flatMap((tag) => {
      const updatetag = tag.update(dto.data);
      return updatetag;
    });
    const view = updatedTag.map(toSerialized);
    return AppResult.fromResult(view);
  }

  async getPaginatedTags({
    pageNum,
    pageSize,
  }: PaginationDTO): Promise<AppResult<Paginated<SerializeTag>>> {
    const opts = PaginationOptions.create({ pageNum, pageSize }).unwrap();
    const tagResult = await this.tagRepository.fetchAllWithPagination(opts);
    const data = tagResult.map((paginatedDocument) => paginatedDocument.data);
    const view = Result.sequence(data, tagResult).map(([data, pagination]) => {
      return {
        ...pagination,
        data: data.map(toSerialized),
      };
    });
    return AppResult.fromResult(view);
  }
  async deleteTag(dto: UUIDDTO): Promise<AppResult<SuccessInterface>> {
    this.logger.log(`Deleting tag with id: ${dto.data.id}`);

    const tagResult = await this.tagRepository.fetchById(dto.data.id);

    const deletedTag = await tagResult.flatMap(async (tag) => {
      const deleted = await this.tagRepository.remove(tag.id);
      return deleted;
    });
    const view = deletedTag.map(() => {
      return { success: true, message: "Tag deleted successfully" };
    });
    return AppResult.fromResult(view);
  }
}
