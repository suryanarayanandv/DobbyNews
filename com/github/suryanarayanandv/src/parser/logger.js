/**
 * Logger module.
 * This module provides a simple logging utility that can be used throughout the application.
 * It supports different log levels and can be easily extended or modified.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, "app.log");
/**
 * Logs a message to the console and to a file.
 * @param {string} message - The message to log.
 * @param {string} level - The log level (e.g., 'info', 'error', 'warn').
 */
const log = (message, level = "info") => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

  // Log to console
  

  // Log to file
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      
    }
  });
};

/**
 * Clears the log file.
 */
const clearLog = () => {
  fs.writeFile(logFilePath, "", (err) => {
    if (err) {
      
    } else {
      
    }
  });
};

/**
 * Reads the log file and returns its content.
 * @returns {Promise<string>} - The content of the log file.
 */
const readLog = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(logFilePath, "utf8", (err, data) => {
      if (err) {
        reject("Error reading log file: " + err);
      } else {
        resolve(data);
      }
    });
  });
}

export { log, clearLog as clear_logs, readLog as read_logs };