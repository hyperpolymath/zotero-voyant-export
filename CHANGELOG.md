# Changelog

All notable changes to Zotero Voyant Export will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Comprehensive ES6+ Modernization**
  - Converted all modules from ES5 to modern ES6+ JavaScript
  - Use const/let instead of var throughout codebase
  - Arrow functions for cleaner, more maintainable code
  - Template literals for better string handling
  - Destructuring for cleaner object/array handling

- **Enhanced Error Handling**
  - Comprehensive try-catch blocks throughout
  - Descriptive error messages with context
  - Per-item error isolation in export process
  - Graceful handling of missing attachments
  - Input validation for all public functions

- **Expanded Metadata Generation**
  - Enhanced MODS metadata with additional fields:
    * Publication date (originInfo/dateIssued)
    * Abstract
    * Item type (typeOfResource)
    * Creator roles
  - Significantly expanded Dublin Core metadata:
    * Title (dc:title)
    * Creators and contributors with proper role mapping
    * Date (dc:date)
    * Description from abstract (dc:description)
    * Type with Zotero item type mapping
    * Publisher (dc:publisher)
    * Language (dc:language)
    * Tags as subjects (dc:subject)
    * Rights information (dc:rights)
  - XML injection protection via entity escaping

- **Improved BagIt Compliance**
  - Proper BagIt version declaration (0.97)
  - UTF-8 encoding declaration
  - Standards-compliant directory structure
  - Documentation of format compliance (BAGIT.md)

- **Comprehensive Documentation**
  - CLAUDE.md: AI assistant guide to codebase architecture
  - DEVELOPMENT.md: Complete developer documentation
  - BAGIT.md: BagIt specification compliance details
  - CONTRIBUTING.md: Contribution guidelines and standards
  - Enhanced README.md with troubleshooting guide
  - GitHub issue templates (bug report, feature request)
  - GitHub pull request template
  - Inline JSDoc comments for all functions

- **Improved Testing**
  - Expanded test suite from 2 to 15+ test cases
  - Tests for enhanced metadata fields
  - Error handling test cases
  - XML injection protection tests
  - Edge case coverage (null items, single names)
  - Security testing

- **Development Infrastructure**
  - .editorconfig for consistent coding styles
  - .gitattributes for line ending consistency
  - .eslintrc.json for code quality enforcement
  - Proper git ignore patterns

- **Enhanced Logging**
  - Added warn() method to Logger class
  - Detailed progress logging throughout export
  - Item-by-item status reporting
  - Success/failure confirmation messages

### Changed
- **Core Modules Modernized**
  - index.js: Modern initialization with better retry logic
  - lib/utils.js: ES6 class syntax for Logger
  - lib/format.js: Arrow functions, constants, enhanced metadata
  - lib/zotero.js: Improved error handling and validation
  - lib/ui.js: Filename sanitization, better error handling
  - lib/exporter.js: Comprehensive error handling, validation

- **Improved Code Organization**
  - Magic numbers/strings extracted to named constants
  - Better separation of concerns
  - Consistent error handling patterns
  - Uniform coding style throughout

- **Better User Experience**
  - More informative log messages
  - Clearer error reporting
  - Items without attachments handled gracefully
  - File picker with sanitized filenames

### Fixed
- XML injection vulnerabilities with proper entity escaping
- Path traversal risks in filename handling
- Missing error handling in various code paths
- Incomplete metadata in Dublin Core export
- BagIt file missing version and encoding information

### Security
- Added XML entity escaping to prevent injection attacks
- Filename sanitization to prevent path traversal
- Input validation on all public function boundaries
- Safe file operations with existence checks

## [Previous Versions]

(Version history prior to modernization not documented)

## Migration Guide

### Upgrading from Earlier Versions

The modernization changes are backwards-compatible at the plugin level:
- Exported ZIP format remains compatible with Voyant Tools
- BagIt structure enhanced but maintains compatibility
- Enhanced metadata is additive (existing fields preserved)
- No changes to user-facing functionality

For developers:
- Code now requires understanding of ES6+ JavaScript
- All functions have JSDoc comments - refer to inline documentation
- See DEVELOPMENT.md for architecture details
- See CONTRIBUTING.md for coding standards

## Deprecation Notices

None at this time.

## Known Issues

- Export is synchronous and may briefly freeze UI for large collections
- Progress reporting not yet visible to user (logged only)
- Uses deprecated Firefox Add-on SDK (WebExtension migration planned)
- No payload manifests in BagIt structure (checksums not generated)

## Future Plans

- [ ] Migrate from Add-on SDK to WebExtensions API
- [ ] Add visual progress indicator for exports
- [ ] Implement BagIt payload manifests with checksums
- [ ] Add bag-info.txt with collection metadata
- [ ] Async export to prevent UI freezing
- [ ] User-configurable metadata fields
- [ ] Export customization options
- [ ] Multi-language support

---

For detailed technical changes, see the commit history on GitHub:
https://github.com/corajr/zotero-voyant-export/commits/

For questions or issues, please open an issue:
https://github.com/corajr/zotero-voyant-export/issues
