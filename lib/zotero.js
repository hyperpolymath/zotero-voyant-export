"use strict";

const utils = require("./utils");

let Zotero = null;
let logger = null;

/**
 * Get the Zotero global object
 * Implements lazy initialization and caching
 *
 * @returns {Object|null} Zotero global object or null if not available
 */
const getZotero = () => {
  if (Zotero) {
    return Zotero;
  }

  try {
    const window = utils.getWindow();
    if (!window) {
      console.warn("Could not get window object");
      return null;
    }

    Zotero = window.Zotero;

    if (Zotero && !logger) {
      logger = new utils.Logger(Zotero);
      logger.info("Zotero object initialized successfully");
    }

    return Zotero;
  } catch (error) {
    console.error(`Failed to get Zotero object: ${error.message}`);
    return null;
  }
};

/**
 * Get the active ZoteroPane (main Zotero window)
 * Ensures the pane is loaded and visible
 *
 * @returns {Object|null} ZoteroPane object or null if not available
 * @throws {Error} If ZoteroPane is undefined or cannot be shown
 */
const getZoteroPane = () => {
  const Zotero = getZotero();

  if (!Zotero) {
    const error = new Error("Zotero object is not available");
    console.error(error.message);
    throw error;
  }

  let ZoteroPane = null;

  try {
    ZoteroPane = Zotero.getActiveZoteroPane();
  } catch (error) {
    const wrappedError = new Error(`Failed to get active Zotero pane: ${error.message}`);
    console.error(wrappedError.message);
    throw wrappedError;
  }

  if (!ZoteroPane) {
    const error = new Error("ZoteroPane is undefined - no active Zotero window found");
    console.error(error.message);
    throw error;
  }

  // Ensure the pane is loaded
  if (!ZoteroPane.loaded) {
    if (logger) {
      logger.warn("ZoteroPane not loaded, attempting to show it");
    }

    try {
      ZoteroPane.show();

      // Verify it loaded successfully
      if (!ZoteroPane.loaded) {
        throw new Error("ZoteroPane.show() completed but pane is still not loaded");
      }

      if (logger) {
        logger.info("ZoteroPane loaded successfully");
      }
    } catch (error) {
      const wrappedError = new Error(`ZoteroPane could not be shown: ${error.message}`);
      console.error(wrappedError.message);
      throw wrappedError;
    }
  }

  return ZoteroPane;
};

exports.getZotero = getZotero;
exports.getZoteroPane = getZoteroPane;
