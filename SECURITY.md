# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Unreleased (main) | :white_check_mark: |
| < 1.0   | :x:                |

**Note**: This project is currently in development. Version 1.0 has not been released yet.

## Security Principles

This project follows the Rhodium Standard Repository (RSR) security framework:

1. **Defense in Depth**: Multiple layers of security controls
2. **Secure by Default**: Security features enabled without configuration
3. **Least Privilege**: Minimal permissions required
4. **Fail Secure**: Errors default to secure state
5. **Input Validation**: All external data validated
6. **Output Encoding**: All output properly encoded
7. **Security Logging**: Security events logged for audit

## Known Security Considerations

### XML Injection Prevention
- **Risk**: User metadata could inject malicious XML
- **Mitigation**: Entity escaping for `<`, `>`, `&` in `lib/format.js`
- **Status**: ✅ Implemented and tested

### Path Traversal Prevention
- **Risk**: Malicious filenames could write outside intended directory
- **Mitigation**: Filename sanitization in `lib/ui.js` removing `/\:*?"<>|`
- **Status**: ✅ Implemented

### Input Validation
- **Risk**: Null/undefined values causing crashes
- **Mitigation**: Parameter validation on all public function boundaries
- **Status**: ✅ Implemented

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow responsible disclosure:

### Where to Report

**Email**: security@[project-domain].org (or create private security advisory on GitHub)

**Please DO NOT** open public issues for security vulnerabilities.

### What to Include

1. **Description**: Clear description of the vulnerability
2. **Impact**: What an attacker could do
3. **Steps to Reproduce**: Detailed reproduction steps
4. **Proof of Concept**: Code or commands demonstrating the issue
5. **Suggested Fix**: If you have one (optional)
6. **Your Contact**: For follow-up questions

### Example Report

```
Subject: [SECURITY] XML Injection in Metadata Export

Description: User-supplied metadata is not properly escaped when generating
MODS XML, allowing injection of arbitrary XML elements.

Impact: An attacker could inject malicious XML that breaks parsing or
includes unintended elements.

Steps to Reproduce:
1. Create Zotero item with title: "Test <script>alert('xss')</script>"
2. Export collection
3. Examine MODS.bin in resulting ZIP
4. Observe unescaped script tag

Proof of Concept:
[Include code or screenshots]

Suggested Fix:
Escape special characters before XML serialization in lib/format.js:mapProperty()
```

### Response Timeline

- **24 hours**: Acknowledge receipt
- **7 days**: Initial assessment and severity classification
- **30 days**: Provide fix or mitigation (for high/critical issues)
- **90 days**: Public disclosure (coordinated with reporter)

### Severity Classification

| Severity | Description | Examples |
|----------|-------------|----------|
| **Critical** | Remote code execution, privilege escalation | Arbitrary file write, command injection |
| **High** | Significant data exposure or integrity violation | XML injection, path traversal |
| **Medium** | Limited impact requiring user interaction | XSS in error messages |
| **Low** | Minimal security impact | Information disclosure |

## Security Update Process

1. **Assessment**: Verify and classify the vulnerability
2. **Fix Development**: Create patch on private branch
3. **Testing**: Comprehensive testing including security tests
4. **Disclosure**: Coordinate disclosure with reporter
5. **Release**: Publish security advisory and patched version
6. **Notification**: Announce via GitHub Security Advisories

## Security Best Practices for Contributors

### Code Review Checklist

- [ ] Input validation on all external data
- [ ] Output encoding for XML, HTML, shell commands
- [ ] No use of `eval()` or dynamic code execution
- [ ] Path operations validated against traversal
- [ ] Error messages don't leak sensitive information
- [ ] Secrets not committed to repository
- [ ] Dependencies reviewed for known vulnerabilities

### Testing Requirements

- [ ] Security test cases for input validation
- [ ] Injection attack test cases
- [ ] Error handling test cases
- [ ] Fuzzing for unexpected inputs (if applicable)

## Security Scanning

This project uses:
- **ESLint**: Static code analysis for common vulnerabilities
- **Manual Review**: All security-sensitive code manually reviewed
- **Dependency Scanning**: Monitor for vulnerable dependencies (planned)

## Security Contacts

- **Project Maintainer**: See MAINTAINERS.md
- **Security Team**: security@[project-domain].org
- **Upstream (Zotero)**: https://www.zotero.org/support/reporting_bugs

## Hall of Fame

We recognize security researchers who responsibly disclose vulnerabilities:

<!--
| Researcher | Vulnerability | Date | Severity |
|------------|---------------|------|----------|
| (None yet) | - | - | - |
-->

Thank you to all security researchers who help keep this project safe!

## Legal

- **No Legal Action**: We will not pursue legal action against researchers who follow this policy
- **Good Faith**: Act in good faith to avoid privacy violations, data destruction, and service interruption
- **Compliance**: This policy complies with responsible disclosure guidelines

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [RFC 9116 security.txt](https://www.rfc-editor.org/rfc/rfc9116.html)
- [Responsible Disclosure Guidelines](https://en.wikipedia.org/wiki/Responsible_disclosure)

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11 | 1.0 | Initial security policy |

---

**Last Updated**: November 2025
**Next Review**: February 2026 (quarterly review cycle)
