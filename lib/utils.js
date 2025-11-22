"use strict";

const { Cu } = require("chrome");
Cu.import("resource://gre/modules/Services.jsm");

const wm = Services.wm;

/**
 * Logger class for debugging and error reporting
 * Outputs to both console and Zotero debug log
 */
class Logger {
  /**
   * Create a new Logger instance
   * @param {Object} Zotero - Zotero global object
   */
  constructor(Zotero) {
    this.Zotero = Zotero;
  }

  /**
   * Log informational message
   * @param {string} msg - Message to log
   */
  info(msg) {
    console.log(msg);
    if (this.Zotero) {
      this.Zotero.debug(msg);
    }
  }

  /**
   * Log error message
   * @param {string} msg - Error message to log
   */
  error(msg) {
    console.error(msg);
    if (this.Zotero) {
      this.Zotero.debug(msg);
    }
  }

  /**
   * Log warning message
   * @param {string} msg - Warning message to log
   */
  warn(msg) {
    console.warn(msg);
    if (this.Zotero) {
      this.Zotero.debug(`WARNING: ${msg}`);
    }
  }
}

/**
 * Get the most recent window
 * @returns {Window} The most recent browser window
 */
const getWindow = () => wm.getMostRecentWindow(null);

exports.getWindow = getWindow;
exports.Logger = Logger;
