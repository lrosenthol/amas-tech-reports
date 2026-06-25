# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

Technical reports for AMAS (AI Multimedia Authenticity Standards), an ITU-T working group. The primary deliverable is `Review_of_Standards.adoc` — an AsciiDoc document describing and categorizing multimedia authenticity standards. Data comes from `AMAS Standards List Data.xlsx`.

## Building the Report

Requires Docker. Converts the AsciiDoc source to HTML, PDF, DocBook XML, and Word (.docx):

```bash
./makeDocs.sh
```

Output lands in `output/`. Uses two Docker images automatically pulled if missing:
- `asciidoctor/docker-asciidoctor` — AsciiDoc → HTML, PDF, DocBook
- `pandoc/core` — DocBook XML → Word

## Generating Data Artifacts from Excel

The Node.js tool in `tools/excel-to-markdown/` reads the Excel spreadsheet and produces Word docs and bubble chart PNGs:

```bash
cd tools/excel-to-markdown
npm install          # first time only
node src/xls2md.js ../../"AMAS Standards List Data.xlsx" ../../output/StandardsList.docx
```

This generates four outputs in `output/`:
- `StandardsList.docx` — per-standard overview (name, group, link, status, date, media, summary)
- `StandardsList-table.docx` — matrix of standards vs. categories
- `StandardsList-media-table.docx` — matrix of standards vs. media types
- `StandardsList-bubbleChart.png` / `StandardsList-mediaTypes-bubbleChart.png`

## Excel Data Schema

The spreadsheet columns map to these `FIELDS` indices in `xls2md.js`:

| Index | Field | Notes |
|-------|-------|-------|
| 0 | NAME | Standard name |
| 1 | CATEGORIES | Newline-delimited; values: Content Provenance, Trust and Authenticity, Asset Identifiers, Rights Declarations, Watermarking, Other |
| 2 | GROUP | SDO/working group |
| 3 | STD | Standard identifier |
| 4 | LINK | URL |
| 5 | STATUS | Publication status |
| 6 | DATE | Publication date |
| 7 | MEDIA | Newline-delimited media types |
| 8 | SUMMARY | Description |

Row 0 is the header and is skipped during processing.

## Key Files

- `Review_of_Standards.adoc` — primary document source
- `Review_of_Standards-theme.yml` — PDF theme
- `AMAS Standards List Data.xlsx` — source data (edit this, then regenerate)
- `tools/excel-to-markdown/src/xls2md.js` — data pipeline entry point
- `tools/excel-to-markdown/src/bubbles.js` — Chart.js bubble chart generation
- `V1/` — archived previous version of the report
- `INPUT/` — reviewer comments and source PowerPoint radar graphics
