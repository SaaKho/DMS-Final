import { expect } from "chai";
import { Document } from "../src/domain/entities/Document";
import {
  DocumentDoesNotHaveFilename,
  DocumentDoesNotHaveFileExtension,
  DocumentDoesNotHaveFilePath,
} from "../src/domain/errors/documentErrors";

describe("Document Entity", () => {
  const validDocumentData = {
    fileName: "testFile",
    fileExtension: "txt",
    filePath: "/path/to/testFile.txt",
    userId: "12345",
  };

  describe("Construction", () => {
    it("should create a valid Document entity", () => {
      const document = new Document(validDocumentData);
      expect(document.fileName).to.equal("testFile");
      expect(document.fileExtension).to.equal("txt");
      expect(document.filePath).to.equal("/path/to/testFile.txt");
      expect(document.userId).to.equal("12345");
    });
  });

  describe("Serialization", () => {
    it("should serialize a Document entity correctly", () => {
      const document = new Document(validDocumentData);
      const serialized = document.serialize();
      expect(serialized).to.have.property("fileName", "testFile");
      expect(serialized).to.have.property("fileExtension", "txt");
      expect(serialized).to.have.property("filePath", "/path/to/testFile.txt");
      expect(serialized).to.have.property("userId", "12345");
    });

    it("should create a Document entity from serialized data", () => {
      const serialized = {
        ...validDocumentData,
        id: "67890", // Simulated ID from base entity
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const document = Document.fromSerialize(serialized);
      expect(document.fileName).to.equal("testFile");
      expect(document.fileExtension).to.equal("txt");
      expect(document.filePath).to.equal("/path/to/testFile.txt");
      expect(document.userId).to.equal("12345");
    });
  });

  describe("Validation Guards", () => {
    it("should return an error if fileName is empty", () => {
      const invalidData = { ...validDocumentData, fileName: "" };
      const document = new Document(invalidData);
      const result = document.guardAgainstInvalidFileName();
      expect(result.isErr()).to.be.true;
      expect(result.unwrapErr()).to.be.instanceOf(DocumentDoesNotHaveFilename);
    });

    it("should return an error if filePath is empty", () => {
      const invalidData = { ...validDocumentData, filePath: "" };
      const document = new Document(invalidData);
      const result = document.guardAgainstInvalidFilePath();
      expect(result.isErr()).to.be.true;
      expect(result.unwrapErr()).to.be.instanceOf(DocumentDoesNotHaveFilePath);
    });
  });

  describe("Update Functionality", () => {
    it("should update a Document entity with valid data", () => {
      const document = new Document(validDocumentData);
      const updatedData = { fileName: "updatedFile" };
      const updatedResult = document.update(updatedData);

      expect(updatedResult.isOk()).to.be.true;

      const updatedDocument = updatedResult.unwrap();
      expect(updatedDocument.fileName).to.equal("updatedFile");
      expect(updatedDocument.filePath).to.equal("/path/to/testFile.txt");
    });
  });
});
