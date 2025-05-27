import path from 'path';
import readXlsxFile from 'read-excel-file/node';
import pandoc from 'node-pandoc';
// import { createSunburstSVG, createSunburstPNG, createBubbleChartSVG, createBubbleChartPNG } from './sunburst.js';
import { createBubbleChartPNG, createBubbleChartPNGByMediaType } from './bubbles.js';

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
            console.log('Overview written to:', outputPath);

            const tableOutput = convertToStandardsTable(rows);
            // console.log(tableOutput);

            // Create a new output path with '-table' before the extension
            const parsedPath = path.parse(outputPath);
            const tableOutputPath = path.join(parsedPath.dir, parsedPath.name + '-table' + parsedPath.ext);
            writeMarkdownAsWord(tableOutput, tableOutputPath);
            console.log('Standards table written to:', tableOutputPath);

            // Create the media table '-media-table' before the extension
            const mediaTableOutput = convertToMediaTable(rows);
            const mediaTableOutputPath = path.join(parsedPath.dir, parsedPath.name + '-media-table' + parsedPath.ext);
            writeMarkdownAsWord(mediaTableOutput, mediaTableOutputPath);
            console.log('Media table written to:', mediaTableOutputPath);

            // // create a sunburst chart using the data
            const chartData = rowsToChartData(rows);

            // const chartSVGOutputPath = path.join(parsedPath.dir, parsedPath.name + '-chart.svg');
            // createSunburstSVG(ChartData, chartSVGOutputPath);

            // const chartBubbleOutputPath = path.join(parsedPath.dir, parsedPath.name + '-bubble.svg');
            // createBubbleChartSVG(ChartData, chartBubbleOutputPath);

            // const chartPNGOutputPath = path.join(parsedPath.dir, parsedPath.name + '-chart.png');
            // createSunburstPNG(ChartData, chartPNGOutputPath);

            // const chartBubblePNGOutputPath = path.join(parsedPath.dir, parsedPath.name + '-bubble.png');
            // createBubbleChartPNG(ChartData, chartBubblePNGOutputPath);

            const chartBubbleOutputPath = path.join(parsedPath.dir, parsedPath.name + '-bubbleChart.png');
            createBubbleChartPNG(chartData, chartBubbleOutputPath);

            const chartBubbleMediaOutputPath = path.join(parsedPath.dir, parsedPath.name + '-mediaTypes-bubbleChart.png');
            createBubbleChartPNG(chartData, chartBubbleMediaOutputPath);
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
    DATE: 6,
    MEDIA: 7,
    SUMMARY: 8
});

const FIELD_TITLES = Object.freeze([
    "##",
    "Categories",
    "- **SDO/Group:**",
    "Standard",
    "- **Link:**",
    "- **Status:**",
    "- **Publication Date:**",
    "- **Media:**",
    "- **Summary:**"
]);


function convertToOverview(data) {
    function outputOneField(row, field) {
        if ( field === FIELDS.LINK && row[field] !== null ) {  // special case for link
            return ('- **Link:** [' + row[FIELDS.STD] + '](' + row[FIELDS.LINK] + ')\n\n');
        } else if ( field === FIELDS.MEDIA && row[field] !== null ) {  // special case for media
        return ('- **Media:** ' + row[field].toString().split('\n').join(', ') + '\n\n');
        } else if ( row[field] !== null ) {
            // remove any newlines in the field value
            // and return the formatted markdown string
            return (FIELD_TITLES[field] + ' ' + row[field].toString().replace(/\n/g, ' ') + '\n\n');
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
            markdown += outputOneField(row, FIELDS.DATE);
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

function convertToMediaTable(data) {
    // Collect all unique media types
    const mediaSet = new Set();
    data.slice(1).forEach(row => {
        if (row[FIELDS.MEDIA]) {
            row[FIELDS.MEDIA].toString().split('\n').map(s => s.trim()).forEach(media => {
                if (media) mediaSet.add(media);
            });
        }
    });

    // Sort media types and filter out any that start with "Any"
    let mediaTypes = Array.from(mediaSet).sort();
    mediaTypes = mediaTypes.filter(type => !type.startsWith("Any"));
 
    // Add special "Other" media type TO THE END OF THE LIST
    mediaTypes.push("Others");

    // Build header
    let markdown = '| Standard | ' + mediaTypes.join(' | ') + ' |\n';
    markdown += '|:---------|' + mediaTypes.map(() => ':---:').join('|') + '|\n';

    // Build rows
    data.slice(1).forEach(row => {
        if (!row[FIELDS.NAME]) return;
        const rowMedia = (row[FIELDS.MEDIA] || '').toString().split('\n').map(s => s.trim());
        markdown += '| ' + row[FIELDS.NAME] + ' |';
        mediaTypes.forEach(media => {
            // put a checkmark (X) if the media type is present in the row
            // or if the row has 'Any' media type
            markdown += rowMedia.includes(media) || rowMedia.some(item => item.includes("Any")) ? ' X |' : '  |';
        });
        markdown += '\n';
    });

    return markdown;
}

// Example: Convert rows to chart hierarchy by Category -> Standard Name
function rowsToChartData(rows) {
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

main();