/**
 * Frontend for the Twitter Media Downloader.
 * Handles form submission, UI state management, and communication with the backend API.
 */

document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    form: document.getElementById("fetch-form"),
    input: document.getElementById("twitter-url"),
    btn: document.getElementById("fetch-button"),
    btnText: document.getElementById("button-text"),
    spinner: document.getElementById("spinner"),
    msgArea: document.getElementById("message-area"),
    resultArea: document.getElementById("result-area"),
    downloadLink: document.getElementById("download-link"),
  };

  /**
   * UI State Management Utilities.
   */
  const ui = {
    setLoading(isLoading) {
      elements.btn.disabled = isLoading;
      elements.input.disabled = isLoading;
      elements.btnText.textContent = isLoading ? "Fetching..." : "Generate Link";
      elements.spinner.classList.toggle("hidden", !isLoading);
    },

    /**
     * Displays an error message to the user.
     */
    showError(msg) {
      elements.msgArea.innerHTML = `<div class="mt-4 p-3 rounded-lg bg-red-100 text-red-700">${msg}</div>`;
    },

    /**
     * Resets the UI, clearing previous messages and hiding the result area.
     */
    reset() {
      elements.msgArea.innerHTML = "";
      elements.resultArea.classList.add("hidden");
    },

    /**
     * Displays the success state with the download button.
     */
    showSuccess(downloadUrl) {
      elements.downloadLink.href = downloadUrl;
      elements.resultArea.classList.remove("hidden");
      elements.input.value = "";
    },
  };

  /**
   * Form Submission Handler.
   * Intercepts the submit event, validates input, and initiates the API request.
   */
  elements.form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default page reload
    const url = elements.input.value.trim();

    // Basic client-side validation
    if (!url) return ui.showError("Please enter a valid URL.");

    ui.setLoading(true);
    ui.reset();

    try {
      // Request metadata from the backend
      // Encode the component to handle special characters in the URL correctly
      const response = await fetch(
        `/api/metadata?url=${encodeURIComponent(url)}`
      );
      const result = await response.json();

      // Check for API errors
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch media.");
      }

      // Update the UI with the proxy stream URL returned by the backend
      ui.showSuccess(result.data.downloadEndpoint);
    } catch (error) {
      ui.showError(error.message);
    } finally {
      ui.setLoading(false);
    }
  });

  /**
   * Download Button Handler.
   * Hides the result area shortly after the user clicks "Download" to keep the UI clean.
   */
  elements.downloadLink.addEventListener("click", () => {
    // Small delay ensures the download starts before the button disappears
    setTimeout(() => {
      elements.resultArea.classList.add("hidden");
    }, 1000);
  });
});
