# Contributing to Zotero Voyant Export

Thank you for your interest in contributing to Zotero Voyant Export! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project follows a code of conduct that all contributors are expected to uphold:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Provide constructive feedback
- Focus on what is best for the project and community

## Getting Started

### Prerequisites

- **Firefox Nightly** (for testing): Download from [mozilla.org](https://www.mozilla.org/firefox/channel/desktop/#nightly)
- **Zotero Standalone 5.0+**: Download from [zotero.org](https://www.zotero.org/download/)
- **jpm** (Jetpack Package Manager): Install via `npm install -g jpm`
- **Node.js**: For build tools and development dependencies

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/zotero-voyant-export.git
   cd zotero-voyant-export
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/corajr/zotero-voyant-export.git
   ```

## Development Setup

### Building the Extension

Build an unsigned XPI:
```bash
make xpi
```

This will:
1. Generate `package.json` from the template
2. Run `jpm xpi` to create the extension
3. Patch `install.rdf` for Zotero compatibility
4. Output: `zotero-voyant-export.xpi`

### Installing for Development

1. Open Zotero Standalone
2. Go to Tools → Add-ons
3. Click the gear icon → "Install Add-On From File..."
4. Select the generated XPI file

### Running Tests

Run the test suite with Firefox Nightly:

```bash
make test
# Or specify your Firefox Nightly path:
jpm test -b "/path/to/Firefox Nightly.app"
```

### Project Structure

```
.
├── index.js              # Entry point
├── lib/
│   ├── zotero.js        # Zotero API wrapper
│   ├── exporter.js      # Core export logic
│   ├── ui.js            # UI integration
│   ├── format.js        # Metadata generation
│   └── utils.js         # Utilities
├── test/
│   └── test-format.js   # Test suite
└── CLAUDE.md            # AI assistant guide
```

## Coding Standards

### JavaScript Style

This project uses **modern ES6+ JavaScript**:

- Use `const` for immutable variables, `let` for mutable
- Use arrow functions (`() => {}`) for anonymous functions
- Use template literals for string interpolation
- Use destructuring where appropriate
- Prefer explicit over implicit

**Example:**
```javascript
// Good
const itemSaver = (logger, dataDir) => {
  logger.info(`Saving to ${dataDir.path}`);
  return (item) => {
    const title = item.getDisplayTitle();
    // ...
  };
};

// Avoid
var itemSaver = function(logger, dataDir) {
  logger.info("Saving to " + dataDir.path);
  return function(item) {
    var title = item.getDisplayTitle();
    // ...
  };
};
```

### Documentation

- **JSDoc comments** for all exported functions
- Include `@param`, `@returns`, and `@throws` tags
- Explain **why**, not just **what**

**Example:**
```javascript
/**
 * Generate MODS XML for a Zotero item
 *
 * @param {Object} item - Zotero item object
 * @returns {string} MODS XML as string
 * @throws {Error} If item is invalid or generation fails
 */
const generateMODS = (item) => {
  // ...
};
```

### Error Handling

- Always validate inputs at function boundaries
- Throw descriptive errors with context
- Catch and handle errors appropriately
- Log errors with the Logger class

**Example:**
```javascript
const mkdir = (startDir, dirName) => {
  if (!startDir) {
    throw new Error("startDir is required");
  }
  if (!dirName || typeof dirName !== 'string') {
    throw new Error("dirName must be a non-empty string");
  }

  try {
    // ... directory creation
  } catch (error) {
    throw new Error(`Failed to create directory '${dirName}': ${error.message}`);
  }
};
```

### Constants

Extract magic numbers and strings to named constants:

```javascript
// Good
const MODS_NS = "http://www.loc.gov/mods/v3";
const MAX_RETRIES = 5;

// Avoid
if (retries < 5) { /* ... */ }
```

## Testing

### Writing Tests

- Place tests in the `test/` directory
- Name test files `test-*.js`
- Use descriptive test names
- Test both happy paths and error cases
- Mock Zotero API calls appropriately

**Example:**
```javascript
exports["test generateMODS handles null item"] = function(assert) {
  assert.throws(() => {
    format.generateMODS(null);
  }, /Cannot generate MODS/, "Throws error for null item");
};
```

### Test Coverage

Aim for comprehensive coverage:
- All exported functions
- Error conditions
- Edge cases (empty strings, null values, etc.)
- Security concerns (XML injection, path traversal)

## Submitting Changes

### Branching Strategy

1. Create a feature branch from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes with clear, atomic commits:
   ```bash
   git commit -m "Add enhanced metadata to Dublin Core

   - Add publisher field
   - Add language field
   - Add tags as subjects
   "
   ```

### Commit Messages

Follow these guidelines:
- Use the imperative mood ("Add feature" not "Added feature")
- First line: brief summary (50 chars or less)
- Blank line, then detailed explanation if needed
- Reference issues: "Fixes #123" or "Relates to #456"

**Example:**
```
Add progress reporting for export operations

- Show progress indicator during export
- Report number of items processed
- Display success/failure status
- Add user-friendly error messages

Fixes #42
```

### Pull Requests

1. Update your branch with latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/master
   ```

2. Run tests and ensure they pass:
   ```bash
   make test
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request on GitHub with:
   - Clear description of changes
   - Why the change is needed
   - Any related issues
   - Screenshots (if UI changes)

## Reporting Bugs

### Before Submitting

- Check existing issues to avoid duplicates
- Test with the latest version
- Gather debug information (check Zotero's debug output)

### Bug Report Template

```markdown
**Description**
A clear description of the bug.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- Zotero version: [e.g., 5.0.96]
- Plugin version: [e.g., 1.0.0]
- OS: [e.g., macOS 10.15]

**Debug Output**
Paste relevant debug output from Zotero.

**Additional Context**
Any other relevant information.
```

## Suggesting Enhancements

### Enhancement Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Proposed Solution**
How you envision the feature working.

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Mockups, examples, or other relevant information.
```

## Development Guidelines

### Security

- Validate all user input
- Sanitize data before XML generation
- Avoid path traversal vulnerabilities
- Don't commit secrets or API keys

### Performance

- Handle large collections gracefully
- Don't block the UI thread
- Log progress for long operations
- Clean up temporary files

### Compatibility

- Target Zotero 5.0+
- Test with Firefox Nightly
- Consider different platforms (Windows, macOS, Linux)

## Questions?

If you have questions about contributing:
- Check the [CLAUDE.md](CLAUDE.md) file for technical details
- Open an issue for discussion
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (GNU GPL v3).

Thank you for contributing to Zotero Voyant Export!
