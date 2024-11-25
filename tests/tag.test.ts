import { expect } from "chai";
import { Tag } from "../src/domain/entities/Tag";
import { TagNameUpdateError } from "../src/domain/errors/tagErrors";
import { InvalidDocumentUUID } from "../src/domain/errors/documentErrors";

describe("Tag Entity", () => {
  const validTagData = {
    name: "Sample Tag",
    documentId: "123e4567-e89b-12d3-a456-426614174000", // Valid UUID
  };

  describe("Construction", () => {
    it("should create a valid Tag entity", () => {
      const tag = new Tag(validTagData);
      expect(tag.name).to.equal("Sample Tag");
      expect(tag.documentId.isSome()).to.be.true;
      expect(tag.documentId.safeUnwrap()).to.equal(
        "123e4567-e89b-12d3-a456-426614174000"
      );
    });

    it("should create a Tag entity without a documentId", () => {
      const dataWithoutDocumentId = { ...validTagData, documentId: null };
      const tag = new Tag(dataWithoutDocumentId);
      expect(tag.name).to.equal("Sample Tag");
      expect(tag.documentId.isNone()).to.be.true;
    });
  });

  describe("Serialization", () => {
    it("should serialize a Tag entity correctly", () => {
      const tag = new Tag(validTagData);
      const serialized = tag.serialize();
      expect(serialized).to.have.property("name", "Sample Tag");
      expect(serialized).to.have.property(
        "documentId",
        "123e4567-e89b-12d3-a456-426614174000"
      );
    });

    it("should create a Tag entity from serialized data", () => {
      const serialized = {
        name: "Serialized Tag",
        documentId: "123e4567-e89b-12d3-a456-426614174000",
        id: "123e4567-e89b-12d3-a456-426614174111", // Simulated ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const tag = Tag.fromSerialize(serialized);
      expect(tag.name).to.equal("Serialized Tag");
      expect(tag.documentId.isSome()).to.be.true;
      expect(tag.documentId.safeUnwrap()).to.equal(
        "123e4567-e89b-12d3-a456-426614174000"
      );
    });
  });

  describe("Validation Guards", () => {
    it("should return an error if tag name is empty", () => {
      const invalidData = { ...validTagData, name: "" };
      const tag = new Tag(invalidData);
      const result = tag.guardAgainstInvalidTagName();
      expect(result.isErr()).to.be.true;
      expect(result.unwrapErr()).to.be.instanceOf(TagNameUpdateError);
    });

    it("should return an error if documentId is invalid", () => {
      const invalidData = { ...validTagData, documentId: "invalid-uuid" };
      const tag = new Tag(invalidData);
      const result = tag.guardAgainstInvalidDocumentId();
      expect(result.isErr()).to.be.true;
      expect(result.unwrapErr()).to.be.instanceOf(InvalidDocumentUUID);
    });

    it("should pass validation if documentId is null", () => {
      const dataWithoutDocumentId = { ...validTagData, documentId: null };
      const tag = new Tag(dataWithoutDocumentId);
      const result = tag.guardAgainstInvalidDocumentId();
      expect(result.isOk()).to.be.true;
    });
  });

  describe("Update Functionality", () => {
    it("should update a Tag entity with valid data", () => {
      const tag = new Tag(validTagData);
      const updatedData = { name: "Updated Tag" };
      const updatedResult = tag.update(updatedData);

      expect(updatedResult.isOk()).to.be.true;

      const updatedTag = updatedResult.unwrap();
      expect(updatedTag.name).to.equal("Updated Tag");
      expect(updatedTag.documentId.isSome()).to.be.true;
      expect(updatedTag.documentId.safeUnwrap()).to.equal(
        "123e4567-e89b-12d3-a456-426614174000"
      );
    });
  });
});
