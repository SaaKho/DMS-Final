import { z } from "zod";

export class UpdateTagRequestDTO {
  id: string;
  name: string;

  private static schema = z.object({
    id: z.string().uuid("Invalid UUID format for Tag ID"),
    name: z
      .string()
      .min(1, "Tag name cannot be empty")
      .max(50, "Tag name cannot exceed 50 characters"),
  });

  constructor(id: string, name: string) {
    const validation = UpdateTagRequestDTO.schema.safeParse({ id, name });
    if (!validation.success) {
      throw new Error(
        `Invalid UpdateTagRequestDTO: ${validation.error.errors
          .map((err) => err.message)
          .join(", ")}`
      );
    }
    this.id = id;
    this.name = name;
  }
}
