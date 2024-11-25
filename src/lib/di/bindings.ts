import { Container } from "./container";
import { UserService } from "../application/services/userService";
import { UserRepository } from "../infrastructure/repositories/userRepository";
import { ConsoleLogger } from "../infrastructure/logging/console.logger";
import { DocumentService } from "../application/services/documentService";
import { DocumentRepository } from "../infrastructure/repositories/documentRepository";
import { TagRepository } from "../infrastructure/repositories/tagRepository";
import { PermissionsRepository } from "../infrastructure/repositories/permissionRepository";
import { DownloadService } from "../application/services/downloadService";
import { TagService } from "../application/services/tagService";
import { PermissionsService } from "../domain/services/permissionService";

const container = new Container();

// Bind interfaces and implementations
container.bind("IUserRepository", UserRepository);
container.bind("Logger", ConsoleLogger);
container.bind("UserService", UserService);


container.bind("PermissionService", PermissionsService);
container.bind("IDocumentRepository", DocumentRepository);
container.bind("ITagRepository", TagRepository);
container.bind("IPermissionsRepository", PermissionsRepository);
container.bind("Logger", ConsoleLogger);

// Bind services
container.bind("DocumentService", DocumentService);

// Bind services
container.bind("DownloadService", DownloadService);
container.bind("TagService", TagService);

export default container;
