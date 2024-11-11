import express from "express";
import TagController from "../../controller/tagController";

const router = express.Router();

// Route to get all tags
router.get("/getAllTags", TagController.getAllTags);

// Route to create a tag
router.post("/createTag", TagController.createTag);

// Route to update a tag
router.put("/update/:id", TagController.updateTag);

// Route to delete a tag
router.delete("/deleteTag/:id", TagController.deleteTag);

export default router;
