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

function convertToOverview(data) {
    let markdown = '';
    data.forEach((row, index) => {
        if ( index > 0 ) {  // skip header row
            markdown += '## ' + row[FIELDS.NAME] + '\n\n';
            markdown += '- **SDO/Group:** ' + row[FIELDS.GROUP] + '\n\n';
            if ( row[FIELDS.LINK] !== null ) {
                markdown += '- **Link:** [' + row[FIELDS.STD] + '](' + row[FIELDS.LINK] + ')\n\n';
            }
            markdown += '- **Status:** ' + row[FIELDS.STATUS] + '\n\n';
            markdown += '- **Media:** ' + row[FIELDS.MEDIA] + '\n\n';
            if ( row[FIELDS.SUMMARY] !== null ) {
                markdown += '- **Summary:** ' + row[FIELDS.SUMMARY] + '\n\n';
            }
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