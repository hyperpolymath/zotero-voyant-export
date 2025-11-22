# justfile - Build automation for Zotero Voyant Export
# https://just.systems/

# Default recipe (list all recipes)
default:
    @just --list

# Build unsigned XPI
build: clean
    @echo "Building unsigned XPI..."
    make xpi
    @echo "✓ Build complete: zotero-voyant-export.xpi"

# Clean build artifacts
clean:
    @echo "Cleaning build artifacts..."
    rm -f zotero-voyant-export.xpi
    rm -f package.json
    rm -rf /tmp/zotero-voyant-export*
    @echo "✓ Clean complete"

# Run all tests
test:
    @echo "Running tests with Firefox Nightly..."
    jpm test -b "/Applications/Nightly.app/"
    @echo "✓ Tests complete"

# Run tests with verbose output
test-verbose:
    @echo "Running tests with verbose output..."
    jpm test -b "/Applications/Nightly.app/" -v
    @echo "✓ Verbose tests complete"

# Lint JavaScript code
lint:
    @echo "Linting JavaScript code..."
    eslint index.js lib/*.js test/*.js
    @echo "✓ Lint complete"

# Format code (if prettier is available)
format:
    @echo "Formatting code..."
    -npx prettier --write "**/*.{js,json,md}"
    @echo "✓ Format complete"

# Validate all checks (lint + test)
validate: lint test
    @echo "✓ All validation checks passed"

# Sign XPI with Mozilla (requires JWT_ISSUER and JWT_SECRET)
sign: check-env build
    @echo "Signing XPI with Mozilla..."
    make sign
    @echo "✓ Sign complete"

# Create full release (sign + update.rdf)
release: check-env sign
    @echo "Creating release..."
    make release
    @echo "✓ Release complete"

# Check required environment variables
check-env:
    @echo "Checking environment variables..."
    @test -n "$$JWT_ISSUER" || (echo "❌ JWT_ISSUER not set" && exit 1)
    @test -n "$$JWT_SECRET" || (echo "❌ JWT_SECRET not set" && exit 1)
    @test -n "$$UHURA_PEM_FILE" || (echo "❌ UHURA_PEM_FILE not set" && exit 1)
    @echo "✓ Environment variables OK"

# Install development dependencies
install-deps:
    @echo "Installing development dependencies..."
    npm install -g jpm eslint prettier
    @echo "✓ Dependencies installed"

# Check RSR compliance
rsr-check:
    #!/usr/bin/env bash
    echo "Checking RSR compliance..."

    # Documentation files
    files=("README.md" "LICENSE" "SECURITY.md" "CONTRIBUTING.md" "CODE_OF_CONDUCT.md" "MAINTAINERS.md" "CHANGELOG.md")
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            echo "✓ $file"
        else
            echo "❌ $file missing"
        fi
    done

    # .well-known directory
    if [ -d ".well-known" ]; then
        echo "✓ .well-known/ directory"
        for file in security.txt ai.txt humans.txt; do
            if [ -f ".well-known/$file" ]; then
                echo "  ✓ $file"
            else
                echo "  ❌ $file missing"
            fi
        done
    else
        echo "❌ .well-known/ directory missing"
    fi

    # Build files
    if [ -f "justfile" ]; then
        echo "✓ justfile"
    fi
    if [ -f "Makefile" ]; then
        echo "✓ Makefile"
    fi

    # Config files
    configs=(".editorconfig" ".gitattributes" ".eslintrc.json")
    for file in "${configs[@]}"; do
        if [ -f "$file" ]; then
            echo "✓ $file"
        else
            echo "❌ $file missing"
        fi
    done

    # Test presence
    if [ -d "test" ] && [ -n "$(ls -A test/*.js 2>/dev/null)" ]; then
        echo "✓ Test suite present"
    else
        echo "❌ Test suite missing"
    fi

    echo ""
    echo "RSR compliance check complete"

# Show project statistics
stats:
    @echo "Project Statistics:"
    @echo ""
    @echo "Code:"
    @find . -name "*.js" -not -path "./node_modules/*" -not -path "./.git/*" | xargs wc -l | tail -1
    @echo ""
    @echo "Documentation:"
    @find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" | xargs wc -l | tail -1
    @echo ""
    @echo "Tests:"
    @find test -name "*.js" 2>/dev/null | xargs wc -l | tail -1 || echo "0 lines"
    @echo ""
    @echo "Files:"
    @find . -type f -not -path "./.git/*" -not -path "./node_modules/*" | wc -l

# Show git status
status:
    @echo "Git Status:"
    @git status --short
    @echo ""
    @echo "Branch:"
    @git branch --show-current
    @echo ""
    @echo "Recent commits:"
    @git log --oneline -5

# Create new branch for development
branch NAME:
    @echo "Creating new branch: {{NAME}}"
    git checkout -b "{{NAME}}"
    @echo "✓ Branch created and checked out"

# Show documentation files
docs:
    @echo "Documentation Files:"
    @ls -lh *.md .well-known/*.txt 2>/dev/null | awk '{print $9, "-", $5}' || echo "No docs found"

# Serve documentation locally (if python available)
docs-serve:
    @echo "Starting documentation server on http://localhost:8000"
    @echo "Press Ctrl+C to stop"
    python3 -m http.server 8000 2>/dev/null || python -m SimpleHTTPServer 8000

# Check for security issues
security-check:
    @echo "Running security checks..."
    @echo ""
    @echo "Checking for exposed secrets..."
    @git grep -i "password\|secret\|key\|token" -- '*.js' '*.json' || echo "  ✓ No secrets found in tracked files"
    @echo ""
    @echo "Checking .gitignore coverage..."
    @test -f .gitignore && echo "  ✓ .gitignore exists" || echo "  ❌ .gitignore missing"
    @echo ""
    @echo "Checking for TODO security items..."
    @git grep -i "TODO.*security\|FIXME.*security" || echo "  ✓ No security TODOs found"
    @echo ""
    @echo "✓ Security check complete"

# Update copyright year in all files
update-copyright YEAR:
    @echo "Updating copyright year to {{YEAR}}..."
    find . -type f -name "*.js" -o -name "*.md" | xargs sed -i '' 's/Copyright.*202[0-9]/Copyright {{YEAR}}/g'
    @echo "✓ Copyright updated"

# Create git commit with conventional commit format
commit MESSAGE:
    @echo "Creating commit: {{MESSAGE}}"
    git add .
    git commit -m "{{MESSAGE}}"
    @echo "✓ Commit created"

# Push to remote with tracking
push:
    @echo "Pushing to remote..."
    BRANCH=$(git branch --show-current) && \
    git push -u origin $$BRANCH
    @echo "✓ Push complete"

# Full workflow: validate, build, commit, push
ship MESSAGE: validate build
    @just commit "{{MESSAGE}}"
    @just push
    @echo "✓ Ship complete"

# Show help for common tasks
help:
    @echo "Common Just Recipes:"
    @echo ""
    @echo "  just build        - Build unsigned XPI"
    @echo "  just test         - Run test suite"
    @echo "  just validate     - Run lint + tests"
    @echo "  just rsr-check    - Check RSR compliance"
    @echo "  just clean        - Clean build artifacts"
    @echo "  just stats        - Show project statistics"
    @echo "  just help         - Show this help"
    @echo ""
    @echo "Development:"
    @echo "  just branch NAME  - Create new branch"
    @echo "  just commit MSG   - Create commit"
    @echo "  just push         - Push to remote"
    @echo "  just ship MSG     - Validate, build, commit, push"
    @echo ""
    @echo "Documentation:"
    @echo "  just docs         - List documentation files"
    @echo "  just docs-serve   - Serve docs locally (port 8000)"
    @echo ""
    @echo "Security:"
    @echo "  just security-check    - Check for security issues"
    @echo "  just check-env         - Verify environment variables"
    @echo ""
    @echo "For full recipe list: just --list"
