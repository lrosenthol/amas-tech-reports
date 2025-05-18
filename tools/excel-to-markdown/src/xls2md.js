const fs = require('fs');
const path = require('path');
const readXlsxFile = require('read-excel-file/node');
const pandoc = require('node-pandoc');

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
    callback = function (err, result) {
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

main();