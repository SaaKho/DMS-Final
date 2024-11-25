import {
  db,
  users,
  documents,
  tags,
  documentTags,
  permissions,
} from "./../schema";
import { faker } from "@faker-js/faker";

const seedDatabase = async () => {
  // Step 1: Seed Users
  const userData = Array.from({ length: 10 }).map(() => ({
    id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 8 }),
    role: "User",
    created_at: new Date(),
    updated_at: new Date(),
  }));

  await db.insert(users).values(userData);
  console.log("Seeded 10 users");

  // Step 2: Seed Tags
  const existingTags = await db.select().from(tags).execute();
  const existingTagNames = new Set(existingTags.map((tag) => tag.name));

  const newUniqueTagNames = new Set<string>();
  while (newUniqueTagNames.size < 20) {
    const tagName = faker.word.noun();
    if (!existingTagNames.has(tagName)) {
      newUniqueTagNames.add(tagName);
    }
  }

  const tagData = Array.from(newUniqueTagNames).map((tagName) => ({
    id: faker.string.uuid(),
    name: tagName,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.insert(tags).values(tagData);
  console.log("Seeded 20 unique tags");

  // Step 3: Seed Documents
  const documentData = Array.from({ length: 10 }).map(() => {
    const fullFileName = faker.system.fileName();
    const fileExtension = fullFileName.split(".").pop() || "";
    const fileName = fullFileName.replace(`.${fileExtension}`, "");

    return {
      id: faker.string.uuid(),
      fileName: fileName,
      fileExtension: fileExtension,
      filepath: `uploads/${fileName}.${fileExtension}`,
      userId: faker.helpers.arrayElement(userData).id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  await db.insert(documents).values(documentData);
  console.log("Seeded 10 documents");

  // Step 4: Seed Document-Tag Relationships
  const documentTagData = [];
  for (const doc of documentData) {
    const numTags = faker.number.int({ min: 1, max: 5 });
    const uniqueTagIds = new Set();
    while (uniqueTagIds.size < numTags) {
      uniqueTagIds.add(faker.helpers.arrayElement(tagData).id);
    }
    for (const tagId of uniqueTagIds) {
      documentTagData.push({
        documentId: doc.id,
        tagId: tagId as string,
      });
    }
  }

  await db.insert(documentTags).values(documentTagData);
  console.log("Seeded document-tag relationships");

  // Step 5: Seed Permissions for Document Owners
  const permissionsData = documentData.map((doc) => ({
    id: faker.string.uuid(),
    documentId: doc.id,
    userId: doc.userId,
    permissionType: "Owner",
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.insert(permissions).values(permissionsData);
  console.log("Seeded permissions for document owners");
};

// Run the seeder
seedDatabase()
  .then(() => console.log("Seeding complete"))
  .catch((error) => console.error("Seeding error", error));
