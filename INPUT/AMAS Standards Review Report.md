# AMAS Standards List — Review Report
**Date:** June 2026  
**Scope:** Review of existing entries for removal candidates and required updates

---

## Part 1: Candidates for Removal

### 1.1 Remove: MPEG-21 Part 11 — Evaluation Tools for Persistent Association Technologies
- **Entry:** ISO/IEC TR 21000-11:2004 (row 24)
- **Reason:** Published in 2004, this Technical Report is over 20 years old and predates all modern content provenance, watermarking, and AI authenticity frameworks. Its scope (evaluation tools for early "persistent association technologies" in audio/video) has been wholly superseded by current ISO/IEC JPEG Trust, IEEE P3361, and ITU-T watermarking standards. Additionally, the broader MPEG-21 family has been substantially revised — ISO/IEC 21000-3:2025 (Digital Item Identification) was published in 2025 as a full replacement for the 2003 edition, reflecting how dated this TR is. While the TR has not been formally withdrawn, it is no longer referenced in current standards development work.

### 1.2 Remove: A Review of Medical Image Watermarking Requirements for Teleradiology
- **Entry:** NIH / PMC article (row 23)
- **Reason:** This is an academic literature review published in 2012 (PMC3597963), not a standard or specification. It is not produced by a recognized Standards Development Organization (SDO) and carries no normative weight. Its inclusion in a standards list alongside ISO, ITU-T, IEEE, W3C, and IETF specifications is anomalous. The medical imaging domain is not the target scope of this standards list, and the content has been superseded by general digital watermarking standards. It should be removed; if medical imaging watermarking is in scope, a proper standard (e.g., DICOM Supplement 236 for watermarking) should be substituted.

### 1.3 Consider for Removal: PROV (Open Provenance)
- **Entry:** PROV / openprovenance.org, Published 2013 (row 9)
- **Reason:** The underlying W3C PROV Recommendation (PROV-DM) has not been updated since 2013 and the openprovenance.org site it references represents the earlier Open Provenance Model (OPM), which was itself superseded by W3C PROV. The specification has seen no normative updates in 13 years. While PROV remains technically valid, its relevance to modern content authenticity workflows is marginal — newer frameworks (C2PA, CAWG, ISO 22144) have not adopted it as a dependency. If retained, the link should be corrected to point to the authoritative W3C specification at https://www.w3.org/TR/prov-overview/ rather than openprovenance.org.

---

## Part 2: Updates Required to Existing Entries

### 2.1 C2PA Specification — Version Update
- **Current entry:** Version 2.2, Published 2025
- **Update:** Version **2.3** was released December 2025. Version 2.3 adds CMAF segment-level signing for live and broadcast media, with compatibility for HLS, DASH, CDN, and DRM infrastructure. Additionally, the C2PA Conformance Program officially launched June 4, 2025, providing a live Trust List and Conforming Products List. Version 2.4 is in active development.
- **Action:** Update version number to 2.3 and update link to: https://c2pa.org/specifications/specifications/2.3/specs/C2PA_Specification.html

### 2.2 IPTC Photo Metadata Standard — Version Update
- **Current entry:** IPTC Photo Metadata Standard 2024.1, Published 2024
- **Update:** Version **2025.1** was published November 2025. Key additions include four new AI-content properties: AI Prompt Information, AI Prompt Writer Name, AI System Used, and AI System Version Used, added to IPTC Extension schema v1.9.
- **Action:** Update to version 2025.1, update year to 2025, update link to: https://www.iptc.org/std/photometadata/specification/IPTC-PhotoMetadata-2025.1.html

### 2.3 ISO 22144 — Status Update
- **Current entry:** ISO 22144, Status: "In progress"
- **Update:** Now at **Draft International Standard (DIS) stage** as ISO/DIS 22144:2025. Full title clarified as "Authenticity of Information — Content Credentials." Balloting is underway with some "No" votes with comments received; not yet finalized as an International Standard.
- **Action:** Update status to "In Progress (DIS stage)" and update Std # to "ISO/DIS 22144:2025"

### 2.4 ISO/IEC 21617-1 JPEG Trust Part 1 — Edition Note
- **Current entry:** ISO 21617-1:2025, Published 2025
- **Update:** A **2nd edition** of Part 1 is already in draft to align with C2PA 2.3 and add signaling for authorship, ownership, and IP rights (approved at the 107th JPEG meeting). Also note that **Part 2** (Trust Profiles and Reports) has reached CD stage with DIS ballot planned, and **Part 3** (Media Asset Watermarking) is also at CD stage — both listed in the current standards list as "Initiated" or "In Progress" should be updated to reflect progression.
- **Action:** Add note to Part 1 that 2nd edition is in draft. Update Part 2 (row 5) and Part 3 (row 6) status to "In Progress (CD stage)"

### 2.5 H.274(V4) — Version Published
- **Current entry:** H.274(V4), Status: "In progress"
- **Update:** **H.274 V4 was published January 2026.** It is now a finalized ITU-T Recommendation covering versatile supplemental enhancement information messages for coded video bitstreams (VVC/H.266), including SEI messages for content provenance and trust/authenticity.
- **Action:** Update status to "Published", update Date of Publication to 2026. Updated link: https://www.itu.int/rec/T-REC-H.274

### 2.6 IWA 44 / UMid — Name Change and Update
- **Current entry:** "Unique Media Identifier (UMid)", IWA 44, Published 2024
- **Update:** Published as **IWA 44:2025** with an important name change — the identifier is now called the **Global Media Identifier (GMI)** rather than UMid. Updated to be interoperable with LEI (Legal Entity Identifiers), C2PA, and DOI.
- **Action:** Update name to "Global Media Identifier (GMI)", Std # to "IWA 44:2025", and year to 2025. Update link to https://www.iso.org/standard/88469.html

### 2.7 IETF AI Preferences Vocabulary — Draft Version Update
- **Current entry:** "ietf-aipref-vocab-00", Status: "In progress"
- **Update:** Now at **version -06** (April 28, 2026), expiring October 30, 2026. The IETF AI Preferences Working Group is actively progressing this draft. A companion draft (`draft-zehta-aipref-exclusions`) has also emerged covering exclusions and protected uses.
- **Action:** Update Std # to "draft-ietf-aipref-vocab-06". Update link to: https://datatracker.ietf.org/doc/draft-ietf-aipref-vocab/

### 2.8 PROV — Correct Link (if retained)
- **Current entry:** Link to https://openprovenance.org/
- **Update:** openprovenance.org covers the older OPM model. The authoritative current reference is the W3C PROV family at https://www.w3.org/TR/prov-overview/
- **Action:** If not removed (see 1.3), update link to W3C PROV Overview.

### 2.9 Robots Exclusion Protocol — Add Publication Date
- **Current entry:** RFC 9309, Date: blank
- **Update:** RFC 9309 was published **September 2022**.
- **Action:** Add Date of Publication: 2022

---

## Summary Table

| Row | Standard | Action | Details |
|-----|----------|--------|---------|
| 2 | C2PA Specification | Update version | 2.2 → 2.3 (Dec 2025) |
| 3 | ISO 22144 | Update status/number | In progress → DIS stage; ISO/DIS 22144:2025 |
| 4 | ISO 21617-1 JPEG Trust Part 1 | Add note | 2nd edition in draft |
| 5 | JPEG Trust Part 2 | Update status | Initiated → In Progress (CD stage) |
| 6 | JPEG Trust Part 3 | Update status | Initiated → In Progress (CD stage) |
| 9 | PROV | Remove or update link | Outdated link; consider removal |
| 15 | IWA 44 / UMid | Update name + version | GMI; IWA 44:2025 |
| 18 | Robots Exclusion Protocol | Add date | 2022 |
| 19 | IETF aipref-vocab | Update draft number | -00 → -06 |
| 23 | Medical Image Watermarking NIH | **Remove** | Academic paper, not a standard |
| 24 | MPEG-21 Part 11 (2004) | **Remove** | 20+ years old, superseded |
| 27 | H.274(V4) | Update status + date | Published January 2026 |
| 33 | IPTC Photo Metadata | Update version | 2024.1 → 2025.1 (Nov 2025) |

---

*Report prepared June 2026. All status information should be verified against primary SDO sources prior to publication.*
