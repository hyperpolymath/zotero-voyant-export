# Zotero Voyant Export - AI Assistant Guide

## Project Overview

**Zotero Voyant Export** is a Firefox/Zotero plugin (XPI extension) that enables users to export their Zotero collections to Voyant Tools for text analysis and visualization.

- **Purpose**: Bridge between Zotero (reference management) and Voyant (text analysis tool)
- **Type**: Firefox Add-on SDK extension for Zotero Standalone 5.0+
- **Output**: Creates BagIt-formatted ZIP files containing collection items with metadata
- **Status**: Undergoing modernization; currently in development (not production-ready)

## Architecture

### Core Components

#### Entry Point (`index.js`)
Main module that initializes the plugin:
- Implements retry logic (5 attempts with exponential backoff) for Zotero API access
- Sets up the export menu item in Zotero UI
- Handles plugin lifecycle (load/unload)

#### Modules (in `lib/`)

**`zotero.js`**: Zotero API Access
- Provides access to the Zotero global object
- Manages ZoteroPane (main Zotero window)
- Functions: `getZotero()`, `getZoteroPane()`

**`ui.js`**: User Interface
- Adds "Export Collection to Voyant..." menu item to collection context menu
- Shows file picker for selecting export destination
- Functions: `insertExportMenuItem()`, `removeExportMenuItem()`, `showFilePicker()`

**`exporter.js`**: Export Logic (Core)
- Main export workflow in `doExport()`
- Creates temporary directory structure
- Processes each collection item:
  - Retrieves best attachment (PDF, HTML snapshot, etc.)
  - Generates MODS and Dublin Core metadata
  - Copies files to BagIt structure
- Creates ZIP archive for Voyant upload
- BagIt directory structure:
  ```
  collection/
  ├── bagit.txt
  └── data/
      ├── {itemID1}/
      │   ├── MODS.bin
      │   ├── DC.xml
      │   └── CWRC.bin (attachment)
      ├── {itemID2}/
      └── ...
  ```

**`format.js`**: Metadata Generation
- Generates MODS (Metadata Object Description Schema) XML
- Generates Dublin Core XML metadata
- Uses DOM parser/serializer for XML manipulation
- Functions: `generateMODS(item)`, `generateDC(item)`

**`utils.js`**: Utilities
- Logger class for debugging (outputs to console and Zotero.debug)
- Window management helper
- Functions: `getWindow()`, `Logger` class

### Technology Stack

- **Language**: JavaScript (pre-ES6, Firefox Add-on SDK style)
- **Runtime**: Firefox/Zotero XUL environment
- **APIs Used**:
  - Chrome Components (`Cu`, `Cc`, `Ci`)
  - Firefox Add-on SDK (`sdk/self`, `sdk/timers`, `sdk/core/promise`)
  - Zotero internal APIs
- **XML Processing**: nsIDOMParser, nsIDOMSerializer
- **File Operations**: FileUtils.jsm, Zotero.File

## File Structure

```
.
├── index.js                    # Main entry point
├── lib/
│   ├── zotero.js              # Zotero API wrapper
│   ├── exporter.js            # Core export logic
│   ├── ui.js                  # UI integration
│   ├── format.js              # Metadata formatters (MODS, DC)
│   └── utils.js               # Logger and utilities
├── test/
│   └── test-format.js         # Format tests
├── Makefile                   # Build system
├── package.json.template      # Template for package.json
├── install.rdf.patch          # Patch for install.rdf
├── VERSION                    # Version number file
├── .jpmignore                 # JPM ignore patterns
└── README.md                  # User documentation
```

## Build System

### Makefile Targets

- **`make xpi`** (default): Build unsigned XPI
  - Generates `package.json` from template
  - Runs `jpm xpi` to create extension
  - Patches `install.rdf` for Zotero compatibility
  - Output: `zotero-voyant-export.xpi`

- **`make test`**: Run tests with Firefox Nightly
  - Command: `jpm test -b "/Applications/Nightly.app"`

- **`make sign`**: Sign XPI with Mozilla (requires `JWT_ISSUER`, `JWT_SECRET`)
  - Uses `jpm sign` to get Mozilla signature
  - Output: `zotero_voyant_export-{VERSION}-fx.xpi`

- **`make release`**: Create signed release with update.rdf
  - Signs XPI
  - Generates `update.rdf` with uhura (requires `UHURA_PEM_FILE`)
  - Commits to gh-pages branch

### Build Dependencies

- **jpm** (Jetpack Package Manager): Firefox add-on builder
- **uhura**: Update manifest signer (http://www.softlights.net/projects/mxtools/)
- **Environment variables**:
  - `JWT_ISSUER`, `JWT_SECRET`: Mozilla add-on signing
  - `UHURA_PEM_FILE`: Private key for update.rdf signing

## Development Status

According to README:
> "I have started with a code update to modern, dependable, and secure languages, as part of my rhodiumising of repositories work. At the moment I have only just completed a sweep at a top level, and so there is more work to be done to get this to production."

### Known Limitations

1. **Legacy Code**: Uses deprecated Firefox Add-on SDK (EOL)
2. **Async Handling**: Uses SDK promises, not modern async/await
3. **No Modern Build**: No webpack/rollup, relies on jpm
4. **Limited Error Handling**: Minimal error recovery in export flow
5. **Zotero 5.0 Beta**: Targets beta version with database upgrade warnings

## Key Technical Details

### Export Format (BagIt)

The plugin creates a BagIt-compliant directory structure:
- `bagit.txt`: BagIt marker file (currently empty)
- `data/`: Payload directory
  - Each item in subdirectory named by Zotero item ID
  - Three files per item:
    - `MODS.bin`: MODS metadata (XML)
    - `DC.xml`: Dublin Core metadata
    - `CWRC.bin`: Actual attachment file (PDF, HTML, etc.)

### Metadata Standards

**MODS** (lib/format.js:50-59):
- Includes title (`<titleInfo><title>`)
- Creator names (`<name type="personal"><namePart>`)
- Uses namespace: `http://www.loc.gov/mods/v3`

**Dublin Core** (lib/format.js:61-67):
- Currently minimal: only includes identifier (libraryKey)
- Uses namespace: `http://purl.org/dc/elements/1.1/`

### Chrome Components Usage

The plugin uses XPCOM components extensively:
- `Cc["@mozilla.org/filepicker;1"]`: File picker dialog
- `Cc["@mozilla.org/xmlextras/domparser;1"]`: XML parsing
- `Cc["@mozilla.org/xmlextras/xmlserializer;1"]`: XML serialization

## Licensing

**Dual Licensed**:
1. **GNU GPL v3**: Primary license (see LICENSE)
2. **MIT + Palimpsest License v0.6**: Alternative licensing options mentioned in README

Note: There's a discrepancy in the README which mentions MIT + Palimpsest but the actual LICENSE file is GPL v3.

## Common Development Tasks

### Reading the Code

When working with this codebase:
1. Start with `index.js` to understand initialization
2. Follow the flow: `index.js` → `ui.js` → `exporter.js`
3. Key function: `exporter.doExport()` orchestrates the entire export
4. Promise chain in `exporter.js:82-84` processes all items then creates ZIP

### Understanding Zotero Integration

- Plugin hooks into Zotero via context menu (right-click on collection)
- Uses Zotero's internal APIs (not public APIs):
  - `collection.getChildItems()`: Get all items in collection
  - `item.getBestAttachment()`: Find best file attachment
  - `item.getDisplayTitle()`: Get formatted title
  - `item.getCreators()`: Get authors/editors
  - `Zotero.File.zipDirectory()`: Create ZIP archive

### Testing

The test suite uses jpm with Firefox Nightly:
```bash
jpm test -b /Applications/Nightly.app/
```

Test file: `test/test-format.js` (tests metadata generation)

## Potential Modernization Tasks

Based on the current state:
1. Migrate from Add-on SDK to WebExtensions
2. Replace Chrome Components with WebExtension APIs
3. Update to modern JavaScript (ES6+, async/await)
4. Add comprehensive error handling
5. Implement progress reporting for large collections
6. Add more complete Dublin Core metadata
7. Validate BagIt structure compliance
8. Add integration tests for Zotero API interaction

## Important Notes for AI Assistants

1. **Do not run Firefox commands** that expect GUI interaction
2. **Zotero API** is only available in Zotero runtime, not in Node
3. **jpm** is deprecated; consider WebExtension migration for new features
4. **BagIt format** should be preserved for Voyant compatibility
5. The export process is **asynchronous** - uses promises throughout
6. **Temporary directories** are created in system temp, cleaned up by OS
7. The `install.rdf.patch` is critical for Zotero recognition of the XPI

## References

- Zotero: https://www.zotero.org/
- Voyant Tools: http://voyant-tools.org/
- MODS Standard: http://www.loc.gov/standards/mods/
- BagIt Specification: https://tools.ietf.org/html/rfc8493
- Dublin Core: http://purl.org/dc/elements/1.1/
