/**
 * Handles communication with external Twitter/X APIs to retrieve media information.
 */

import axios from "axios";
import { extractStatusId } from "../utils/validation.js";

const API_URL = "https://api.fxtwitter.com/status/";

/**
 * Fetches media metadata for a specific Twitter/X status.
 */
export const getMediaMetadata = async (inputUrl) => {
  const statusId = extractStatusId(inputUrl);

  try {
    const response = await axios.get(`${API_URL}${statusId}`, {
      timeout: 10000,
      headers: { "User-Agent": "TwitterDownloader/1.0" }
    });

    const tweet = response.data?.tweet;
    const mediaList = tweet?.media?.all;

    if (!mediaList || mediaList.length === 0) {
      throw new Error("No downloadable media found for this tweet.");
    }

    // Prioritize video/gif over images if multiple exist.
    // If multiple videos exist, this grabs the first one.
    const bestMedia = mediaList.find(m => m.type === 'video' || m.type === 'gif') || mediaList[0];

    return {
      url: bestMedia.url,
      type: bestMedia.type,
      author: tweet.author.screen_name || "unknown",
      id: tweet.id
    };

  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error("Failed to communicate with media provider.");
    }
    throw error;
  }
};
