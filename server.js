/**
 * Twitter Downloader
 */

import express from "express";
import path from "path";
import helmet from "helmet";
import { fileURLToPath } from "url";
import apiRoutes from "./routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3000;

/**
 * Security Middleware
 * contentSecurityPolicy is disabled here to allow the inline CDN scripts
 * used in the frontend (Tailwind).
 */
app.use(helmet({
  contentSecurityPolicy: false,
}));

/**
 * Body Parsing Middleware
 */
app.use(express.json());

/**
 * Static File Serving
 */
app.use(express.static(path.join(__dirname, "public")));

/**
 * API Routes
 */
app.use("/api", apiRoutes);

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  const statusCode = err.message.includes("Invalid") || err.message.includes("Missing")
    ? 400
    : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Woot
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
