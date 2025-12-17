;; zotero-voyant-export - Guix Package Definition
;; Run: guix shell -D -f guix.scm

(use-modules (guix packages)
             (guix gexp)
             (guix git-download)
             (guix build-system gnu)
             ((guix licenses) #:prefix license:)
             (gnu packages base))

(define-public zotero_voyant_export
  (package
    (name "zotero-voyant-export")
    (version "0.0.4")
    (source (local-file "." "zotero-voyant-export-checkout"
                        #:recursive? #t
                        #:select? (git-predicate ".")))
    (build-system gnu-build-system)
    (synopsis "Guix channel/infrastructure")
    (description "Guix channel/infrastructure - part of the RSR ecosystem.")
    (home-page "https://github.com/hyperpolymath/zotero-voyant-export")
    (license license:agpl3+)))

;; Return package for guix shell
zotero_voyant_export
