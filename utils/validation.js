/**
 * Utility function for validating status urls
 */

const URL_REGEX = /https?:\/\/(?:(?:www|m(?:obile)?)\.)?(?:x|twitter)\.com\/(?:#!\/)?(\w+)\/status(es)?\/(?<id>\d+)/;

/**
 * Extracts the Tweet ID from a valid Twitter/X URL
 */
export const extractStatusId = (input) => {
  const match = input.match(URL_REGEX);
  if (match && match.groups && match.groups.id) {
    return match.groups.id;
  }
  // Fallback for raw numeric IDs.
  if (/^\d+$/.test(input)) {
    return input;
  }
  throw new Error("Invalid Twitter/X status URL or ID format.");
};
