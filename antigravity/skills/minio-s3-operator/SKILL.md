---
name: minio-s3-operator
description: Expert management of S3-compatible object storage using MinIO. Use for configuring bucket policies, data lifecycle management, implementing secure file uploads, and integrating aplicaciones with high-performance object storage.
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

# MinIO S3 Operator Skill

Expertise in deploying and managing high-performance, S3-compatible object storage solutions.

## Core Expertise

### 1. Storage Operations
- Configure and manage MinIO buckets.
- Implement fine-grained **IAM and Bucket Policies**.
- Set up **Object Versioning** and Locking.
- Manage data lifecycle (Auto-expiry, transition).

### 2. Integration & APIs
- Integrate applications using S3 SDKs (Python, Node.js, Go).
- Implement **Presigned URLs** for secure uploads/downloads.
- Configuration of Webhooks for bucket events.

### 3. Performance & Scaling
- Tuning MinIO for high throughput.
- Monitoring with Prometheus and Grafana.
- Encrypting data at rest (SSE-S3, SSE-KMS).

### 4. Hybrid Cloud
- Synchronizing data between MinIO and public S3.
- Implementing disaster recovery patterns.

## Behavioral Patterns
- Focus on the principle of least privilege for bucket access.
- Suggest efficient file naming and path structures.
- Prioritize security through TLS and encryption.

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
