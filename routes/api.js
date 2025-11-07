/**
 * API endpoints.
 */

import express from "express";
import axios from "axios";
import { getMediaMetadata } from "../services/twitterService.js";

const router = express.Router();

/**
 * Validates a Twitter URL, fetches metadata, and returns a proxy download link.
 */
router.get("/metadata", async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ success: false, message: "URL is required" });
    }

    const mediaData = await getMediaMetadata(url);

    // Encode the target URL safely to pass it back to the client.
    const safeUrl = Buffer.from(mediaData.url).toString('base64');
    const filename = `twitter-${mediaData.author}-${mediaData.id}`;

    res.json({
      success: true,
      data: {
        ...mediaData,
        // The frontend will point the download button to this endpoint
        downloadEndpoint: `/api/stream?target=${safeUrl}&filename=${filename}`
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Streams the file from the external CDN to the client.
 * This acts as a proxy to bypass CORS restrictions and enforce file downloads.
 */
router.get("/stream", async (req, res, next) => {
  try {
    const { target, filename } = req.query;

    if (!target) return res.status(400).send("Missing target.");

    // Decode the Base64 URL back to a standard string
    const mediaUrl = Buffer.from(target, 'base64').toString('utf-8');

    const response = await axios({
      method: "get",
      url: mediaUrl,
      responseType: "stream",
    });

    const extension = mediaUrl.split(".").pop().split("?")[0] || "mp4";
    const finalFilename = `${filename || 'media'}.${extension}`;

    // Set headers to force the browser to download the file
    res.setHeader("Content-Disposition", `attachment; filename="${finalFilename}"`);
    res.setHeader("Content-Type", response.headers["content-type"]);

    response.data.pipe(res);
  } catch (error) {
    next(error);
  }
});

export default router;
