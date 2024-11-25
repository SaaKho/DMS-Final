import { expect } from "chai";
import { User } from "../src/domain/entities/User";
import { UserRole } from "../src/domain/refined/userRefined";
import {
  IncorrectUserNameOrPassword,
  UserInvalidUserRole,
} from "../src/domain/errors/userErrors";
import { EmailVO } from "../src/domain/valueObjects/Email";

describe("User Entity", () => {
  const validUserData = {
    username: "testUser",
    email: "test@example.com",
    password: "securepassword",
    role: UserRole.User, // Assuming UserRole has values like User and Admin
  };

  describe("Construction", () => {
    it("should create a valid User entity", () => {
      const user = new User(validUserData);
      expect(user.username).to.equal("testUser");
      expect(user.email.serialize()).to.equal("test@example.com");
      expect(user.password).to.equal("securepassword");
      expect(user.role).to.equal(UserRole.User);
    });
  });

  describe("Serialization", () => {
    it("should serialize a User entity correctly", () => {
      const user = new User(validUserData);
      const serialized = user.serialize();
      expect(serialized).to.have.property("username", "testUser");
      expect(serialized).to.have.property("email", "test@example.com");
      expect(serialized).to.have.property("password", "securepassword");
      expect(serialized).to.have.property("role", UserRole.User);
    });

    it("should create a User entity from serialized data", () => {
      const serialized = {
        ...validUserData,
        id: "12345", // Simulated ID from base entity
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const user = User.fromSerialize(serialized);
      expect(user.username).to.equal("testUser");
      expect(user.email.serialize()).to.equal("test@example.com");
      expect(user.password).to.equal("securepassword");
      expect(user.role).to.equal(UserRole.User);
    });
  });

  describe("Validation Guards", () => {
    it("should return an error if username is empty", () => {
      const invalidData = { ...validUserData, username: "" };
      const user = new User(invalidData);
      const result = user.guardAgainstInvalidUserName();
      expect(result.isErr()).to.be.true;
      expect(result.unwrapErr()).to.be.instanceOf(IncorrectUserNameOrPassword);
    });

    it("should return an error if role is invalid", () => {
      const invalidData = { ...validUserData, role: "InvalidRole" as UserRole };
      const user = new User(invalidData);
      const result = user.guardAgainstInvalidUserRole();
      expect(result.isErr()).to.be.true;
      expect(result.unwrapErr()).to.be.instanceOf(UserInvalidUserRole);
    });
  });
  
});
