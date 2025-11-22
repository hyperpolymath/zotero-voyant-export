# BagIt Specification Compliance

This document describes how Zotero Voyant Export implements the BagIt specification for packaging exported collections.

## What is BagIt?

[BagIt](https://tools.ietf.org/html/rfc8493) is a hierarchical file packaging format designed for digital preservation and network transfer of arbitrary digital content. It provides a simple filesystem-based structure that is easily implementable, human-readable, and suitable for long-term storage.

## Why BagIt for Voyant?

Voyant Tools accepts BagIt-formatted archives for corpus upload. Using BagIt provides:

- **Structure**: Organized payload with metadata
- **Integrity**: Support for checksums and validation
- **Interoperability**: Standard format recognized by many systems
- **Simplicity**: Human-readable directory structure
- **Extensibility**: Support for custom metadata

## Current Implementation

### Directory Structure

The plugin creates a BagIt archive with the following structure:

```
collection.zip
├── bagit.txt                    # BagIt declaration file
└── data/                        # Payload directory
    ├── <itemID1>/               # First Zotero item
    │   ├── MODS.bin            # MODS metadata (XML)
    │   ├── DC.xml              # Dublin Core metadata
    │   └── CWRC.bin            # Attachment file (PDF, HTML, etc.)
    ├── <itemID2>/               # Second Zotero item
    │   ├── MODS.bin
    │   ├── DC.xml
    │   └── CWRC.bin
    └── ...
```

### BagIt Declaration File

**File**: `bagit.txt`

**Contents**:
```
BagIt-Version: 0.97
Tag-File-Character-Encoding: UTF-8
```

**Location**: lib/exporter.js:235

```javascript
const bagitContent = "BagIt-Version: 0.97\nTag-File-Character-Encoding: UTF-8";
Zotero.File.putContents(bagitFile, bagitContent);
```

### Payload Directory

**Directory Name**: `data/`

**Purpose**: Contains all payload files (content to be preserved/transferred)

**Organization**:
- One subdirectory per Zotero item
- Subdirectory named with Zotero item ID
- Each subdirectory contains three files

### Payload Files

#### MODS.bin

**Format**: XML (Metadata Object Description Schema)

**Purpose**: Rich bibliographic metadata

**Contents**:
- Title information
- Creator names with roles
- Publication date
- Abstract
- Item type
- Subject headings

**Namespace**: `http://www.loc.gov/mods/v3`

**Example**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<mods xmlns="http://www.loc.gov/mods/v3"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/mods.xsd">
  <titleInfo>
    <title>Sample Article Title</title>
  </titleInfo>
  <name type="personal">
    <namePart>John Smith</namePart>
    <role>
      <roleTerm type="text">author</roleTerm>
    </role>
  </name>
  <originInfo>
    <dateIssued>2024</dateIssued>
  </originInfo>
  <abstract>Article abstract text...</abstract>
</mods>
```

#### DC.xml

**Format**: XML (Dublin Core)

**Purpose**: Simple, interoperable metadata

**Contents**:
- Identifier (Zotero library key)
- Title
- Creators and contributors
- Date
- Description
- Type
- Publisher
- Language
- Subject terms (from tags)
- Rights

**Namespace**: `http://purl.org/dc/elements/1.1/`

**Example**:
```xml
<oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"
           xmlns:dc="http://purl.org/dc/elements/1.1/"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/
                               http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
  <dc:identifier>ABC123</dc:identifier>
  <dc:title>Sample Article Title</dc:title>
  <dc:creator>John Smith</dc:creator>
  <dc:date>2024</dc:date>
  <dc:type>Text</dc:type>
  <dc:subject>research</dc:subject>
</oai_dc:dc>
```

#### CWRC.bin

**Format**: Original attachment format (PDF, HTML, etc.)

**Purpose**: Actual content file for text analysis

**Source**: Best attachment from Zotero item (PDF preferred, HTML snapshot as fallback)

**Naming**: Always `CWRC.bin` regardless of original file type

## BagIt Specification Compliance

### Implemented Features

| Feature | Status | Location | Notes |
|---------|--------|----------|-------|
| bagit.txt | ✅ | Root | Version 0.97, UTF-8 encoding |
| data/ directory | ✅ | Root | Payload directory |
| Version declaration | ✅ | bagit.txt | BagIt-Version: 0.97 |
| Encoding declaration | ✅ | bagit.txt | Tag-File-Character-Encoding: UTF-8 |

### Not Currently Implemented

| Feature | Status | Reason | Future Consideration |
|---------|--------|--------|---------------------|
| manifest-*.txt | ❌ | Not required for Voyant | Could add for validation |
| tagmanifest-*.txt | ❌ | Not required | Could add for tag file integrity |
| bag-info.txt | ❌ | Optional metadata | Could add collection metadata |
| fetch.txt | ❌ | No remote fetching needed | N/A for this use case |
| Checksums | ❌ | Not required by Voyant | SHA-256 recommended if added |

### Specification Requirements

According to RFC 8493, a valid bag MUST have:

1. **bagit.txt** ✅
   - Required fields: BagIt-Version, Tag-File-Character-Encoding
   - Must be in root directory
   - Must be UTF-8 encoded (or declared encoding)

2. **data/ directory** ✅
   - Contains all payload files
   - May contain subdirectories
   - May be empty (but we always populate it)

3. **At least one payload manifest** ❌ (optional for us)
   - Format: `manifest-<algorithm>.txt`
   - Example: `manifest-sha256.txt`
   - Lists checksums for all payload files

Our implementation is a **minimal valid BagIt bag** with payload files but without manifests. This is technically valid according to the specification, which states manifests are "RECOMMENDED" but not required if the bag is immediately unpacked.

## Voyant Tools Integration

### Upload Process

1. User exports collection → creates ZIP with BagIt structure
2. User uploads ZIP to Voyant Tools (or local Voyant server)
3. Voyant unpacks ZIP
4. Voyant reads `data/` directory
5. For each subdirectory:
   - Reads CWRC.bin (actual content)
   - Reads DC.xml and MODS.bin (metadata)
   - Creates document in corpus

### Metadata Usage in Voyant

- **Title**: From DC.xml `<dc:title>` or MODS `<title>`
- **Author**: From DC.xml `<dc:creator>` or MODS `<name>`
- **Date**: From DC.xml `<dc:date>` or MODS `<dateIssued>`
- **Keywords**: From DC.xml `<dc:subject>` tags

## Future Enhancements

### Add Payload Manifests

**Implementation**:
```javascript
// In exporter.js, after all items processed
const manifest = [];
for (const itemDir of dataDir.directoryEntries) {
  const files = ['MODS.bin', 'DC.xml', 'CWRC.bin'];
  for (const file of files) {
    const filePath = `data/${itemDir.leafName}/${file}`;
    const checksum = calculateSHA256(file);
    manifest.push(`${checksum}  ${filePath}`);
  }
}
Zotero.File.putContents(
  fileInDir(outDir, 'manifest-sha256.txt'),
  manifest.join('\n')
);
```

**Benefits**:
- Integrity verification
- Detect corruption during transfer
- Meet full BagIt recommendation

### Add bag-info.txt

**Proposed Contents**:
```
Source-Organization: Zotero
Bagging-Date: 2024-01-15
Bag-Size: 15.2 MB
Payload-Oxum: 15928340.42
Collection-Name: My Research Collection
Item-Count: 42
Zotero-Collection-Key: ABC123XYZ
```

**Implementation**:
```javascript
const bagInfo = [
  'Source-Organization: Zotero',
  `Bagging-Date: ${new Date().toISOString().split('T')[0]}`,
  `Bag-Size: ${calculateSize(outDir)}`,
  `Payload-Oxum: ${calculateOxum(dataDir)}`,
  `Collection-Name: ${collection.name}`,
  `Item-Count: ${items.length}`,
  `Zotero-Collection-Key: ${collection.key}`
].join('\n');
```

### Add Tag Manifests

**Purpose**: Verify integrity of tag files (bagit.txt, bag-info.txt, etc.)

**Format**: Same as payload manifests but for tag files

**Example** (`tagmanifest-sha256.txt`):
```
abc123...def  bagit.txt
456789...012  bag-info.txt
```

### Validation Tools

**Recommended**: bagit-python or similar

```bash
# Install
pip install bagit

# Validate exported bag
unzip collection.zip -d collection
bagit.py --validate collection
```

**Expected Issues**:
- Missing manifest files (warnings only)
- Otherwise should pass validation

## Standards References

### BagIt Specification
- **RFC 8493**: https://tools.ietf.org/html/rfc8493
- **BagIt Profiles**: https://github.com/bagit-profiles/bagit-profiles

### Metadata Standards
- **MODS**: http://www.loc.gov/standards/mods/
- **Dublin Core**: http://dublincore.org/specifications/dublin-core/

### Related Specifications
- **OAI-PMH**: https://www.openarchives.org/pmh/
- **CWRC**: Canadian Writing Research Collaboratory

## Implementation Notes

### Character Encoding

All text files use UTF-8 encoding:
- bagit.txt
- MODS.bin
- DC.xml

This is declared in `bagit.txt` and enforced by:
```javascript
// XML declaration includes encoding
const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';
```

### Filename Conventions

**Item Directories**: Use Zotero item ID
- Example: `12345/`, `67890/`
- Guarantees uniqueness
- Allows tracing back to Zotero

**Metadata Files**: Fixed names
- `MODS.bin`: MODS metadata
- `DC.xml`: Dublin Core metadata
- `CWRC.bin`: Attachment content

**Note**: `.bin` extension for MODS is unconventional but matches CWRC expectations

### Error Handling

Items without attachments are skipped:
```javascript
if (!attPath) {
  logger.warn(`Item ${itemID}: Attachment has no file path, skipping`);
  return;
}
```

This creates a bag where:
- Only items with attachments are included
- Empty item directories are never created
- Payload is always meaningful content

## Validation Checklist

To verify BagIt compliance of exported archives:

- [ ] `bagit.txt` exists in root
- [ ] `bagit.txt` contains `BagIt-Version: 0.97`
- [ ] `bagit.txt` contains `Tag-File-Character-Encoding: UTF-8`
- [ ] `data/` directory exists
- [ ] Each item has subdirectory in `data/`
- [ ] Each item directory contains MODS.bin
- [ ] Each item directory contains DC.xml
- [ ] Each item directory contains CWRC.bin
- [ ] All XML files are valid UTF-8
- [ ] All XML files have XML declaration
- [ ] Archive can be uploaded to Voyant successfully

## Questions?

For questions about BagIt implementation:
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for technical details
- See [CLAUDE.md](CLAUDE.md) for architecture overview
- Consult RFC 8493 for specification
- Open an issue on GitHub
