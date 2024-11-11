import express from "express";
import authRoutes from "./routes/users/userRoutes";
import documentRoutes from "./routes/document/documentRoutes";
import tagRoutes from "./routes/document/tagRoutes";
import downloadRoutes from "./routes/document/downloadRoutes";
import searchRoute from "./routes/document/searchRoute";
import permissionRoutes from "./routes/document/permissionRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/search", searchRoute);
app.use("/api/permissions", permissionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
