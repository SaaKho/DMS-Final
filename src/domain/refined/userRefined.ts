import { createEnumType } from "@carbonteq/hexapp";

export const UserRole = createEnumType("UserRole", ["User", "Admin"]);

export type UserRole = typeof UserRole.$infer;
