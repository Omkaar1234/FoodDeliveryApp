import fs from "fs";
import https from "https";

/**
 * Downloads a file from a URL if it doesn't exist locally
 * @param {string} url - Direct download URL of the file
 * @param {string} destPath - Local path to save the file
 */
export function downloadModel(url, destPath) {
  return new Promise((resolve, reject) => {
    // If file already exists, skip download
    if (fs.existsSync(destPath)) return resolve();

    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Download failed: ${response.statusCode}`));
      }

      response.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
        console.log("✅ Model downloaded successfully!");
      });
    }).on("error", (err) => {
      fs.unlinkSync(destPath); // Remove partially downloaded file
      reject(err);
    });
  });
}
