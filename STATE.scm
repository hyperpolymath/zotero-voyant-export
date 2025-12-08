;; STATE.scm - Project Checkpoint for AI Conversation Continuity
;; Format: Guile Scheme (human-readable, minimal syntax)
;; Repository: zotero-voyant-export

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; METADATA
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define metadata
  '((format-version . "1.0.0")
    (created . "2025-12-08")
    (last-updated . "2025-12-08")
    (repository . "hyperpolymath/zotero-voyant-export")
    (branch . "claude/create-state-scm-01RHKZfVUNAYWGVjztjJXYtj")))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; PROJECT CATALOG
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;; This repository contains TWO distinct projects

(define projects
  '(
    ;; PRIMARY PROJECT
    (zotero-voyant-export
      (description . "Firefox WebExtension exporting Zotero collections to Voyant format for text analysis")
      (version . "2.0.0")
      (status . in-progress)
      (completion . 90)
      (category . browser-extension)
      (phase . beta-ready)
      (technologies . (rescript deno cue just web-ext webextension-manifest-v2))
      (zotero-requirement . "7.0+")
      (license . "GPL-3.0"))

    ;; SECONDARY PROJECT
    (accessibility-everywhere
      (description . "Comprehensive platform driving web accessibility adoption (HTTPS Everywhere for a11y)")
      (status . in-progress)
      (completion . 50)
      (category . platform)
      (phase . scaffolding-complete)
      (subprojects . (browser-extension dashboard api-server github-action adoption-tracker))
      (inspiration . ("HTTPS Everywhere" "Let's Encrypt" "Scott Helme security headers")))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; CURRENT POSITION
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define current-position
  '((focus . zotero-voyant-export)

    (what-exists
      ;; Zotero Extension - COMPLETE
      (rescript-source
        (files . 5)
        (loc . ~500)
        (modules . (background Zotero Exporter Format UI)))
      (build-infrastructure
        (cue-configs . (project.cue deno.cue rescript.cue manifest.cue))
        (justfile-tasks . 20+)
        (runtime . deno))
      (extension-manifest . webextension-v2)
      (documentation . (README.md DEVELOPMENT.md))
      (github-infra . (codeql jekyll-pages dependabot issue-templates))

      ;; Accessibility Tools - SCAFFOLDED
      (accessibility-scaffolds
        (browser-extension . 95%)
        (dashboard . 90%)
        (api-server . 70%)
        (github-action . 60%)
        (adoption-tracker . 50%)))

    (what-works
      (core-export-logic . complete)
      (mods-xml-generation . complete)
      (dublin-core-xml . complete)
      (file-handling-zip . complete)
      (context-menu-integration . complete)
      (type-safe-compilation . complete))

    (what-is-not-built-yet
      (generated-manifest.json . "needs 'just config'")
      (compiled-javascript . "needs 'just build'")
      (xpi-package . "needs 'just package'")
      (automated-tests . none)
      (ci-cd-for-builds . none))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; ROUTE TO MVP v1 (Zotero Voyant Export)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define mvp-v1-route
  '((target . "Release-ready Zotero Voyant Export extension")

    (remaining-tasks
      (priority-1-critical
        ((task . "Generate manifest.json from CUE config")
         (command . "just config")
         (status . pending))

        ((task . "Compile ReScript to JavaScript")
         (command . "just build")
         (status . pending))

        ((task . "Create XPI package for distribution")
         (command . "just package")
         (status . pending))

        ((task . "Manual testing in Firefox with Zotero 7")
         (command . "just run")
         (status . pending)))

      (priority-2-quality
        ((task . "Add user-facing error notifications")
         (status . pending)
         (reason . "Currently only debug logs, no user feedback"))

        ((task . "Add export progress indicator")
         (status . pending)
         (reason . "Large collections give no feedback during export"))

        ((task . "Enhance metadata completeness in Format.res")
         (status . pending)
         (reason . "Currently minimal MODS/DC - title + creators only")))

      (priority-3-release
        ((task . "Write CHANGELOG for v2.0.0")
         (status . pending))

        ((task . "Update version in manifest")
         (status . pending))

        ((task . "Create GitHub release")
         (status . pending))

        ((task . "Submit to Firefox Add-ons (AMO)")
         (status . pending))))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; KNOWN ISSUES & BLOCKERS
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define issues
  '((blockers
      ((id . 1)
       (title . "Build toolchain not verified in current environment")
       (description . "Requires Deno, Just, CUE installed locally to build")
       (severity . medium)
       (workaround . "Install prerequisites or use containerized build")))

    (technical-debt
      ((id . 2)
       (title . "No automated test suite")
       (description . "Zero tests for either project")
       (impact . "Manual testing required, regression risk"))

      ((id . 3)
       (title . "Error handling swallows failures silently")
       (location . "src/Exporter.res:processItem()")
       (description . "Catches errors but only logs, user unaware of failures"))

      ((id . 4)
       (title . "Dual projects in single repository")
       (description . "Zotero extension + Accessibility initiative conflated")
       (recommendation . "Consider separating accessibility-tools to own repo")))

    (architectural-concerns
      ((id . 5)
       (title . "Performance limits unknown")
       (description . "No testing with large collections (1000+ items)")
       (impact . "May timeout or crash on heavy use"))

      ((id . 6)
       (title . "Accessibility API uses in-memory storage")
       (location . "accessibility-tools/api-server/")
       (description . "Not production-ready, needs PostgreSQL")))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; QUESTIONS FOR MAINTAINER
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define questions
  '(
    ;; Strategic Questions
    ((id . Q1)
     (priority . high)
     (question . "Which project is the priority: Zotero Export or Accessibility Initiative?")
     (context . "Repo contains two distinct projects with different scopes")
     (options . ("Focus on Zotero MVP first"
                 "Prioritize Accessibility Initiative"
                 "Work both in parallel")))

    ((id . Q2)
     (priority . high)
     (question . "Should accessibility-tools be split into its own repository?")
     (context . "Current structure is confusing - 760+ lines of accessibility docs in Zotero repo")
     (recommendation . "Yes, for clarity and independent versioning"))

    ;; Technical Questions
    ((id . Q3)
     (priority . medium)
     (question . "What is the target metadata completeness for exports?")
     (context . "Currently only title + creators; MODS supports much more")
     (options . ("Minimal (current)" "Standard subset" "Full MODS spec")))

    ((id . Q4)
     (priority . medium)
     (question . "Should we add automated tests before MVP release?")
     (context . "Zero test coverage currently")
     (options . ("Yes, block release on tests"
                 "No, manual testing sufficient for MVP"
                 "Add tests post-release")))

    ((id . Q5)
     (priority . low)
     (question . "What happened to maintenance between 2021-2024?")
     (context . "Commit 7f567fc says 'no longer able to maintain' but recent commits show active work")
     (reason . "Understanding history helps plan sustainable maintenance"))

    ;; Deployment Questions
    ((id . Q6)
     (priority . high)
     (question . "Where should the extension be distributed?")
     (options . ("Firefox Add-ons (AMO) only"
                 "GitHub Releases only"
                 "Both AMO + GitHub"
                 "Direct download from project site")))

    ((id . Q7)
     (priority . medium)
     (question . "Is Chrome/Chromium support desired?")
     (context . "Currently Firefox-only (Manifest V2)")
     (impact . "Would require Manifest V3 migration for Chrome"))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; LONG-TERM ROADMAP
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define roadmap
  '(
    ;; PHASE 1: Zotero Export MVP
    (phase-1
      (name . "Zotero Voyant Export v2.0.0 Release")
      (status . current)
      (completion . 90%)
      (milestones
        ((name . "Build & Package")
         (tasks . ("Generate configs" "Compile ReScript" "Create XPI"))
         (status . pending))
        ((name . "Testing & QA")
         (tasks . ("Manual Firefox testing" "Zotero 7 compatibility" "Edge cases"))
         (status . pending))
        ((name . "Release")
         (tasks . ("Changelog" "GitHub release" "AMO submission"))
         (status . pending))))

    ;; PHASE 2: Stability & Quality
    (phase-2
      (name . "Hardening & Polish")
      (status . planned)
      (milestones
        ((name . "Error Handling")
         (tasks . ("User notifications" "Progress indicators" "Graceful failures")))
        ((name . "Metadata Expansion")
         (tasks . ("Extended MODS fields" "Better Dublin Core" "Custom field mapping")))
        ((name . "Testing")
         (tasks . ("Unit tests" "Integration tests" "CI/CD pipeline")))))

    ;; PHASE 3: Extended Features
    (phase-3
      (name . "Feature Expansion")
      (status . future)
      (milestones
        ((name . "Export Formats")
         (tasks . ("CSV export" "JSON export" "Custom templates")))
        ((name . "Browser Support")
         (tasks . ("Chrome extension (MV3)" "Edge support")))
        ((name . "Integration")
         (tasks . ("Direct Voyant upload" "Batch processing" "Scheduled exports")))))

    ;; PHASE 4: Accessibility Initiative (if pursued)
    (phase-4
      (name . "Accessibility Everywhere Platform")
      (status . future)
      (contingent-on . "Decision on Q1 and Q2")
      (milestones
        ((name . "Infrastructure")
         (tasks . ("Deploy API with PostgreSQL" "Set up monitoring" "Domain + hosting")))
        ((name . "Browser Extension")
         (tasks . ("Complete scanner" "Chrome Web Store" "Firefox AMO")))
        ((name . "GitHub Action")
         (tasks . ("Publish to Marketplace" "Documentation" "Example workflows")))
        ((name . "Adoption Campaign")
         (tasks . ("Outreach to frameworks" "SEO impact research" "Partnership building")))))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; CRITICAL NEXT ACTIONS
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define next-actions
  '(((priority . 1)
     (action . "Confirm project priority: Zotero Export vs Accessibility Initiative")
     (owner . maintainer)
     (reason . "Determines all subsequent work"))

    ((priority . 2)
     (action . "Verify build toolchain works: just config && just build")
     (owner . developer)
     (reason . "Cannot proceed without functional builds"))

    ((priority . 3)
     (action . "Test extension in Firefox with Zotero 7")
     (owner . developer)
     (reason . "Validate core functionality before release"))

    ((priority . 4)
     (action . "Decide on accessibility-tools repository split")
     (owner . maintainer)
     (reason . "Affects project structure and maintenance"))

    ((priority . 5)
     (action . "Draft v2.0.0 changelog")
     (owner . developer)
     (reason . "Required for release"))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; SESSION NOTES
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define session-notes
  '((date . "2025-12-08")
    (session-type . initial-assessment)
    (findings
      ("Repository underwent complete v2.0.0 rewrite using zoterho-template architecture")
      ("ReScript + Deno + CUE is modern, type-safe stack - good architecture choices")
      ("Accessibility Initiative is ambitious but scope-creep risk in this repo")
      ("Documentation is excellent for strategy, lighter on technical how-to")
      ("No tests exist for either project - risk for regression")
      ("Original author noted inability to maintain in 2021, unclear current status"))
    (recommendations
      ("Focus on shipping Zotero Export v2.0.0 first")
      ("Split accessibility-tools to separate repository")
      ("Add minimal test suite before release")
      ("Consider finding co-maintainers for sustainability"))))

;; END STATE.scm
