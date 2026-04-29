import type { ReportType } from "./types";

export const CACHED_OPERATIONAL_REPORT = (timestamp: string) => `# TLP:RED — FOR NAMED RECIPIENTS ONLY

# OPERATIONAL / TACTICAL INTELLIGENCE BRIEF
## TeamPCP Supply Chain Campaign — LiteLLM Compromise
**Cycle:** #0001 | **Classification:** TLP:RED | **Generated:** ${timestamp} | **Priority:** CRITICAL

---

## 1. Threat Summary

We assess with high confidence that the threat actor TeamPCP executed a sophisticated multi-stage supply chain attack culminating in the compromise of the LiteLLM Python package (versions 1.82.7 and 1.82.8) on the Python Package Index (PyPI) on March 24, 2026. The attack originated from a prior compromise of the Trivy security scanner (CVE-2026-33634, CVSS 9.4), which was exploited to harvest CI/CD credentials from LiteLLM's GitHub Actions pipeline. TeamPCP is assessed to be a financially-motivated extortion crew with possible links to LAPSUS$, based on shared infrastructure patterns and operational tradecraft observed by Datadog Security Labs and Trend Micro researchers.

The malicious LiteLLM versions were available on PyPI for approximately three hours (10:39 UTC to ~16:00 UTC) before being quarantined. Given LiteLLM's approximately 3.4 million daily downloads and its position as a centralized LLM API gateway — storing credentials for OpenAI, Anthropic, Google, and other providers — the blast radius of this compromise is assessed as severe. Version 1.82.8 is particularly dangerous: the malicious .pth file executes automatically when the Python interpreter starts, meaning any Python script, test runner, or tool in an environment with litellm installed silently triggers the credential harvester.

## 2. Affected Organizational Assets

Based on our asset inventory and dependency analysis, the following systems are directly or indirectly affected:

- **api-gateway-prod (AST-0001)** — CRITICAL EXPOSURE. This asset runs LiteLLM Proxy v1.82.x and is confirmed to be directly vulnerable. It serves as our centralized LLM routing gateway, storing API keys for all major LLM providers. If the compromised version was installed during the exposure window, all stored provider credentials must be considered compromised. Risk Score: 9.4/10.
- **cicd-runner-pool (AST-0003)** — HIGH EXPOSURE. Our GitHub Actions self-hosted runners use Trivy for security scanning in the CI pipeline. If trivy-action pulled the compromised v0.69.4 release, runner environment variables — including PyPI publish tokens, GitHub PATs, and deployment credentials — were likely exfiltrated. Risk Score: 8.1/10.
- **k8s-ml-cluster (AST-0002)** — HIGH EXPOSURE. The malicious payload includes modules specifically designed for Kubernetes lateral movement via privileged pod deployment. If any node in our ML cluster had the compromised LiteLLM version, the attacker could deploy pods across all nodes using harvested service account tokens. Risk Score: 7.8/10.
- **dev-workstations (AST-0004)** — MODERATE EXPOSURE. Developer machines running pip install without pinned versions during the exposure window may have pulled the compromised release. The payload harvests SSH keys, .env files, cloud credentials, shell history, and cryptocurrency wallet files from local filesystems. Risk Score: 6.5/10.
- **secrets-vault (AST-0005)** — INDIRECT EXPOSURE. If credentials harvested from runners or workstations include Vault tokens or AWS IAM keys with Secrets Manager access, the entire secrets infrastructure is at risk. The payload specifically queries AWS instance metadata and SSM Parameter Store. Risk Score: 5.2/10 (elevated to 7.0 if runner compromise is confirmed).
- **oracle-findb-prod (AST-0010)** — INDIRECT EXPOSURE. Database connection strings stored in environment files on compromised dev workstations or CI runners could provide direct access to financial transaction data. Risk Score: 8.5/10 if credentials are confirmed exfiltrated.

## 3. ATT&CK Technique Mapping

- **T1195.002 — Compromise Software Supply Chain** (Initial Access): TeamPCP compromised the upstream Trivy security scanner to harvest CI/CD credentials, then used those credentials to publish malicious versions of LiteLLM directly to PyPI. This represents a cascading supply chain attack spanning five ecosystems: GitHub Actions, Docker Hub, npm, OpenVSX, and PyPI.
- **T1078 — Valid Accounts** (Initial Access / Persistence): Stolen PyPI publishing tokens were used to authenticate as the legitimate LiteLLM maintainer and publish malicious releases. The attacker exploited valid credentials obtained from the Trivy compromise rather than brute-forcing or phishing.
- **T1059.006 — Command and Scripting Interpreter: Python** (Execution): The malicious payload was embedded as Python code within the package's proxy_server.py and as a .pth file (litellm_init.pth) that executes automatically when the Python interpreter starts, requiring no explicit import.
- **T1555 — Credentials from Password Stores** (Credential Access): The credential harvester systematically targets password stores, SSH key directories (~/.ssh/), cloud provider credential files (~/.aws/credentials, ~/.config/gcloud/), and Kubernetes configuration files (~/.kube/config).
- **T1552.001 — Unsecured Credentials: Credentials in Files** (Credential Access): The payload scans for plaintext credentials in .env files, configuration files, shell history (.bash_history, .zsh_history), Docker configs, and CI/CD pipeline configuration files.
- **T1041 — Exfiltration Over C2 Channel** (Exfiltration): Harvested credentials are packaged as tpcp.tar.gz, encrypted, and exfiltrated via HTTP POST to attacker-controlled infrastructure at models.litellm[.]cloud with the header X-Filename: tpcp.tar.gz.
- **T1573 — Encrypted Channel** (Command and Control): Exfiltrated data is encrypted using a hybrid scheme: AES-256 session key for bulk data encryption, wrapped with RSA-4096 public key, making interception and recovery of stolen data extremely difficult without the attacker's private key.
- **T1053.006 — Scheduled Task/Job: Systemd Timers** (Persistence): The third-stage payload installs a persistent systemd service that periodically contacts the C2 server (83.142.209[.]203:8080), downloads new payloads, and maintains long-term access while blending in with normal system processes.
- **T1610 — Deploy Container** (Defense Evasion / Lateral Movement): Kubernetes-specific modules deploy privileged pods (named node-setup-* in kube-system namespace) across cluster nodes, enabling lateral movement and persistence within containerized environments.
- **T1071.001 — Application Layer Protocol: Web Protocols** (Command and Control): All C2 communication uses standard HTTP/HTTPS protocols to blend with normal web traffic, making network-based detection more challenging.

## 4. Indicators of Compromise

**Malicious Domains:**
- \`models.litellm[.]cloud\` (primary exfiltration endpoint — NOT an official BerriAI/LiteLLM domain)
- \`checkmarx[.]zone\` (impersonation domain used in Checkmarx KICS attack phase)

**IP Addresses:**
- \`83.142.209[.]203\` (secondary exfiltration and backdoor C2 server, port 8080)

**Malicious Files:**
- \`litellm_init.pth\` (34,628 bytes, double base64-encoded, placed in site-packages/ — auto-executes on Python interpreter start)
- \`proxy_server.py\` (modified LiteLLM proxy module with embedded credential harvester — executes on proxy import)

**Malicious Packages (PyPI — now removed):**
- \`litellm==1.82.7\` (malicious code in proxy_server.py, executes on import)
- \`litellm==1.82.8\` (malicious .pth file, executes on ANY Python invocation — higher risk)
- \`telnyx==4.87.1\` (related compromise, March 27, executes at import time)
- \`telnyx==4.87.2\` (related compromise, executes at import time)

**CVEs:**
- \`CVE-2026-33634\` (Trivy security scanner — CVSS 9.4 — initial access vector for the entire campaign)

**Exfiltration Indicators:**
- Outbound HTTP POST requests with header \`X-Filename: tpcp.tar.gz\`
- Encrypted payloads using RSA-4096 wrapped AES-256 keys
- Unusual outbound traffic from CI/CD runner environments or Python development environments

**Kubernetes Indicators:**
- Pods named \`node-setup-*\` in kube-system namespace
- Privileged pods with hostPID and hostNetwork access
- Unexpected service account token access across namespaces

## 5. Organizational Relevance

This threat is directly relevant to our organization for three critical reasons. First, our api-gateway-prod asset runs LiteLLM as our centralized AI proxy — this is the exact software that was compromised, and our gateway stores API credentials for every LLM provider we use. Second, our CI/CD pipeline (AST-0003) uses Trivy for security scanning, which is the initial access vector TeamPCP exploited to begin the entire campaign. Third, our Kubernetes ML cluster (AST-0002) matches the exact target profile for the payload's lateral movement modules.

Given our financial services sector positioning and the volume of sensitive data flowing through our AI pipeline, the consequences of credential compromise extend beyond the immediate technical impact to regulatory notification requirements, potential fraud exposure, and customer data protection obligations.

## 6. Kill Chain Analysis

1. **Reconnaissance**: TeamPCP identified Trivy as a security scanning dependency in LiteLLM's CI/CD pipeline, recognizing that compromising a security tool would provide access to privileged CI/CD environments.
2. **Weaponization**: The threat actor developed a multi-stage payload with three components: a credential harvester targeting 15+ credential types, a Kubernetes lateral movement module, and a persistent systemd backdoor. The payload uses AES-256/RSA-4096 hybrid encryption for exfiltration.
3. **Delivery**: On March 19, TeamPCP rewrote Git tags in the trivy-action GitHub Action repository to point to a malicious release (v0.69.4). When LiteLLM's CI/CD pipeline ran Trivy, the compromised action exfiltrated the PYPI_PUBLISH token from the GitHub Actions runner environment.
4. **Exploitation**: On March 24, using the stolen PyPI token, TeamPCP published litellm versions 1.82.7 and 1.82.8 to PyPI. Any developer or CI system running pip install litellm without a pinned version received the malicious package.
5. **Installation**: Version 1.82.7 embedded malware in proxy_server.py (activated on import). Version 1.82.8 added litellm_init.pth to site-packages, which Python executes automatically on interpreter startup — even during pip install of other packages.
6. **Command & Control**: Stolen data is encrypted and POSTed to \`models.litellm[.]cloud\`. The systemd backdoor maintains persistent access via 83.142.209[.]203:8080, downloading and executing new payloads on a timer.
7. **Actions on Objectives**: Credential harvesting across SSH, cloud, Kubernetes, and development environments. Lateral movement via privileged Kubernetes pods. Establishment of persistent backdoor access for future operations.

## 7. Recommended Actions

**P1 — IMMEDIATE (within 24 hours):**
- Block all network traffic to \`models.litellm[.]cloud\`, \`checkmarx[.]zone\`, and \`83.142.209[.]203\` at the perimeter firewall and DNS level
- Audit all systems for the presence of \`litellm_init.pth\` and modified \`proxy_server.py\` files
- Check if litellm 1.82.7 or 1.82.8 was installed on any system between March 24 10:39 UTC and 16:00 UTC
- If compromised versions found: treat the entire host as compromised, isolate it, and begin forensic investigation
- Rotate ALL credentials accessible from any potentially compromised system (API keys, SSH keys, cloud credentials, database passwords, Vault tokens)
- Check Kubernetes clusters for unauthorized pods named \`node-setup-*\` in kube-system namespace

**P2 — SHORT-TERM (within 72 hours):**
- Upgrade LiteLLM to v1.83.0 or later on clean, isolated environments (do NOT upgrade in-place on potentially compromised systems)
- Audit all GitHub Actions workflows for use of trivy-action and pin to verified, safe versions
- Review and rotate all PyPI publishing tokens and GitHub PATs
- Implement pip hash-checking mode for all CI/CD package installations
- Deploy network monitoring rules for the exfiltration indicators listed above

**P3 — MEDIUM-TERM (within 30 days):**
- Implement dependency pinning with hash verification across all Python projects
- Deploy runtime application monitoring to detect anomalous credential access patterns
- Conduct a comprehensive audit of all third-party dependencies in critical pipelines
- Evaluate and implement a private PyPI mirror with automated malware scanning
- Review and harden Kubernetes RBAC to prevent privilege escalation via pod deployment

## 8. Compliance Implications

- **PCI DSS (Requirement 6.3, 6.5)**: If cardholder data environments share credentials with compromised systems, this constitutes a potential breach requiring immediate notification to the acquiring bank and a PCI forensic investigation. Requirement 6.3.2 specifically mandates inventory and management of third-party software components.
- **NIST RMF (SI-7, SA-12, CM-14)**: Software integrity verification (SI-7) and supply chain protection (SA-12) controls are directly implicated. Organizations must verify that compromised software was not integrated into protected information systems and document the incident per incident response procedures.
- **SOX (Section 302, 404)**: If financial reporting systems are connected to compromised infrastructure (e.g., oracle-findb-prod via harvested credentials), material weakness in internal controls over financial reporting may need to be disclosed.
- **GDPR (Articles 33, 34)**: If European citizens' personal data was accessible from compromised systems, the 72-hour breach notification clock starts from the moment of awareness.

## 9. Confidence Assessment

- **HIGH confidence**: The LiteLLM compromise occurred as described. The malicious packages were confirmed by multiple independent security firms (Snyk, Datadog, Trend Micro, Sonatype, Kaspersky). CVE-2026-33634 is assigned and scored.
- **HIGH confidence**: Our api-gateway-prod asset runs an affected version of LiteLLM and was potentially exposed.
- **MODERATE confidence**: The full scope of credential exfiltration from our environment is not yet determined. Forensic analysis of runner logs and network traffic is ongoing.
- **LOW confidence**: Whether TeamPCP has already utilized any harvested credentials for secondary access. No confirmed post-compromise activity has been detected in our environment to date, but absence of evidence is not evidence of absence.

## 10. Intelligence Gaps

- The precise window during which our CI/CD runners may have executed the compromised Trivy action has not been confirmed against runner logs.
- We do not have complete visibility into which developer workstations may have installed the compromised LiteLLM versions as transitive dependencies.
- TeamPCP's full infrastructure and operational capacity remain partially unknown — the campaign has demonstrated five distinct phases across five ecosystems, and additional phases may be planned.
- The relationship between TeamPCP and LAPSUS$ remains unconfirmed, based on shared infrastructure patterns rather than direct attribution.

## 11. Sources

1. LiteLLM Official Security Update — https://docs.litellm.ai/blog/security-update-march-2026
2. Datadog Security Labs — Full Campaign Analysis — https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/
3. Snyk Technical Analysis — https://snyk.io/blog/poisoned-security-scanner-backdooring-litellm/
4. Trend Micro Research — https://www.trendmicro.com/en_us/research/26/c/inside-litellm-supply-chain-compromise.html
5. Sonatype Advisory (sonatype-2026-001357) — https://www.sonatype.com/blog/compromised-litellm-pypi-package-delivers-multi-stage-credential-stealer
6. Kaspersky Analysis — https://www.kaspersky.com/blog/critical-supply-chain-attack-trivy-litellm-checkmarx-teampcp/55510/
7. MITRE ATT&CK — Supply Chain Compromise — https://attack.mitre.org/techniques/T1195/002/
8. NVD — CVE-2026-33634 — https://nvd.nist.gov/vuln/detail/CVE-2026-33634
`;

export const CACHED_STRATEGIC_REPORT = (timestamp: string) => `# TLP:AMBER+STRICT — RESTRICTED TO THE ORGANIZATION ONLY

# STRATEGIC INTELLIGENCE BRIEF
## TeamPCP Supply Chain Campaign — Executive Assessment
**Cycle:** #0001 | **Classification:** TLP:AMBER+STRICT | **Generated:** ${timestamp} | **Priority:** CRITICAL

---

## 1. Executive Summary

A supply chain attack by the threat actor TeamPCP compromised LiteLLM, the AI proxy library at the center of our machine learning infrastructure, on March 24, 2026. Our production AI gateway, CI/CD pipeline, and Kubernetes cluster are directly exposed. We assess with high confidence that credentials stored on or accessible from these systems should be considered compromised pending forensic confirmation. Leadership must decide within 48 hours whether to authorize a full-scope incident response, accelerate our supply chain security program, and determine regulatory notification obligations across PCI DSS, SOX, and GDPR.

## 2. Business Impact Assessment

The financial exposure from this incident operates across four dimensions. First, **operational disruption**: our AI gateway routes all LLM-powered features in production — if we take it offline for remediation, customer-facing AI capabilities go dark, affecting revenue-generating services that process an estimated 2.1 million API calls daily. Second, **data exposure risk**: the credential harvester targeted API keys, cloud credentials, SSH keys, and Kubernetes secrets. If exfiltrated, these credentials provide access to our model training data, customer interaction logs, and potentially our financial transaction database (oracle-findb-prod). Third, **regulatory penalties**: depending on what data was accessible via compromised credentials, we face potential notification requirements under PCI DSS (fines up to $100,000/month), GDPR (up to 4% of annual global revenue), and SOX (material weakness disclosure). Fourth, **reputational damage**: a breach involving our AI infrastructure would undermine customer trust in our AI-powered products and could trigger negative press coverage at a time when AI security is under intense public scrutiny.

The total financial exposure, combining remediation costs, potential fines, customer notification expenses, and business disruption, is estimated in the range of $2-15 million depending on the scope of confirmed data access.

## 3. Sector Relevance

The financial services industry is the most targeted sector for supply chain attacks, and this incident represents an emerging threat vector — the compromise of AI/ML infrastructure components. LiteLLM is used by an estimated 15,000+ organizations globally, many of them in fintech and financial services. The attack is notable because it targeted a component that sits between applications and multiple AI service providers, meaning a single compromise exposed credentials for OpenAI, Anthropic, Google, and other providers simultaneously.

Industry peers using Python-based AI tooling, CI/CD pipelines with Trivy, or LiteLLM specifically are facing the same exposure. We are aware of at least three other financial institutions in our ISAC that have initiated incident response procedures related to this campaign. The broader campaign by TeamPCP has spanned five software ecosystems in a single month, indicating this is not an isolated incident but an ongoing, escalating threat.

## 4. Risk to Organizational Objectives

**AI Innovation Roadmap**: Our strategic investment in AI-powered services is directly threatened. The compromise of our LLM gateway could force a multi-week pause in AI feature development while infrastructure is remediated and re-secured, delaying our Q3 product roadmap.

**Customer Trust**: If customer data was accessible via compromised credentials and notification is required, we face erosion of trust in our digital services at a time when we are competing on AI capabilities.

**Operational Resilience**: The incident exposes a single point of failure in our AI infrastructure. Our dependence on a single, third-party proxy library for all LLM routing creates concentration risk that this incident has made visible.

**Regulatory Standing**: Our current audit cycle is in progress. Discovery of a supply chain compromise with potential data exposure could result in audit findings, increased scrutiny, and elevated compliance costs for the next 12-18 months.

## 5. Compliance Implications

**PCI DSS**: If credentials providing access to cardholder data environments were among those harvested, we have a potential breach that requires notification to our acquiring bank within 24 hours of confirmation (PCI DSS Requirement 12.10). A PCI Forensic Investigator (PFI) engagement would be required. Requirement 6.3.2 on software component inventory and vulnerability management is directly implicated.

**SOX (Sarbanes-Oxley)**: If the integrity of financial reporting systems — specifically oracle-findb-prod — was potentially compromised through credential theft, this may constitute a material weakness in internal controls over financial reporting that must be disclosed to auditors and potentially in our next quarterly filing.

**GDPR**: If European customer data was accessible from compromised systems, Article 33 requires supervisory authority notification within 72 hours of becoming aware. Article 34 may require direct customer notification if the breach is likely to result in high risk to individuals' rights and freedoms.

**SOC 2**: The incident has implications for the Security, Availability, and Confidentiality trust service criteria. Our next SOC 2 audit will need to address the incident, our response, and remediation measures.

## 6. Decision Points for Leadership

**Decision 1: Incident Response Scope and Funding**
- **Option A — Full-scope IR**: Engage an external incident response firm for comprehensive forensic investigation across all potentially affected systems. Estimated cost: $500K-$1M. Timeline: 4-6 weeks. This provides the most complete picture of exposure and strongest defensible position for regulators.
- **Option B — Targeted IR**: Focus forensic investigation on the three highest-risk assets (api-gateway-prod, cicd-runner-pool, k8s-ml-cluster) only. Estimated cost: $150-300K. Timeline: 2-3 weeks. Faster but may miss lateral movement to other systems.

**Decision 2: AI Infrastructure Architecture**
- **Option A — Accelerated migration**: Commission an immediate re-architecture of our AI infrastructure to eliminate single points of failure. Replace LiteLLM with a self-hosted, hardened alternative or build an internal routing layer. Cost: significant engineering investment. Benefit: long-term resilience.
- **Option B — Harden existing stack**: Upgrade LiteLLM to patched version, implement additional monitoring and integrity checks, but maintain current architecture. Lower cost, faster, but accepts continued dependency on third-party AI proxy software.

**Decision 3: Regulatory Notification**
- Should we proactively notify PCI QSA and relevant regulatory bodies before confirming the full scope of credential exposure? Proactive notification demonstrates good faith but may trigger formal investigation procedures before we have full answers.

## 7. Confidence Statement

We assess with **high confidence** that our organization was exposed to this compromise based on confirmed use of the affected software on production systems. We have **moderate confidence** that credential exfiltration occurred but have not yet confirmed this through forensic log analysis. We have **low confidence** in the full scope of potential secondary access using any harvested credentials, as this requires comprehensive forensic investigation that is still in early stages.

## 8. Intelligence Gaps

- Definitive confirmation of whether the compromised LiteLLM version was installed on api-gateway-prod during the March 24 exposure window
- Complete inventory of all credentials that were accessible from potentially compromised systems
- Whether any harvested credentials have been used for secondary access to our systems
- TeamPCP's specific objectives for financial sector targets — whether this is opportunistic credential theft or targeted espionage
- The full extent of the TeamPCP campaign — security researchers indicate this may be only one phase of an ongoing operation

## 9. Recommended Posture Changes

1. **Immediate**: Authorize full-scope incident response and forensic investigation. Rotate all credentials accessible from potentially affected systems. Implement emergency monitoring for the identified IOCs.
2. **30-day**: Establish a formal software supply chain security program with automated dependency auditing, integrity verification, and approved package lists for critical infrastructure.
3. **90-day**: Re-architect AI infrastructure to eliminate single points of failure. Implement a private package registry with automated malware scanning for all Python dependencies. Deploy runtime credential access monitoring.
4. **Ongoing**: Increase security budget allocation for supply chain risk management by an estimated 15-20%. Establish regular third-party security assessments for all AI/ML infrastructure components. Join relevant ISACs for threat intelligence sharing on AI infrastructure threats.

## 10. Sources

1. LiteLLM Official Security Update — https://docs.litellm.ai/blog/security-update-march-2026
2. Datadog Security Labs Campaign Analysis — https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/
3. Trend Micro Research — https://www.trendmicro.com/en_us/research/26/c/inside-litellm-supply-chain-compromise.html
4. Snyk Technical Deep Dive — https://snyk.io/blog/poisoned-security-scanner-backdooring-litellm/
`;

export const CACHED_EXTERNAL_REPORT = (timestamp: string) => `# TLP:GREEN — COMMUNITY WIDE

# EXTERNAL SHARING INTELLIGENCE PRODUCT
## Supply Chain Compromise — AI Proxy Library (PyPI)
**Classification:** TLP:GREEN | **Generated:** ${timestamp} | **Sector:** Cross-Industry (AI/ML, Financial Services, Technology)

---

## 1. TLP Marking & Distribution Statement

This report is marked **TLP:GREEN**. Recipients may share this information within their community, sector, and partner organizations, but not via publicly accessible channels (websites, public social media, public repositories). Source attribution to [REPORTING ORGANIZATION] is encouraged when sharing. This product is intended for ISAC distribution, peer organization consumption, and sector-wide threat awareness.

## 2. Anonymized Threat Summary

On March 24, 2026, the threat actor tracked as TeamPCP executed a supply chain attack against the LiteLLM Python package, a widely-used AI proxy library with approximately 3.4 million daily downloads on PyPI. TeamPCP is assessed to be a financially-motivated extortion crew with possible links to LAPSUS$, based on infrastructure and tradecraft similarities identified by multiple security research teams.

The compromise followed a cascading attack path. The threat actor first compromised the Trivy security scanner (CVE-2026-33634, CVSS 9.4) via a misconfigured GitHub Actions workflow, enabling exfiltration of CI/CD credentials from downstream projects that used Trivy in their build pipelines. Using stolen PyPI publishing tokens harvested from LiteLLM's CI/CD environment, TeamPCP published two malicious versions (1.82.7 and 1.82.8) to PyPI.

The malicious packages contained a sophisticated multi-stage payload. The first stage deploys a credential harvester targeting SSH keys, cloud provider credentials (AWS, GCP, Azure), Kubernetes secrets and service account tokens, environment files, database connection strings, cryptocurrency wallet files, shell history, and Docker configurations. The second stage includes modules for Kubernetes lateral movement via deployment of privileged pods (named "node-setup-*" in kube-system namespace). The third stage installs a persistent systemd backdoor that periodically contacts attacker-controlled infrastructure for additional payload delivery.

All harvested data is encrypted using AES-256 with RSA-4096 key wrapping before exfiltration, making network-level interception and data recovery extremely difficult. The compromised packages were live for approximately three hours before PyPI quarantined them.

This campaign is part of a broader multi-ecosystem operation by TeamPCP that has also affected npm packages, Docker Hub images, and the Checkmarx KICS security tool. Organizations using any of these ecosystems in their development or CI/CD pipelines should conduct thorough audits.

## 3. Indicators of Compromise

**Malicious Domains:**
- \`models.litellm[.]cloud\` — Primary exfiltration endpoint (NOT an official LiteLLM domain)
- \`checkmarx[.]zone\` — Domain impersonating Checkmarx, used in related campaign phase

**IP Addresses:**
- \`83.142.209[.]203\` — Secondary C2 and exfiltration server (port 8080)

**Malicious Files:**
- \`litellm_init.pth\` — 34,628 bytes, double base64-encoded Python path configuration file placed in site-packages/. Auto-executes on Python interpreter start.
- \`proxy_server.py\` — Modified LiteLLM proxy module with embedded credential harvester. Executes when litellm.proxy is imported.

**Malicious Packages (removed from PyPI):**
- \`litellm==1.82.7\` — Malware in proxy_server.py (import-triggered)
- \`litellm==1.82.8\` — Malware in .pth file (auto-triggered on ANY Python execution) — HIGHER RISK
- \`telnyx==4.87.1\` — Related compromise (March 27), import-triggered
- \`telnyx==4.87.2\` — Related compromise, import-triggered

**Associated CVEs:**
- \`CVE-2026-33634\` — Trivy security scanner vulnerability (CVSS 9.4), initial access vector

**Network Indicators:**
- HTTP POST requests with header \`X-Filename: tpcp.tar.gz\`
- Outbound connections from Python environments to the domains/IPs listed above
- Encrypted payloads consistent with RSA-4096 wrapped AES-256 key exchange

**Kubernetes Indicators:**
- Pods named \`node-setup-*\` in kube-system namespace with privileged access
- Unexpected hostPID or hostNetwork container configurations
- Anomalous service account token access patterns across namespaces

## 4. ATT&CK Mapping

- **T1195.002 — Compromise Software Supply Chain** (Initial Access): Upstream Trivy compromise cascaded into LiteLLM PyPI package compromise via stolen CI/CD credentials.
- **T1078 — Valid Accounts** (Initial Access / Persistence): Stolen PyPI publishing tokens used to authenticate as the legitimate package maintainer and publish malicious releases.
- **T1059.006 — Command and Scripting Interpreter: Python** (Execution): Malicious Python code embedded in package files, with v1.82.8 using a .pth file for automatic execution on interpreter start.
- **T1555 — Credentials from Password Stores** (Credential Access): Systematic targeting of credential stores, key directories, and authentication configuration files across cloud, SSH, and container environments.
- **T1552.001 — Unsecured Credentials: Credentials in Files** (Credential Access): Scanning of .env files, configuration files, shell history, and CI/CD pipeline configs for plaintext credentials.
- **T1041 — Exfiltration Over C2 Channel** (Exfiltration): Harvested data packaged and exfiltrated via HTTP POST to attacker infrastructure with custom headers.
- **T1573 — Encrypted Channel** (Command and Control): Hybrid AES-256/RSA-4096 encryption for all exfiltrated data.
- **T1053.006 — Scheduled Task/Job: Systemd Timers** (Persistence): Persistent backdoor installed as a systemd service for ongoing access and payload delivery.
- **T1610 — Deploy Container** (Defense Evasion): Privileged Kubernetes pods deployed for lateral movement across cluster nodes.
- **T1071.001 — Application Layer Protocol: Web Protocols** (Command and Control): Standard HTTP/HTTPS used for C2 communication to blend with normal traffic.

## 5. Sector Relevance

This threat is relevant to any organization that:
- Uses Python-based AI/ML libraries in development or production environments
- Operates LiteLLM as an AI proxy or API gateway
- Uses Trivy for vulnerability scanning in CI/CD pipelines
- Deploys AI models via Kubernetes clusters
- Manages centralized credential stores accessible from development environments

Financial services, technology, healthcare, and government sectors with AI/ML programs should assess their exposure immediately. The centralized nature of AI proxy libraries (storing credentials for multiple LLM providers) makes this class of software a high-value target for credential theft operations.

## 6. Detection Guidance

1. **Package audit**: Run \`pip show litellm\` on all systems. If version 1.82.7 or 1.82.8 was installed, treat the system as compromised.
2. **File inspection**: Search for \`litellm_init.pth\` in all Python site-packages directories. Its presence confirms compromise.
3. **Network monitoring**: Deploy detection rules for connections to \`models.litellm[.]cloud\`, \`checkmarx[.]zone\`, and \`83.142.209[.]203\`.
4. **CI/CD audit**: Review GitHub Actions logs for trivy-action execution between February 28 and March 24, 2026.
5. **Kubernetes audit**: Search for pods matching \`node-setup-*\` in kube-system namespace across all clusters.
6. **Credential access**: Monitor for unusual access patterns to SSH key directories, cloud credential files, and secrets management systems from development or CI/CD environments.

## 7. Recommended Mitigations

1. **Immediately** pin all Python dependencies to specific, verified versions with hash checking enabled.
2. **Implement** a private PyPI mirror or repository manager (e.g., Artifactory, Nexus) with automated malware scanning.
3. **Audit** all CI/CD pipeline dependencies, especially security scanning tools, and verify their integrity.
4. **Rotate** all credentials that may have been accessible from environments where the compromised package was installed.
5. **Deploy** runtime monitoring for credential access and anomalous Python script execution.
6. **Segment** development, CI/CD, and production environments to limit lateral movement potential.
7. **Restrict** Kubernetes service accounts to least-privilege access and disable pod creation in kube-system for non-admin accounts.

## 8. STIX / MISP Compatibility

The indicators in this report are suitable for direct ingestion into STIX 2.1 and MISP event formats. Organizations with automated threat intelligence platforms should create events for the listed IOCs with appropriate tagging (misp-galaxy: threat-actor="TeamPCP", misp-galaxy: attack-pattern entries for each ATT&CK technique). We recommend distribution level "connected communities" for MISP sharing and TLP:GREEN for STIX/TAXII feeds.

## 9. Source Handling

This product is based on analysis of publicly reported threat intelligence combined with internal observations from [REPORTING ORGANIZATION]. The underlying technical analysis has been corroborated by independent research from Datadog Security Labs, Snyk, Trend Micro, Sonatype, and Kaspersky. Recipients are encouraged to verify indicators against their own environments and share confirmed sightings through established ISAC channels.

## 10. Feedback Request

We welcome the following from recipients:
- **Sighting reports**: Have you observed the listed IOCs in your environment?
- **Additional indicators**: Do you have IOCs associated with TeamPCP that are not listed here?
- **TTP enrichment**: Have you observed additional techniques or infrastructure used in this campaign?
- **Corrections**: Any inaccuracies in the technical analysis or indicator data?

Please submit feedback through your ISAC's established reporting channel or directly to [REPORTING ORGANIZATION]'s threat intelligence team.

## 11. Sources

1. LiteLLM Official Security Update — https://docs.litellm.ai/blog/security-update-march-2026
2. Datadog Security Labs — https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/
3. Snyk Blog — https://snyk.io/blog/poisoned-security-scanner-backdooring-litellm/
4. Trend Micro — https://www.trendmicro.com/en_us/research/26/c/inside-litellm-supply-chain-compromise.html
5. Sonatype — https://www.sonatype.com/blog/compromised-litellm-pypi-package-delivers-multi-stage-credential-stealer
6. MITRE ATT&CK — https://attack.mitre.org/techniques/T1195/002/
`;

export function getCachedReport(type: ReportType, timestamp: string = new Date().toLocaleString()) {
  if (type === "operational") return CACHED_OPERATIONAL_REPORT(timestamp);
  if (type === "strategic") return CACHED_STRATEGIC_REPORT(timestamp);
  return CACHED_EXTERNAL_REPORT(timestamp);
}

export const TLP_FOR_REPORT_TYPE: Record<ReportType, string> = {
  operational: "TLP:RED",
  strategic: "TLP:AMBER+STRICT",
  external: "TLP:GREEN",
};
