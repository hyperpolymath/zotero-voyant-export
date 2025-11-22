# Developer Documentation

Comprehensive technical documentation for developers working on Zotero Voyant Export.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Module Documentation](#module-documentation)
- [Development Workflow](#development-workflow)
- [Debugging](#debugging)
- [Build System](#build-system)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)
- [Common Issues](#common-issues)

## Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────┐
│         index.js (Entry Point)          │
│  - Initialization with retry logic      │
│  - Menu item installation               │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌──────────────┐
│   zotero.js   │   │    ui.js     │
│  API Access   │   │  UI Layer    │
└───────┬───────┘   └──────┬───────┘
        │                  │
        └────────┬─────────┘
                 ▼
        ┌────────────────┐
        │  exporter.js   │
        │  Export Logic  │
        └────────┬───────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌─────────────┐
│  format.js   │  │  utils.js   │
│   Metadata   │  │  Utilities  │
└──────────────┘  └─────────────┘
```

### Data Flow

1. **User Interaction**: Right-click collection → "Export to Voyant..."
2. **File Selection**: File picker shows → User selects destination
3. **Temp Directory**: Create temporary BagIt structure
4. **Item Processing**: For each item in collection:
   - Get best attachment
   - Generate MODS metadata
   - Generate Dublin Core metadata
   - Copy attachment to BagIt structure
5. **ZIP Creation**: Package entire structure as ZIP
6. **Cleanup**: Temporary files handled by OS

### BagIt Structure

```
collection.zip
├── bagit.txt               # BagIt marker (version 0.97)
└── data/                   # Payload directory
    ├── <itemID1>/
    │   ├── MODS.bin        # MODS metadata
    │   ├── DC.xml          # Dublin Core metadata
    │   └── CWRC.bin        # Attachment file
    ├── <itemID2>/
    └── ...
```

## Module Documentation

### index.js

**Purpose**: Add-on entry point and lifecycle management

**Key Functions**:
- `main(options, callbacks)`: Initialization with exponential backoff retry
- `onUnload(reason)`: Cleanup on unload

**Retry Logic**:
```javascript
MAX_RETRIES = 5
delay = 2^retries * 1000ms
// Attempts: 1s, 2s, 4s, 8s, 16s
```

**Common Issues**:
- Zotero not available: Solved by retry logic
- Menu item already exists: Checked before insertion

### lib/zotero.js

**Purpose**: Wrapper for Zotero API access

**Key Functions**:
- `getZotero()`: Lazy initialization of Zotero global
- `getZoteroPane()`: Access to active Zotero window

**Error Handling**:
- Returns `null` if Zotero unavailable
- Throws if ZoteroPane cannot be shown
- Validates pane loaded state

### lib/ui.js

**Purpose**: User interface integration

**Key Functions**:
- `insertExportMenuItem(onclick)`: Add menu item to collection context menu
- `removeExportMenuItem()`: Remove menu item (cleanup)
- `showFilePicker(name)`: Display save dialog

**Security**:
- Filename sanitization: `name.replace(/[/\\:*?"<>|]/g, '_')`
- Path traversal prevention

### lib/exporter.js

**Purpose**: Core export logic

**Key Functions**:
- `doExport()`: Main export orchestration
- `itemSaver(logger, dataDir, Zotero)`: Returns function to save individual items
- `mkdir(startDir, dirName)`: Create directory
- `mkTmpDir()`: Create unique temp directory

**Error Handling Strategy**:
- Per-item error isolation: One item failure doesn't stop export
- Detailed logging at each stage
- Graceful handling of missing attachments

**Performance Considerations**:
- Uses `Promise.all()` for parallel item processing
- Skips items without attachments
- Logs progress for monitoring

### lib/format.js

**Purpose**: Metadata generation (MODS and Dublin Core)

**Key Functions**:
- `generateMODS(item)`: Create MODS XML
- `generateDC(item)`: Create Dublin Core XML
- `mapProperty(ns, parentElement, elementName, property, attributes)`: XML helper

**Metadata Mapping**:

| Zotero Field | MODS Element | DC Element |
|--------------|--------------|------------|
| title | `<titleInfo><title>` | `<dc:title>` |
| creators | `<name><namePart>` | `<dc:creator>` / `<dc:contributor>` |
| date | `<originInfo><dateIssued>` | `<dc:date>` |
| abstractNote | `<abstract>` | `<dc:description>` |
| itemType | `<typeOfResource>` | `<dc:type>` |
| publisher | N/A | `<dc:publisher>` |
| language | N/A | `<dc:language>` |
| tags | N/A | `<dc:subject>` |
| rights | N/A | `<dc:rights>` |

**Security**:
- XML injection protection via entity escaping
- Special characters: `<`, `>`, `&` → `&lt;`, `&gt;`, `&amp;`

### lib/utils.js

**Purpose**: Shared utilities

**Classes**:
- `Logger`: Dual output to console and Zotero.debug

**Functions**:
- `getWindow()`: Get most recent browser window

## Development Workflow

### 1. Setup Development Environment

```bash
# Clone repository
git clone https://github.com/corajr/zotero-voyant-export.git
cd zotero-voyant-export

# Install jpm globally
npm install -g jpm

# Build XPI
make xpi
```

### 2. Making Changes

```bash
# Create feature branch
git checkout -b feature/my-enhancement

# Make changes to source files
# Edit lib/*.js, test/*.js, etc.

# Test changes
make test

# Build updated XPI
make xpi

# Install in Zotero for manual testing
# Tools → Add-ons → Install from file
```

### 3. Code Style

Follow these patterns:

**Modern JavaScript**:
```javascript
// Use const/let, not var
const MAX_RETRIES = 5;
let retries = 0;

// Arrow functions
const processItem = (item) => {
  // ...
};

// Template literals
logger.info(`Processing item ${item.id}`);

// Destructuring
const { Cc, Ci } = require("chrome");
```

**Error Handling**:
```javascript
// Validate inputs
const mkdir = (startDir, dirName) => {
  if (!startDir) {
    throw new Error("startDir is required");
  }

  try {
    // ... operation
  } catch (error) {
    throw new Error(`Failed to ...: ${error.message}`);
  }
};
```

**JSDoc Documentation**:
```javascript
/**
 * Brief description
 *
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 * @throws {Error} When error occurs
 */
```

## Debugging

### Zotero Debug Output

1. Help → Debug Output Logging → Start Logging
2. Reproduce issue
3. Help → Debug Output Logging → View Output
4. Look for "zotero-voyant-export" messages

### Browser Console

1. Tools → Developer Tools → Browser Console (Ctrl+Shift+J)
2. Filter for "voyant" or "export"
3. View console.log, console.error output

### Common Debug Patterns

```javascript
// Use logger for Zotero debug output
logger.info(`Starting export: ${collection.name}`);
logger.error(`Export failed: ${error.message}`);
logger.warn(`Item ${itemID}: No attachment found`);

// Use console for immediate feedback
console.log("Debug checkpoint reached");
console.error("Unexpected error:", error);
```

### Debugging Tests

```bash
# Run with verbose output
jpm test -b "/Applications/Nightly.app" -v

# Debug specific test
# Add console.log statements in test file
# View output in terminal
```

## Build System

### Makefile Overview

```makefile
make xpi      # Build unsigned XPI (default)
make test     # Run tests with Firefox Nightly
make sign     # Sign XPI with Mozilla (requires JWT_*)
make release  # Create signed release with update.rdf
```

### Build Process Details

**Building XPI**:
1. Generate `package.json` from template (substitutes VERSION)
2. Run `jpm xpi` → creates `/tmp/zotero-voyant-export.xpi`
3. Unzip to `/tmp/zotero-voyant-export/`
4. Patch `install.rdf` with Zotero-specific settings
5. Re-zip to `zotero-voyant-export.xpi` in project root

**install.rdf Patch**:
- Adds Zotero application compatibility
- Required for Zotero to recognize extension

### Environment Variables

For signing and releases:

```bash
# Mozilla Add-on Signing
export JWT_ISSUER="user:12345:67"
export JWT_SECRET="secret-key-here"

# Update Manifest Signing (uhura)
export UHURA_PEM_FILE="/path/to/private.pem"
```

## Testing Strategy

### Unit Tests

Located in `test/test-format.js`.

**Test Categories**:
1. **Basic functionality**: MODS/DC generation
2. **Full metadata**: All fields populated
3. **Edge cases**: Single names, missing fields
4. **Error handling**: Null inputs
5. **Security**: XML injection protection
6. **Structure**: Valid XML output

**Running Tests**:
```bash
# All tests
make test

# Specific Firefox path
jpm test -b "/path/to/Firefox Nightly.app"

# With verbose output
jpm test -b "/path/to/Firefox Nightly.app" -v
```

### Manual Testing

**Test Checklist**:
- [ ] Install extension in Zotero
- [ ] Right-click collection → "Export to Voyant..." appears
- [ ] File picker shows with .zip default
- [ ] Export completes without errors
- [ ] ZIP contains correct BagIt structure
- [ ] MODS.bin and DC.xml contain valid XML
- [ ] CWRC.bin is correct attachment file
- [ ] Upload ZIP to Voyant Tools works
- [ ] Uninstall extension removes menu item

### Integration Testing

**Voyant Tools Verification**:
1. Export collection to ZIP
2. Upload to http://voyant-tools.org
3. Verify corpus loads correctly
4. Check document titles match Zotero items
5. Verify metadata appears in Voyant

## Deployment

### Version Management

Update `VERSION` file:
```bash
echo "1.2.3" > VERSION
```

This automatically propagates to:
- `package.json` (via template substitution)
- XPI filename
- `update.rdf`

### Release Process

1. **Update VERSION**: Increment version number
2. **Update CHANGELOG**: Document changes
3. **Test thoroughly**: Run all tests
4. **Build signed XPI**: `make sign`
5. **Create update.rdf**: `make release`
6. **Tag release**: `git tag v1.2.3`
7. **Push to GitHub**: `git push --tags`
8. **Create GitHub release**: Attach signed XPI
9. **Update gh-pages**: Push update.rdf

### Signing Requirements

Mozilla requires signing for Firefox/Zotero extensions:
- Create account at https://addons.mozilla.org
- Generate API credentials
- Set JWT_ISSUER and JWT_SECRET environment variables

## Common Issues

### "Zotero not available after 5 retries"

**Cause**: Zotero taking too long to initialize

**Solutions**:
- Increase MAX_RETRIES in index.js
- Increase initial delay
- Check Zotero is actually running

### "ZoteroPane could not be shown"

**Cause**: Zotero window not accessible

**Solutions**:
- Ensure Zotero Standalone window is open
- Try restarting Zotero
- Check for Zotero errors in debug output

### "Item X: No attachment found"

**Cause**: Item has no PDF, HTML, or other exportable attachment

**Expected**: Not an error - item is skipped gracefully

### "Failed to create directory"

**Cause**: Permissions issue or disk full

**Solutions**:
- Check temp directory permissions
- Verify disk space available
- Try different temp directory location

### Tests Fail with "Cannot find module"

**Cause**: Dependencies not properly linked

**Solutions**:
```bash
# Reinstall jpm
npm uninstall -g jpm
npm install -g jpm

# Clean and rebuild
rm -rf node_modules
rm package.json
make xpi
```

### XPI Not Installing in Zotero

**Cause**: `install.rdf` not properly patched

**Solutions**:
- Verify `install.rdf.patch` exists
- Check patch applies successfully
- Manually inspect install.rdf in XPI

## Advanced Topics

### Adding New Metadata Fields

1. **Identify Zotero field**: Check Zotero API
2. **Map to MODS/DC**: Consult standards
3. **Update format.js**: Add field mapping
4. **Add tests**: Test new field
5. **Update documentation**: CLAUDE.md, DEVELOPMENT.md

**Example**:
```javascript
// In generateDC():
if (item.ISBN) {
  mapProperty(DC_NS, dc, "dc:identifier", `ISBN:${item.ISBN}`);
}
```

### Performance Optimization

**Current Bottlenecks**:
- File I/O (copying attachments)
- XML generation (DOM operations)
- ZIP creation (compression)

**Optimization Opportunities**:
- Parallel item processing (already implemented via Promise.all)
- Stream-based ZIP creation
- Caching of parsed XML templates

### WebExtension Migration

**Current State**: Uses deprecated Firefox Add-on SDK

**Migration Path**:
1. Replace SDK with WebExtension APIs
2. Update manifest.json format
3. Replace XPCOM with modern APIs
4. Test with latest Zotero
5. Update build system (remove jpm)

**Challenges**:
- Zotero API access may change
- Menu system integration
- File system access APIs

## Resources

- [Zotero Developer Documentation](https://www.zotero.org/support/dev/client_coding)
- [Firefox Add-on SDK Docs](https://developer.mozilla.org/en-US/docs/Archive/Add-ons)
- [MODS Standard](http://www.loc.gov/standards/mods/)
- [Dublin Core](http://dublincore.org/specifications/dublin-core/)
- [BagIt Specification](https://tools.ietf.org/html/rfc8493)
- [Voyant Tools](http://voyant-tools.org/)

## Questions?

For questions about development:
- Check [CLAUDE.md](CLAUDE.md) for AI assistant guide
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- Open an issue on GitHub for discussion
