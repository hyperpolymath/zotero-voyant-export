const { Ci, Cu } = require("chrome");
Cu.import("resource://gre/modules/FileUtils.jsm");

const zotero = require('./zotero');
const ui = require('./ui');
const utils = require('./utils');
const format = require('./format');
const { all, resolve } = require('sdk/core/promise');

// Constants
const BAGIT_FILENAME = "bagit.txt";
const DATA_DIR_NAME = "data";
const MODS_FILENAME = "MODS.bin";
const DC_FILENAME = "DC.xml";
const CWRC_FILENAME = "CWRC.bin";
const TEMP_DIR_PREFIX = "collection";

/**
 * Create a directory inside another directory
 *
 * @param {nsIFile} startDir - Parent directory
 * @param {string} dirName - Name of directory to create
 * @returns {nsIFile} The created directory
 * @throws {Error} If directory creation fails
 */
const mkdir = (startDir, dirName) => {
  if (!startDir) {
    throw new Error("startDir is required");
  }
  if (!dirName || typeof dirName !== 'string') {
    throw new Error("dirName must be a non-empty string");
  }

  try {
    const newDir = startDir.clone();
    newDir.append(dirName);
    newDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0o755);
    return newDir;
  } catch (error) {
    throw new Error(`Failed to create directory '${dirName}': ${error.message}`);
  }
};

/**
 * Create a file reference inside a directory
 *
 * @param {nsIFile} startDir - Parent directory
 * @param {string} fileName - Name of file
 * @returns {nsIFile} File reference
 * @throws {Error} If parameters are invalid
 */
const fileInDir = (startDir, fileName) => {
  if (!startDir) {
    throw new Error("startDir is required");
  }
  if (!fileName || typeof fileName !== 'string') {
    throw new Error("fileName must be a non-empty string");
  }

  const newFile = startDir.clone();
  newFile.append(fileName);
  return newFile;
};

/**
 * Create a unique temporary directory
 *
 * @returns {nsIFile} The created temporary directory
 * @throws {Error} If temporary directory creation fails
 */
const mkTmpDir = () => {
  try {
    const tmpDir = FileUtils.getFile("TmpD", [TEMP_DIR_PREFIX]);
    tmpDir.createUnique(Ci.nsIFile.DIRECTORY_TYPE, 0o755);
    return tmpDir;
  } catch (error) {
    throw new Error(`Failed to create temporary directory: ${error.message}`);
  }
};

/**
 * Create a function that saves a single item to the export directory
 *
 * @param {Logger} logger - Logger instance
 * @param {nsIFile} dataDir - Data directory for export
 * @param {Object} Zotero - Zotero global object
 * @returns {Function} Function that processes and saves an item
 */
const itemSaver = (logger, dataDir, Zotero) => {
  if (!logger) {
    throw new Error("logger is required");
  }
  if (!dataDir) {
    throw new Error("dataDir is required");
  }
  if (!Zotero) {
    throw new Error("Zotero object is required");
  }

  return (item) => {
    if (!item) {
      logger.warn("Skipping null/undefined item");
      return resolve(null);
    }

    const itemID = item.id;

    return item.getBestAttachment()
      .then((att) => {
        if (!att) {
          logger.warn(`Item ${itemID}: No attachment found, skipping`);
          return resolve(null);
        }
        return att.getFilePathAsync();
      })
      .then((attPath) => {
        if (!attPath) {
          logger.warn(`Item ${itemID}: Attachment has no file path, skipping`);
          return;
        }

        try {
          const attFile = Zotero.File.pathToFile(attPath);

          if (!attFile || !attFile.exists()) {
            logger.warn(`Item ${itemID}: Attachment file does not exist at ${attPath}`);
            return;
          }

          logger.info(`Saving item ${itemID}: ${item.getDisplayTitle()}`);

          // Create item output directory
          const itemOutDir = mkdir(dataDir, itemID.toString());

          // Generate metadata
          let mods, dc;
          try {
            mods = format.generateMODS(item);
            dc = format.generateDC(item);
          } catch (error) {
            logger.error(`Item ${itemID}: Metadata generation failed: ${error.message}`);
            throw error;
          }

          // Save metadata files
          const modsFile = fileInDir(itemOutDir, MODS_FILENAME);
          const dcFile = fileInDir(itemOutDir, DC_FILENAME);

          try {
            Zotero.File.putContents(modsFile, mods);
            Zotero.File.putContents(dcFile, dc);
          } catch (error) {
            logger.error(`Item ${itemID}: Failed to write metadata files: ${error.message}`);
            throw error;
          }

          // Copy attachment file
          try {
            attFile.copyTo(itemOutDir, CWRC_FILENAME);
            logger.info(`Item ${itemID}: Successfully exported`);
          } catch (error) {
            logger.error(`Item ${itemID}: Failed to copy attachment: ${error.message}`);
            throw error;
          }
        } catch (error) {
          logger.error(`Item ${itemID}: Export failed: ${error.message}`);
          // Continue processing other items even if this one fails
          return resolve(null);
        }
      })
      .catch((error) => {
        logger.error(`Item ${itemID}: Unexpected error during export: ${error.message}`);
        // Continue processing other items
        return resolve(null);
      });
  };
};

/**
 * Main export function - exports the selected collection to Voyant format
 * Creates a BagIt-compliant ZIP file with metadata and attachments
 *
 * @throws {Error} If export fails
 */
const doExport = () => {
  let logger = null;
  let outDir = null;

  try {
    // Get Zotero objects
    const Zotero = zotero.getZotero();
    const ZoteroPane = zotero.getZoteroPane();
    logger = new utils.Logger(Zotero);

    // Get selected collection
    const collection = ZoteroPane.getSelectedCollection();

    if (!collection) {
      throw new Error("No collection selected");
    }

    const name = collection.name;
    const items = collection.getChildItems();

    if (!items || items.length === 0) {
      logger.warn("Collection is empty, nothing to export");
      // TODO: Show user-friendly alert
      return;
    }

    logger.info(`Starting export: collection "${name}", ${items.length} items`);

    // Show file picker
    const outFile = ui.showFilePicker(name);

    if (!outFile) {
      logger.info("Export cancelled by user");
      return;
    }

    logger.info(`Export destination: ${outFile.path}`);

    // Create temporary directory structure
    try {
      outDir = mkTmpDir();
      logger.info(`Temporary directory: ${outDir.path}`);
    } catch (error) {
      throw new Error(`Failed to create temporary directory: ${error.message}`);
    }

    // Create BagIt marker file
    try {
      const bagitFile = fileInDir(outDir, BAGIT_FILENAME);
      // BagIt specification requires version and encoding
      const bagitContent = "BagIt-Version: 0.97\nTag-File-Character-Encoding: UTF-8";
      Zotero.File.putContents(bagitFile, bagitContent);
    } catch (error) {
      throw new Error(`Failed to create BagIt marker file: ${error.message}`);
    }

    // Create data directory
    let dataDir;
    try {
      dataDir = mkdir(outDir, DATA_DIR_NAME);
    } catch (error) {
      throw new Error(`Failed to create data directory: ${error.message}`);
    }

    // Export all items
    logger.info("Processing items...");
    const itemProcessor = itemSaver(logger, dataDir, Zotero);

    all(items.map(itemProcessor))
      .then(() => {
        logger.info("All items processed, creating ZIP archive...");
        return Zotero.File.zipDirectory(outDir.path, outFile.path);
      })
      .then(() => {
        logger.info(`Export completed successfully: ${outFile.path}`);
        // TODO: Show user-friendly success notification
      })
      .catch((error) => {
        logger.error(`Export failed: ${error.message}`);
        // TODO: Show user-friendly error notification
        throw error;
      });

  } catch (error) {
    if (logger) {
      logger.error(`Export initialization failed: ${error.message}`);
    } else {
      console.error(`Export initialization failed: ${error.message}`);
    }
    // TODO: Show user-friendly error alert
    throw error;
  }
};

exports.doExport = doExport;
