import { Request, Response } from "express";
import container from "../../lib/di/bindings";
import { TagService } from "../../application/services/tagService";
import {
  CreateTagDTO,
  UpdateTagDTO,
} from "../../application/DTOs/request/tagDto";
import { PaginationDTO } from "../../application/DTOs/request/paginationdto";
import { handleResponse } from "../../utils/handleResponse";
import { UUIDDTO } from "../../application/DTOs/request/commonDTO";

class TagController {
  private static tagService = container.resolve<TagService>("TagService");

  static async createTag(req: Request, res: Response) {
    const { name } = req.body;
    const createTagDTO = CreateTagDTO.create({ name }).unwrap();

    const result = await this.tagService.createTag(createTagDTO);
  }

  static async updateTag(req: Request, res: Response) {
    const { id } = req.params;
    const { name } = req.body;
    const updateTagDTO = UpdateTagDTO.create({ id, name }).unwrap();

    const result = await this.tagService.updateTag(updateTagDTO);
    handleResponse(result, res, 200);
  }

  static async deleteTag(req: Request, res: Response) {
    const { id } = req.params;
    const deleteTagDTO = UUIDDTO.create(id).unwrap();

    const result = await this.tagService.deleteTag(deleteTagDTO);
    handleResponse(result, res, 204);
  }

  static async getPaginatedTags(req: Request, res: Response): Promise<void> {
    const paginationDTO = PaginationDTO.create(req.query).unwrap();

    const result = await this.tagService.getPaginatedTags(paginationDTO);

    handleResponse(result, res, 200);
  }
}

export default TagController;
