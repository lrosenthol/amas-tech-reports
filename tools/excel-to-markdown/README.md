# Excel to Markdown Converter

This project is a Node.js application that reads data from an Excel file and converts it into Markdown format. 

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Example](#example)
- [License](#license)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/excel-to-markdown.git
   ```
2. Navigate to the project directory:
   ```
   cd excel-to-markdown
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To run the application, use the following command:
```
node src/index.js <path-to-excel-file>
```

Replace `<path-to-excel-file>` with the path to your Excel file.

## Example

Given an Excel file with the following data:

| Name  | Age | Occupation |
|-------|-----|------------|
| John  | 30  | Developer   |
| Jane  | 25  | Designer    |

The output in Markdown format will be:

```
| Name  | Age | Occupation |
|-------|-----|------------|
| John  | 30  | Developer   |
| Jane  | 25  | Designer    |
```

## License

This project is licensed under the MIT License.