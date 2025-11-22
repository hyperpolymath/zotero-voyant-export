const { Cc, Ci } = require("chrome");
const utils = require('./utils');
const zotero = require('./zotero');

const nsIFilePicker = Ci.nsIFilePicker;

// UI element IDs
const MENU_ITEM_ID = 'voyant-export';
const MENU_ID = "zotero-collectionmenu";
const MENU_LABEL = "Export Collection to Voyant...";

/**
 * Get the collection context menu element
 *
 * @returns {Element} The collection menu DOM element
 * @throws {Error} If ZoteroPane or menu cannot be found
 */
const getCollectionMenu = () => {
  try {
    const zoteroPane = zotero.getZoteroPane();

    if (!zoteroPane.document) {
      throw new Error("ZoteroPane document is not available");
    }

    const menu = zoteroPane.document.getElementById(MENU_ID);

    if (!menu) {
      throw new Error(`Collection menu element '${MENU_ID}' not found`);
    }

    return menu;
  } catch (error) {
    throw new Error(`Failed to get collection menu: ${error.message}`);
  }
};

/**
 * Insert the "Export Collection to Voyant..." menu item
 * into the collection context menu
 *
 * @param {Function} onclick - Click handler for the menu item
 * @throws {Error} If menu insertion fails
 */
const insertExportMenuItem = (onclick) => {
  if (typeof onclick !== 'function') {
    throw new Error("onclick parameter must be a function");
  }

  try {
    const menu = getCollectionMenu();

    // Check if menu item already exists
    if (menu.querySelector(`#${MENU_ITEM_ID}`)) {
      console.log("Export menu item already exists, skipping insertion");
      return;
    }

    const doc = menu.ownerDocument;
    const menuitem = doc.createElement("menuitem");

    menuitem.setAttribute('id', MENU_ITEM_ID);
    menuitem.setAttribute('label', MENU_LABEL);
    menuitem.onclick = onclick;

    menu.appendChild(menuitem);

    console.log("Export menu item inserted successfully");
  } catch (error) {
    throw new Error(`Failed to insert export menu item: ${error.message}`);
  }
};

/**
 * Remove the "Export Collection to Voyant..." menu item
 * from the collection context menu
 */
const removeExportMenuItem = () => {
  try {
    const menu = getCollectionMenu();
    const menuitem = menu.querySelector(`#${MENU_ITEM_ID}`);

    if (menuitem) {
      menuitem.parentNode.removeChild(menuitem);
      console.log("Export menu item removed successfully");
    } else {
      console.log("Export menu item not found, nothing to remove");
    }
  } catch (error) {
    console.error(`Failed to remove export menu item: ${error.message}`);
    // Don't throw - this is cleanup code that shouldn't break unload
  }
};

/**
 * Show a file picker dialog for selecting export location
 *
 * @param {string} name - Default filename (without extension)
 * @returns {nsIFile|null} Selected file or null if cancelled
 * @throws {Error} If file picker initialization fails
 */
const showFilePicker = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error("name parameter must be a non-empty string");
  }

  try {
    const fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);

    // Sanitize filename to prevent path traversal
    const sanitizedName = name.replace(/[/\\:*?"<>|]/g, '_');

    fp.defaultString = `${sanitizedName}.zip`;
    fp.defaultExtension = "zip";
    fp.appendFilter("ZIP", "*.zip");

    const window = utils.getWindow();
    if (!window) {
      throw new Error("Cannot get window for file picker");
    }

    fp.init(window, "Export to Voyant", nsIFilePicker.modeSave);

    const rv = fp.show();

    // User cancelled
    if (rv !== nsIFilePicker.returnOK && rv !== nsIFilePicker.returnReplace) {
      console.log("File picker cancelled by user");
      return null;
    }

    if (!fp.file) {
      throw new Error("File picker returned OK but file is null");
    }

    console.log(`File selected: ${fp.file.path}`);
    return fp.file;
  } catch (error) {
    throw new Error(`File picker failed: ${error.message}`);
  }
};

exports.insertExportMenuItem = insertExportMenuItem;
exports.removeExportMenuItem = removeExportMenuItem;
exports.showFilePicker = showFilePicker;
