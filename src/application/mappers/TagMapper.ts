import { Tag } from "../../domain/entities/Tag";
import { GeneralTagResponseDTO } from "../DTOs/response/tagResponse";

export class TagResponseMapper {
  static toResponse(tag: Tag): GeneralTagResponseDTO {
    return new GeneralTagResponseDTO({
      id: tag.getId(),
      name: tag.getName(),
      createdAt: tag.getCreatedAt(),
      updatedAt: tag.getUpdatedAt(),
    });
  }

  static toResponseList(tags: Tag[]): GeneralTagResponseDTO[] {
    return tags.map((tag) => this.toResponse(tag));
  }
}
