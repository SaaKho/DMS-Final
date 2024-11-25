import { Request, Response } from "express";
import { SearchService } from "../../application/services/searchService";
import { Injectable } from "../../lib/di/injectable";
import { Inject } from "../../lib/di/inject";
import { AdvancedSearchDTO } from "../../application/DTOs/request/documentdto";
import { handleResponse } from "../../utils/handleResponse";

@Injectable()
class SearchController {
  private static searchService: SearchService;
  constructor(
    @Inject("SearchService") private readonly searchService: SearchService
  ) {}
  static async searchDocuments(req: Request, res: Response) {
    const { tags } = req.query;
    const searchDTO = AdvancedSearchDTO.create({ searchQuery: tags }).unwrap();

    const result =  SearchController.searchService.searchDocumentsByTags(searchDTO);

    handleResponse(result, res);
  }
}

export default SearchController;
