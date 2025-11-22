const { Cc, Ci } = require("chrome");

const parser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
const serializer = Cc["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(Ci.nsIDOMSerializer);

// XML Declaration and Namespaces
const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';

// MODS (Metadata Object Description Schema) constants
const MODS_NS = "http://www.loc.gov/mods/v3";
const MODS_ROOT_ELEMENT = '<mods xmlns="http://www.loc.gov/mods/v3" xmlns:mods="http://www.loc.gov/mods/v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/mods.xsd" />';

// Dublin Core constants
const DC_ROOT_ELEMENT = '<oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd" />';
const DC_NS = 'http://purl.org/dc/elements/1.1/';

// Zotero item type mapping for Dublin Core
const ITEM_TYPE_MAP = {
  'book': 'Text',
  'journalArticle': 'Text',
  'conferencePaper': 'Text',
  'thesis': 'Text',
  'webpage': 'InteractiveResource',
  'film': 'MovingImage',
  'audioRecording': 'Sound',
  'artwork': 'Image'
};

/**
 * Map a property to an XML element
 * Based on: https://github.com/zotero/translators/blob/d47f2ce085b9bbceb0ba70307041f8ccb5bf17e0/MODS.js#L310
 *
 * @param {string} ns - XML namespace
 * @param {Element} parentElement - Parent DOM element
 * @param {string} elementName - Name of the element to create
 * @param {string|number} property - Property value to add
 * @param {Object} [attributes] - Optional attributes for the element
 * @returns {Element|null} The created element or null if property is empty
 */
const mapProperty = (ns, parentElement, elementName, property, attributes) => {
  if (!property && property !== 0) return null;

  const doc = parentElement.ownerDocument;
  const newElement = doc.createElementNS(ns, elementName);

  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      newElement.setAttribute(key, value);
    }
  }

  // Sanitize text content to prevent XML injection
  const textContent = String(property).replace(/[<>&]/g, (char) => {
    const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;' };
    return entities[char];
  });

  newElement.appendChild(doc.createTextNode(textContent));
  parentElement.appendChild(newElement);
  return newElement;
};

/**
 * Add title information to MODS metadata
 *
 * @param {Document} doc - XML document
 * @param {Element} mods - MODS root element
 * @param {Object} item - Zotero item
 */
const addTitleFromItem = (doc, mods, item) => {
  const title = item.getDisplayTitle();
  if (title) {
    const titleInfo = doc.createElementNS(MODS_NS, "titleInfo");
    mapProperty(MODS_NS, titleInfo, "title", title);
    mods.appendChild(titleInfo);
  }
};

/**
 * Add creator name to MODS metadata
 *
 * @param {Document} doc - XML document
 * @param {Element} mods - MODS root element
 * @param {Object} creator - Creator object with firstName and lastName
 */
const addNameFromCreator = (doc, mods, creator) => {
  const fullName = creator.firstName
    ? `${creator.firstName} ${creator.lastName}`
    : creator.lastName;

  const name = doc.createElementNS(MODS_NS, "name");
  name.setAttribute("type", "personal");
  mapProperty(MODS_NS, name, "namePart", fullName);

  // Add role if available
  if (creator.creatorType) {
    const role = doc.createElementNS(MODS_NS, "role");
    const roleTerm = doc.createElementNS(MODS_NS, "roleTerm");
    roleTerm.setAttribute("type", "text");
    roleTerm.appendChild(doc.createTextNode(creator.creatorType));
    role.appendChild(roleTerm);
    name.appendChild(role);
  }

  mods.appendChild(name);
};

/**
 * Generate MODS (Metadata Object Description Schema) XML for a Zotero item
 *
 * @param {Object} item - Zotero item object
 * @returns {string} MODS XML as string
 * @throws {Error} If item is invalid or XML generation fails
 */
const generateMODS = (item) => {
  if (!item) {
    throw new Error("Cannot generate MODS: item is null or undefined");
  }

  try {
    const doc = parser.parseFromString(XML_DECLARATION + MODS_ROOT_ELEMENT, "text/xml");
    const mods = doc.documentElement;

    // Check for parsing errors
    if (mods.querySelector('parsererror')) {
      throw new Error("Failed to parse MODS template");
    }

    // Add title
    addTitleFromItem(doc, mods, item);

    // Add creators
    const creators = item.getCreators();
    if (creators && Array.isArray(creators)) {
      creators.forEach((creator) => {
        addNameFromCreator(doc, mods, creator);
      });
    }

    // Add publication date if available
    if (item.date) {
      const originInfo = doc.createElementNS(MODS_NS, "originInfo");
      mapProperty(MODS_NS, originInfo, "dateIssued", item.date);
      mods.appendChild(originInfo);
    }

    // Add abstract if available
    if (item.abstractNote) {
      mapProperty(MODS_NS, mods, "abstract", item.abstractNote);
    }

    // Add item type
    if (item.itemType) {
      const typeOfResource = doc.createElementNS(MODS_NS, "typeOfResource");
      typeOfResource.appendChild(doc.createTextNode(item.itemType));
      mods.appendChild(typeOfResource);
    }

    return serializer.serializeToString(doc);
  } catch (error) {
    throw new Error(`MODS generation failed: ${error.message}`);
  }
};

/**
 * Generate Dublin Core XML metadata for a Zotero item
 *
 * @param {Object} item - Zotero item object
 * @returns {string} Dublin Core XML as string
 * @throws {Error} If item is invalid or XML generation fails
 */
const generateDC = (item) => {
  if (!item) {
    throw new Error("Cannot generate Dublin Core: item is null or undefined");
  }

  try {
    const doc = parser.parseFromString(DC_ROOT_ELEMENT, "text/xml");
    const dc = doc.documentElement;

    // Check for parsing errors
    if (dc.querySelector('parsererror')) {
      throw new Error("Failed to parse Dublin Core template");
    }

    // Identifier (required)
    mapProperty(DC_NS, dc, "dc:identifier", item.libraryKey);

    // Title
    const title = item.getDisplayTitle();
    if (title) {
      mapProperty(DC_NS, dc, "dc:title", title);
    }

    // Creators
    const creators = item.getCreators();
    if (creators && Array.isArray(creators)) {
      creators.forEach((creator) => {
        const fullName = creator.firstName
          ? `${creator.firstName} ${creator.lastName}`
          : creator.lastName;

        // Map to either creator or contributor based on type
        const elementName = (creator.creatorType === 'author' || creator.creatorType === 'creator')
          ? "dc:creator"
          : "dc:contributor";
        mapProperty(DC_NS, dc, elementName, fullName);
      });
    }

    // Date
    if (item.date) {
      mapProperty(DC_NS, dc, "dc:date", item.date);
    }

    // Description (abstract)
    if (item.abstractNote) {
      mapProperty(DC_NS, dc, "dc:description", item.abstractNote);
    }

    // Type
    if (item.itemType) {
      const dcType = ITEM_TYPE_MAP[item.itemType] || 'Text';
      mapProperty(DC_NS, dc, "dc:type", dcType);
    }

    // Publisher
    if (item.publisher) {
      mapProperty(DC_NS, dc, "dc:publisher", item.publisher);
    }

    // Language
    if (item.language) {
      mapProperty(DC_NS, dc, "dc:language", item.language);
    }

    // Tags as subjects
    if (item.getTags) {
      const tags = item.getTags();
      if (tags && Array.isArray(tags)) {
        tags.forEach((tag) => {
          if (tag.tag) {
            mapProperty(DC_NS, dc, "dc:subject", tag.tag);
          }
        });
      }
    }

    // Rights
    if (item.rights) {
      mapProperty(DC_NS, dc, "dc:rights", item.rights);
    }

    return serializer.serializeToString(doc);
  } catch (error) {
    throw new Error(`Dublin Core generation failed: ${error.message}`);
  }
};

exports.generateDC = generateDC;
exports.generateMODS = generateMODS;
