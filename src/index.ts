import express from "express";
import authRoutes from "./presentation/routes/userRoutes";
import documentRoutes from "./presentation/routes/documentRoutes";
import tagRoutes from "./presentation/routes/tagRoutes";
import downloadRoutes from "./presentation/routes/downloadRoutes";
import searchRoute from "./presentation/routes/searchRoute";
import permissionRoutes from "./presentation/routes/permissionRoutes";

export const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/search", searchRoute);
app.use("/api/permissions", permissionRoutes);

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
