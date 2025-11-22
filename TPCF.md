# Tri-Perimeter Contribution Framework (TPCF)

## Overview

The **Tri-Perimeter Contribution Framework** (TPCF) is a graduated trust model for open source project governance. This document describes how TPCF is implemented in the Zotero Voyant Export project.

## Philosophy

TPCF balances two critical needs:
1. **Openness**: Welcoming all contributors regardless of background
2. **Security**: Protecting the project and its users

### Core Principles

- **Trust is earned**, not granted arbitrarily
- **Contributions speak louder** than credentials
- **Community alignment** matters as much as technical skill
- **Mistakes are learning opportunities**, not disqualifiers
- **Sustainability** over rapid growth

## The Three Perimeters

### Perimeter 3: Community Sandbox

**Status**: ✅ **Current perimeter for this project**

**Access Level**: Open to everyone

**Process**:
1. Fork the repository
2. Make changes in your fork
3. Submit pull request
4. Code review by maintainers
5. Merge if approved

**Requirements**:
- None! All are welcome
- Follow Code of Conduct
- Respect licensing (GPL-3.0)

**What You Can Do**:
- Submit pull requests
- Report issues
- Participate in discussions
- Review others' PRs (feedback welcome!)
- Help with documentation
- Answer questions

**What You Cannot Do**:
- Direct commits to main repository
- Merge pull requests
- Close issues
- Grant access to others
- Make releases

**Focus**: Demonstrating competence, learning the codebase, building trust

### Perimeter 2: Trusted Contributors

**Status**: Not yet established (project too young)

**Access Level**: Direct commit rights to feature branches

**Requirements**:
- **5+ merged PRs** of good quality
- **3+ months** of sustained contribution
- **Demonstrated understanding** of codebase
- **Alignment** with Code of Conduct and project values
- **Community respect**

**Process to Join**:
1. Meet requirements above
2. Self-nominate or be nominated by maintainer
3. Core team discusses (consensus preferred)
4. If approved, access granted and announced
5. Mentorship period (first 30 days)

**What You Gain**:
- Direct commit to feature branches
- Participate in design decisions
- Help triage issues
- Review pull requests with weight
- Mentor P3 contributors

**Responsibilities**:
- Uphold Code of Conduct
- Review PRs promptly
- Help newcomers
- Maintain code quality
- Communicate absences

**What You Still Cannot Do**:
- Commit to `main` branch
- Make releases
- Grant access to others
- Close security issues

### Perimeter 1: Core Team

**Status**: Founder only (Cora Johnson-Roberson)

**Access Level**: Full repository access

**Requirements**:
- **12+ months** as Perimeter 2 contributor
- **Demonstrated long-term commitment**
- **Deep codebase knowledge**
- **Community trust and respect**
- **Leadership qualities**

**Process to Join**:
1. Invitation by existing core team
2. Consensus among current core team
3. Public announcement
4. Transition period (30-60 days)

**Responsibilities**:
- Strategic direction
- Release management
- Security vulnerability response
- Grant access to P2 contributors
- Enforce governance
- Represent project externally

**Decision Authority**:
- Architecture changes
- Dependency additions
- Security policies
- Governance changes
- Conflict resolution (final say)

## Benefits of TPCF

### For Contributors

**Perimeter 3 (Everyone)**:
- Clear path to deeper involvement
- No gatekeeping based on background
- Learn at your own pace
- Mistakes are okay, reversibility is built-in

**Perimeter 2 (Trusted)**:
- Recognition of sustained contribution
- Increased influence on direction
- Faster iteration on features
- Community leadership role

**Perimeter 1 (Core)**:
- Strategic decision-making power
- Project stewardship
- Deep satisfaction from long-term commitment

### For the Project

- **Security**: Critical paths protected
- **Velocity**: Trusted contributors move faster
- **Sustainability**: Leadership pipeline
- **Quality**: Earned trust = proven competence
- **Community**: Welcoming to newcomers

## Comparison to Other Models

### vs. Single Maintainer
- **TPCF**: Distributes load, builds community
- **Single**: Bottleneck, burnout risk

### vs. Flat Open Access
- **TPCF**: Graduated trust, security boundaries
- **Flat**: Anyone can break things

### vs. Invite-Only
- **TPCF**: Open P3, earned P2/P1
- **Invite**: Gatekeeping, elitism

### vs. Corporate CLA
- **TPCF**: Trust-based, no legal barrier
- **CLA**: Legal friction, contributor hesitation

## Emotional Safety

TPCF explicitly prioritizes **emotional temperature** and psychological safety:

### For Perimeter 3 (New Contributors)

**Reduced Anxiety**:
- Clear expectations
- Can't "break" anything permanently
- PRs are reviewed, not auto-merged
- Mistakes are learning opportunities

**Increased Confidence**:
- Contributions valued at all skill levels
- Path to deeper involvement is clear
- Community welcomes questions
- Experimentation encouraged

### For Perimeter 2/1 (Maintainers)

**Sustainable Workload**:
- Can delegate to trusted contributors
- Not sole responsibility for everything
- Community helps with reviews and triage

**Reduced Burnout**:
- Clear boundaries on who can do what
- Security issues handled by small, trusted group
- Not all decisions on one person

## Security Implications

### Why Three Perimeters?

**Perimeter 3: Maximum Openness**
- Encourage contribution
- No barriers to participation
- Fork-and-PR prevents accidents

**Perimeter 2: Balanced Trust**
- Earned through sustained quality
- Feature branches reduce risk
- Still can't affect main or releases

**Perimeter 1: Maximum Security**
- Releases signed by core team
- Security issues handled privately
- Critical infrastructure protected

### Attack Surface

**P3 → P2 Promotion**:
- Attackers can't fast-track to P2
- Requires sustained, quality contribution
- Community watches for suspicious behavior

**P2 → P1 Promotion**:
- Very high bar (12+ months)
- Requires invitation (not application)
- Core team consensus required

**Compromise Mitigation**:
- P2 compromise: Limited to feature branches
- P1 compromise: Rare, but full access
- Response: Immediate access revocation

## Practical Examples

### Scenario: First-Time Contributor

**Sarah wants to fix a bug**:
1. Sarah forks the repo (P3 access)
2. Fixes bug in her fork
3. Submits PR with description
4. Maintainer reviews, provides feedback
5. Sarah addresses feedback
6. PR merged, Sarah's contribution in CHANGELOG
7. Sarah is now a contributor! 🎉

**Trust earned**: Bug fix shows competence

### Scenario: Regular Contributor

**Alex has submitted 8 PRs over 4 months**:
1. All PRs were high quality
2. Alex helps others in issues
3. Alex self-nominates for P2
4. Core team discusses: Consensus yes
5. Alex granted P2 access
6. Alex commits feature branch directly
7. Opens PR to main, still needs review
8. PR merged, feature ships

**Trust earned**: Sustained quality, community spirit

### Scenario: Long-Term Maintainer

**Jordan has been P2 for 15 months**:
1. Consistently excellent contributions
2. Mentors new contributors
3. Participates in all major discussions
4. Core team invites Jordan to P1
5. Jordan accepts
6. Jordan now co-maintainer
7. Helps with releases and security

**Trust earned**: Long-term commitment, leadership

## Comparison Table

| Capability | Perimeter 3 | Perimeter 2 | Perimeter 1 |
|------------|-------------|-------------|-------------|
| Fork repo | ✅ | ✅ | ✅ |
| Submit PRs | ✅ | ✅ | ✅ |
| Report issues | ✅ | ✅ | ✅ |
| Comment on PRs | ✅ | ✅ | ✅ |
| Review PRs | Encouraged | ✅ | ✅ |
| Commit to feature branch | ❌ | ✅ | ✅ |
| Merge PRs (from others) | ❌ | ❌ | ✅ |
| Commit to main | ❌ | ❌ | ✅ |
| Create releases | ❌ | ❌ | ✅ |
| Grant access | ❌ | ❌ | ✅ |
| Security response | Report | Support | ✅ Lead |
| Governance changes | Suggest | Discuss | ✅ Decide |

## Transitioning Between Perimeters

### P3 → P2

**Timeline**: Typically 3-6 months

**Indicators**:
- 5+ merged PRs
- Code quality consistently good
- Responsive to review feedback
- Helps others in community
- Aligns with Code of Conduct

**Process**:
1. Self-nominate or nominated by maintainer
2. Core team discusses (async or meeting)
3. Consensus decision (or vote if needed)
4. Access granted via GitHub teams
5. Announcement in README/discussions
6. Mentorship check-ins (first 30 days)

### P2 → P1

**Timeline**: Typically 12-18 months minimum

**Indicators**:
- Sustained P2 contribution (12+ months)
- Deep codebase knowledge
- Community leadership
- Security awareness
- Strategic thinking
- Long-term commitment

**Process**:
1. Invitation only (no applications)
2. Core team consensus required
3. Private discussion with candidate
4. Transition period (30-60 days)
5. Public announcement
6. Update MAINTAINERS.md

### Stepping Down

**Any perimeter → Lower or Emeritus**:
- Life happens, no shame in stepping back
- Communicate with team
- Transfer responsibilities
- Access revoked (security practice)
- Recognition maintained (emeritus status)
- Can return later if desired

## Metrics and Transparency

### What We Track

**For P2 Promotion**:
- Number of merged PRs
- PR quality (review comments, revisions)
- Community interaction (issue help, PR reviews)
- Time span of contribution
- Code of Conduct alignment

**For P1 Invitation**:
- P2 tenure duration
- Leadership demonstrations
- Community trust signals
- Strategic contributions
- Security awareness

### What We Don't Track

- Lines of code (quality over quantity)
- Commit count (can be misleading)
- Issue count (easy to game)
- Credentials (meritocracy, not credentialism)

## FAQ

**Q: Can I skip from P3 to P1?**
A: Extremely rare. Usually requires extraordinary circumstances and unanimous core team agreement.

**Q: What if I disagree with a P3 → P2 decision?**
A: Raise concern with core team. Decisions are reversible if new information emerges.

**Q: Can P2 access be revoked?**
A: Yes, if Code of Conduct violated or trust broken. Process: warning, suspension, revocation.

**Q: How long does P2 → P1 take?**
A: Minimum 12 months, often 18-24. Quality over speed.

**Q: Can organizations/companies be P2/P1?**
A: No, only individuals. But we welcome corporate-sponsored contributors!

**Q: What if core team disagrees on promotion?**
A: Consensus preferred. If impossible, may delay decision or require supermajority.

**Q: Is there a P4 or P0?**
A: No. Three perimeters balance openness and security adequately.

## Related Documents

- **CODE_OF_CONDUCT.md**: Behavior standards for all perimeters
- **CONTRIBUTING.md**: How to contribute (P3 entry point)
- **MAINTAINERS.md**: Current maintainers and governance
- **SECURITY.md**: Security policies and reporting

## References

- Rhodium Standard Repository (RSR) framework
- Collaborative Community Code Principles (CCCP)
- [Project governance patterns](https://opensource.guide/leadership-and-governance/)
- [Graduated access models](https://en.wikipedia.org/wiki/Trust_metric)

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11 | 1.0 | Initial TPCF documentation |

---

**Last Updated**: November 2025
**Next Review**: February 2026
**Status**: Perimeter 3 (Community Sandbox) - Open to all!
