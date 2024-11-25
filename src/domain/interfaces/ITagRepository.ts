import {
  BaseRepository,
  Paginated,
  PaginationOptions,
  RepositoryResult,
} from "@carbonteq/hexapp";
import { Tag } from "../entities/Tag";
import { TagNotFoundError, TagAlreadyExistsError } from "../errors/tagErrors";
import { Document } from "../entities/Document";

export interface ITagRepository extends BaseRepository<Tag> {
  // Fetch a tag by its ID
  fetchById(Id: string): Promise<RepositoryResult<Tag, TagNotFoundError>>;

  // Insert a new tag into the repository
  insert(tag: Tag): Promise<RepositoryResult<Tag, TagAlreadyExistsError>>;

  // Update an existing tag
  update(entity: Tag): Promise<RepositoryResult<Tag, TagNotFoundError>>;

  // Remove a tag from the repository
  remove(tagId: string): Promise<RepositoryResult<Tag, TagNotFoundError>>;

  // Fetch document IDs associated with given tags
  fetchTags(
    tagNames: string[]
  ): Promise<RepositoryResult<string[], TagNotFoundError>>;

  upsertTagsAndLinkToDocument(
    tagArray: Tag[]
  ): Promise<RepositoryResult<boolean, TagNotFoundError>>;

  fetchAllWithPagination(
    opts: PaginationOptions
  ): Promise<RepositoryResult<Paginated<Tag>, TagNotFoundError>>;
  fetchMatchingDocuments(
    tagNames: string[]
  ): Promise<RepositoryResult<Document[], TagNotFoundError>>;
}
