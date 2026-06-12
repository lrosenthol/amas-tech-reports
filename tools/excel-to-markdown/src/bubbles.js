import fs from 'fs';

// US Letter at 96 DPI internal coordinate system; SVG width/height in inches
const PAGE_W = 816;
const PAGE_H = 1056;
const ML = 48, MR = 48, MT = 48, MB = 48;
const TITLE_H = 30;
const ROW_H = 36;
const DOT_R = 7;

const CATEGORIES = [
    "Content Provenance",
    "Trust and Authenticity",
    "Asset Identifiers",
    "Rights Declarations",
    "Watermarking",
    "Other"
];

const CATEGORY_COLORS = {
    "Content Provenance":     "#C2185B",
    "Trust and Authenticity": "#1565C0",
    "Asset Identifiers":      "#1A1A1A",
    "Rights Declarations":    "#F48FB1",
    "Watermarking":           "#90CAF9",
    "Other":                  "#B0BEC5"
};

const MEDIA_TYPES = [
    "Any", "Any (image focused)", "Images", "Video",
    "Audio", "Web pages", "PDF", "EPUB", "Data"
];

const MEDIA_COLORS = {
    "Any":                 "#1565C0",
    "Any (image focused)": "#1976D2",
    "Images":              "#388E3C",
    "Video":               "#F57C00",
    "Audio":               "#7B1FA2",
    "Web pages":           "#0097A7",
    "PDF":                 "#C62828",
    "EPUB":                "#558B2F",
    "Data":                "#795548"
};

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Wrap to at most 2 lines; truncates with ellipsis if still too long
function wrap(text, maxChars) {
    if (!text || text.length <= maxChars) return [text || ''];
    const words = text.split(' ');
    let line1 = '';
    let breakAt = -1;
    for (let i = 0; i < words.length; i++) {
        const cand = line1 ? `${line1} ${words[i]}` : words[i];
        if (cand.length > maxChars) {
            if (!line1) { line1 = cand; breakAt = i + 1; }
            else breakAt = i;
            break;
        }
        line1 = cand;
    }
    if (breakAt < 0) return [line1];
    const rest = words.slice(breakAt).join(' ');
    if (!rest) return [line1];
    const line2 = rest.length > maxChars ? rest.slice(0, maxChars - 1) + '…' : rest;
    return [line1, line2];
}

function renderText(lines, x, baseY, lineHeight, attrs) {
    const parts = [`<text ${attrs}>`];
    lines.forEach((line, i) => {
        if (i === 0) parts.push(`<tspan x="${x}" y="${baseY}">${esc(line)}</tspan>`);
        else parts.push(`<tspan x="${x}" dy="${lineHeight}">${esc(line)}</tspan>`);
    });
    parts.push('</text>');
    return parts.join('');
}

function buildSVG({ stds, cols, colors, title, pageNum, totalPages, labelW, hdrH }) {
    const colW = (PAGE_W - ML - MR - labelW) / cols.length;
    const rightX = ML + labelW + cols.length * colW;
    const titleH = title ? TITLE_H : 0;
    const dataY = MT + titleH + hdrH;
    const tableBottom = dataY + stds.length * ROW_H;

    // chars that fit in each column / label area at given px-per-char approximations
    const maxLabelChars = Math.floor((labelW - 8) / 5.0);
    const maxHdrChars   = Math.max(4, Math.floor((colW - 4) / 5.0));

    const tableTop = MT + titleH;
    const out = [];
    out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="8.5in" height="11in" viewBox="0 0 ${PAGE_W} ${PAGE_H}">`);
    out.push(`<rect width="${PAGE_W}" height="${PAGE_H}" fill="white"/>`);

    // Title
    if (title) {
        const t = pageNum > 1 ? `${title} (cont'd)` : title;
        out.push(`<text x="${ML}" y="${MT + 20}" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="bold" fill="#222">${esc(t)}</text>`);
        out.push(`<line x1="${ML}" y1="${MT + titleH - 4}" x2="${rightX}" y2="${MT + titleH - 4}" stroke="#ccc" stroke-width="0.5"/>`);
    }

    // === LAYER 1: horizontal row separators — label column only ===
    for (let ri = 0; ri <= stds.length; ri++) {
        const y = dataY + ri * ROW_H;
        const hStroke = ri === 0 ? "#999" : "#d0d0d0";
        const hWidth  = ri === 0 ? 1.5 : 0.5;
        out.push(`<line x1="${ML}" y1="${y}" x2="${ML + labelW}" y2="${y}" stroke="${hStroke}" stroke-width="${hWidth}"/>`);
    }

    // === LAYER 2: single vertical divider between label column and data area ===
    out.push(`<line x1="${ML + labelW}" y1="${tableTop}" x2="${ML + labelW}" y2="${tableBottom}" stroke="#bbb" stroke-width="1"/>`);

    // === LAYER 3: center guide lines — one per data column, behind dots ===
    for (let i = 0; i < cols.length; i++) {
        const x = ML + labelW + (i + 0.5) * colW;
        out.push(`<line x1="${x}" y1="${dataY}" x2="${x}" y2="${tableBottom}" stroke="#ccc" stroke-width="0.5"/>`);
    }

    // === LAYER 4: outer border ===
    out.push(`<rect x="${ML}" y="${tableTop}" width="${rightX - ML}" height="${tableBottom - tableTop}" fill="none" stroke="#bbb" stroke-width="1"/>`);

    // === LAYER 5: column header text ===
    cols.forEach((col, i) => {
        const cx = ML + labelW + (i + 0.5) * colW;
        const color = colors[col] || '#555';
        const hLines = wrap(col, maxHdrChars);
        const lh = 13;
        const blockH = (hLines.length - 1) * lh + 10;
        const firstY = tableTop + (hdrH - blockH) / 2 + 10;
        out.push(renderText(hLines, cx, firstY, lh,
            `text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="10" font-weight="bold" fill="${color}"`));
    });

    // === LAYER 6: standard name text, then dots (dots cover guide lines at their position) ===
    stds.forEach((std, ri) => {
        const rowY = dataY + ri * ROW_H;
        const dotCY = rowY + ROW_H / 2;
        const fontSize = 9.5, lh = 12;

        const nameLines = wrap(std.name, maxLabelChars);
        const blockH = (nameLines.length - 1) * lh + fontSize;
        const firstY = rowY + (ROW_H - blockH) / 2 + fontSize;
        out.push(renderText(nameLines, ML + 6, firstY, lh,
            `font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" fill="#333"`));

        cols.forEach((col, ci) => {
            if (std.activeCols.has(col)) {
                const cx = ML + labelW + (ci + 0.5) * colW;
                out.push(`<circle cx="${cx}" cy="${dotCY}" r="${DOT_R}" fill="${colors[col] || '#555'}"/>`);
            }
        });
    });

    // Page footer
    if (totalPages > 1) {
        out.push(`<text x="${PAGE_W / 2}" y="${PAGE_H - 20}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="9" fill="#aaa">Page ${pageNum} of ${totalPages}</text>`);
    }

    out.push(`</svg>`);
    return out.join('\n');
}

function buildStandards(rows, nameCol, dataCol) {
    return rows.slice(1)
        .filter(r => r[nameCol])
        .map(r => ({
            name: String(r[nameCol]),
            activeCols: new Set(
                r[dataCol]
                    ? String(r[dataCol]).split('\n').map(s => s.trim()).filter(Boolean)
                    : []
            )
        }));
}

function writePages(stds, cols, colors, title, basePath, labelW, hdrH) {
    const dataAreaH = PAGE_H - MT - MB - (title ? TITLE_H : 0) - hdrH;
    const perPage = Math.max(1, Math.floor(dataAreaH / ROW_H));
    const chunks = [];
    for (let i = 0; i < stds.length; i += perPage) chunks.push(stds.slice(i, i + perPage));
    if (chunks.length === 0) chunks.push([]);

    return chunks.map((chunk, idx) => {
        const svg = buildSVG({
            stds: chunk, cols, colors, title,
            pageNum: idx + 1, totalPages: chunks.length,
            labelW, hdrH
        });
        const suffix = chunks.length > 1 ? `-p${idx + 1}` : '';
        const fp = `${basePath}${suffix}.svg`;
        fs.writeFileSync(fp, svg, 'utf8');
        console.log(`  Saved: ${fp}`);
        return fp;
    });
}

export function createCategoryMapSVGs(rows, outputPathBase) {
    const stds = buildStandards(rows, 0, 1);
    return writePages(stds, CATEGORIES, CATEGORY_COLORS,
        "Standards & Specification Map", outputPathBase, 260, 60);
}

export function createMediaTypeMapSVGs(rows, outputPathBase) {
    const stds = buildStandards(rows, 0, 7);
    return writePages(stds, MEDIA_TYPES, MEDIA_COLORS,
        "Standards & Media Type Map", outputPathBase, 230, 70);
}
