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
            console.log(overviewOutput);
            writeMarkdownAsWord(overviewOutput, outputPath);

            // const markdownOutput = convertToMarkdownTable(rows);
            // console.log(markdownOutput);
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

function convertToMarkdownTable(data) {
    let markdown = '';
    data.forEach((row, index) => {
        if (index === 0) {
            markdown += '| ' + row.join(' | ') + ' |\n';
            markdown += '|' + '---|'.repeat(row.length) + '\n';
        } else {
            markdown += '| ' + row.join(' | ') + ' |\n';
        }
    });
    return markdown;
}

main();