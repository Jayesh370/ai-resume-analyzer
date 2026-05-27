/**
 * services/pdfService.js — Extracts raw text from a PDF file using pdf-parse.
 */

const pdfParse = require("pdf-parse");
const fs = require("fs");

/**
 * Extract plain text from a PDF file on disk.
 * @param {string} filePath — absolute path to the PDF
 * @returns {string} extracted text
 */
const extractTextFromPDF = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text || "";
};

module.exports = { extractTextFromPDF };
