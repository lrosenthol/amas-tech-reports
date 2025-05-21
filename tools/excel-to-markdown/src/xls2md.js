import fs from 'fs';
import path from 'path';
import readXlsxFile from 'read-excel-file/node';
import pandoc from 'node-pandoc';
// import { createSunburstSVG } from './sunburst.js';
import * as d3 from 'd3';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import xmlserializer from 'xmlserializer';


const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
    console.error('Usage: node index.js <input.xlsx> <output.docx>');
    process.exit(1);
}

function main() {
    try {
        readXlsxFile(inputPath).then((rows) => {
            // `rows` is an array of rows
            // each row being an array of cells.
            // console.log(rows);

            const overviewOutput = convertToOverview(rows);
            // console.log(overviewOutput);
            writeMarkdownAsWord(overviewOutput, outputPath);

            const tableOutput = convertToStandardsTable(rows);
            console.log(tableOutput);

            // Create a new output path with '-table' before the extension
            const parsedPath = path.parse(outputPath);
            const tableOutputPath = path.join(parsedPath.dir, parsedPath.name + '-table' + parsedPath.ext);
            writeMarkdownAsWord(tableOutput, tableOutputPath);

            // create a sunburst chart using the data
            const sunburstData = rowsToSunburstData(rows);
            const chartOutputPath = path.join(parsedPath.dir, parsedPath.name + '-chart.svg');
            createSunburstSVG(sunburstData, chartOutputPath);
        });
    } catch (error) {
        console.error('Error reading Excel file:', error);
    }
}

const FIELDS = Object.freeze({
    NAME: 0,
    CATEGORIES: 1,
    GROUP: 2,
    STD: 3,
    LINK: 4,
    STATUS: 5,
    MEDIA: 6,
    SUMMARY: 7
});

const FIELD_TITLES = Object.freeze([
    "##",
    "Categories",
    "- **SDO/Group:**",
    "Standard",
    "- **Link:**",
    "- **Status:**",
    "- **Media:**",
    "- **Summary:**"
]);


function convertToOverview(data) {
    function outputOneField(row, field) {
        if ( field === FIELDS.LINK && row[field] !== null ) {  // special case for link
            return ('- **Link:** [' + row[FIELDS.STD] + '](' + row[FIELDS.LINK] + ')\n\n');
        } else if ( row[field] !== null ) {
            return (FIELD_TITLES[field] + ' ' + row[field] + '\n\n');
        }
        return '';
    }

    let markdown = '';
    data.forEach((row, index) => {
        if ( index > 0 && row[FIELDS.NAME] !== null) {  // skip header row & any empty rows
            markdown += outputOneField(row, FIELDS.NAME);
            markdown += outputOneField(row, FIELDS.GROUP);
            markdown += outputOneField(row, FIELDS.LINK);
            markdown += outputOneField(row, FIELDS.STATUS);
            markdown += outputOneField(row, FIELDS.MEDIA);
            markdown += outputOneField(row, FIELDS.SUMMARY);
        }
    });
    return markdown;
}

function writeMarkdownAsWord(markdown, outputPath) {
    const args = '-f markdown -t docx -o ' + outputPath;
 
    // Set your callback function
    var callback = function (err, result) {
        if (err) console.error('Oh Nos: ',err);
        // Without the -o arg, the converted value will be returned.
        return console.log(result), result;
    };
    
    // Call pandoc
    pandoc(markdown, args, callback);
}

// Create a numbered enum for the column names
const TABLE_FIELDS = Object.freeze({
    SPECIFICATION: 0,
    CONTENT_PROVENANCE: 1,
    TRUST_AND_AUTHENTICITY: 2,
    ASSET_IDENTIFIERS: 3,
    RIGHTS_DECLARATIONS: 4,
    WATERMARKING: 5,
    OTHER: 6
});

// Create a second enum with the string values
const TABLE_FIELD_TITLES = Object.freeze([
    "Specification",
    "Content Provenance",
    "Trust and Authenticity",
    "Asset Identifiers",
    "Rights Declarations",
    "Watermarking",
    "Other"
]);

// this creates a markdown pipe table, with each column centered (to make the X's look better!)
function convertToStandardsTable(data) {
    let markdown = '';
    data.forEach((row, index) => {
        if (index === 0) {
            markdown += '| ' + TABLE_FIELD_TITLES.join(' | ') + ' |\n';
            markdown += '|' + ':-----:|'.repeat(TABLE_FIELD_TITLES.length) + '\n';
        } else {
            markdown += '| ' + row[FIELDS.NAME] + ' |';
            for (let i = 1; i < TABLE_FIELD_TITLES.length; i++) {
                const colTitle = TABLE_FIELD_TITLES[i];
                const categories = (row[FIELDS.CATEGORIES] || '').split('\n').map(s => s.trim());
                markdown += (categories.includes(colTitle) ? ' X |' : '  |');
            }
            markdown += '\n';
        }
    });
    return markdown;
}

// Example: Convert rows to sunburst hierarchy by Category -> Standard Name
function rowsToSunburstData(rows) {
    // Skip header row
    const children = {};
    rows.slice(1).forEach(row => {
        if (!row[FIELDS.NAME] || !row[FIELDS.CATEGORIES]) return;
        // Each row may have multiple categories (split by newline)
        row[FIELDS.CATEGORIES].split('\n').map(s => s.trim()).forEach(category => {
            if (!category) return;
            if (!children[category]) children[category] = [];
            children[category].push({
                name: row[FIELDS.NAME],
                value: 1 // or use another field for value
            });
        });
    });
    return {
        name: "root",
        children: Object.entries(children).map(([cat, items]) => ({
            name: cat,
            children: items
        }))
    };
}

// Sunburst chart generation using D3 and d3-node
export function createSunburstSVG(data, outputPath) {
    const width = 800;
    const radius = width / 2;
    const height = width;

    const dom = new JSDOM('<!DOCTYPE html><body></body>');
    const body = d3.select(dom.window.document.querySelector('body'));

    // Custom colors for categories
    const categoryColors = {
        "Content Provenance": "#FFD966",
        "Trust and Authenticity": "#B4A7D6",
        "Asset Identifiers": "#EA9999",
        "Rights Declarations": "#93C47D",
        "Watermarking": "#EAD1DC",
        "Other": "#CCCCCC",
        "Specification": "#F3F3F3"
    };

    // Partition layout
    const partition = d3.partition().size([2 * Math.PI, radius]);
    const root = d3.hierarchy(data)
        .sum(d => d.value || 1)
        .sort((a, b) => b.value - a.value);
    partition(root);

    // Arc generator
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1);

    // SVG root
    // const svg = d3n.createSVG(width, width)
    //     .append('g')
    //     .attr('transform', `translate(${width / 2},${width / 2})`);
    const svg = body.append("svg")
                  .attr("width", width)
                  .attr("height", height);
    svg.append('g')
        .attr('transform', `translate(${width / 2},${width / 2})`);

    // Draw arcs
    svg.selectAll('path')
        .data(root.descendants().filter(d => d.depth))
        .enter().append('path')
        .attr('d', arc)
        .attr('fill', d => {
            if (d.depth === 1) return categoryColors[d.data.name] || '#eee';
            if (d.depth === 2) return categoryColors[d.parent.data.name] || '#eee';
            return '#fff';
        })
        .attr('stroke', '#fff');

    // Category labels (outer ring)
    svg.selectAll('text.category')
        .data(root.children)
        .enter().append('text')
        .attr('class', 'category')
        .attr('transform', function(d) {
            const angle = ((d.x0 + d.x1) / 2) * 180 / Math.PI - 90;
            const r = (d.y0 + d.y1) / 2;
            return `rotate(${angle}) translate(${r},0) rotate(${angle > 90 ? 180 : 0})`;
        })
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(d => d.data.name);

    // Standard labels (inner ring)
    svg.selectAll('text.standard')
        .data(root.leaves())
        .enter().append('text')
        .attr('class', 'standard')
        .attr('transform', function(d) {
            const angle = ((d.x0 + d.x1) / 2) * 180 / Math.PI - 90;
            const r = (d.y0 + d.y1) / 2;
            return `rotate(${angle}) translate(${r},0) rotate(${angle > 90 ? 180 : 0})`;
        })
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(d => d.data.name);

    // Central label
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 10)
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .text('AI & Multimedia\nAuthenticity\nStandardization Map');

    // Write SVG to file
    const svgString = xmlserializer.serializeToString(svg.node());
    fs.writeFileSync(outputPath, svgString /*d3n.svgString()*/);
}

main();