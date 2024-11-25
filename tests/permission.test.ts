import { expect } from "chai";
import { Permission } from "../src/domain/entities/Permission";

describe("Permission Entity", () => {
  const validPermissionData = {
    documentId: "123e4567-e89b-12d3-a456-426614174000", // Valid UUID
    userId: "456e7890-e12d-34c5-a789-526614174111", // Valid UUID
    permissionType: "Read", // Example permission type
  };

  describe("Construction", () => {
    it("should create a valid Permission entity", () => {
      const permission = new Permission(validPermissionData);
      expect(permission.documentId).to.equal(
        "123e4567-e89b-12d3-a456-426614174000"
      );
      expect(permission.userId).to.equal(
        "456e7890-e12d-34c5-a789-526614174111"
      );
      expect(permission.permissionType).to.equal("Read");
    });
  });

  describe("Serialization", () => {
    it("should serialize a Permission entity correctly", () => {
      const permission = new Permission(validPermissionData);
      const serialized = permission.serialize();
      expect(serialized).to.have.property(
        "documentId",
        "123e4567-e89b-12d3-a456-426614174000"
      );
      expect(serialized).to.have.property(
        "userId",
        "456e7890-e12d-34c5-a789-526614174111"
      );
      expect(serialized).to.have.property("permissionType", "Read");
    });

    it("should create a Permission entity from serialized data", () => {
      const serialized = {
        documentId: "123e4567-e89b-12d3-a456-426614174000",
        userId: "456e7890-e12d-34c5-a789-526614174111",
        permissionType: "Write", // Example different permission type
        id: "789e0123-f34c-56d7-a890-636614174222", // Simulated ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const permission = Permission.fromSerialize(serialized);
      expect(permission.documentId).to.equal(
        "123e4567-e89b-12d3-a456-426614174000"
      );
      expect(permission.userId).to.equal(
        "456e7890-e12d-34c5-a789-526614174111"
      );
      expect(permission.permissionType).to.equal("Write");
    });
  });

  describe("Validation Guards", () => {
    it("should return an error if permissionType is empty", () => {
      const invalidData = { ...validPermissionData, permissionType: "" };
      const permission = new Permission(invalidData);
      const result = permission.guardAgainstInvalidPermissionType();
      expect(result.isErr()).to.be.true;
      expect(result.unwrapErr().message).to.equal("Invalid permissionType");
    });

    it("should pass validation if permissionType is valid", () => {
      const permission = new Permission(validPermissionData);
      const result = permission.guardAgainstInvalidPermissionType();
      expect(result.isOk()).to.be.true;
    });
  });

  describe("Update Functionality", () => {
    it("should update a Permission entity with valid data", () => {
      const permission = new Permission(validPermissionData);
      const updatedData = { permissionType: "Write" };
      const updatedResult = permission.update(updatedData);

      expect(updatedResult.isOk()).to.be.true;

      const updatedPermission = updatedResult.unwrap();
      expect(updatedPermission.permissionType).to.equal("Write");
      expect(updatedPermission.documentId).to.equal(
        "123e4567-e89b-12d3-a456-426614174000"
      );
      expect(updatedPermission.userId).to.equal(
        "456e7890-e12d-34c5-a789-526614174111"
      );
    });
  });
});
