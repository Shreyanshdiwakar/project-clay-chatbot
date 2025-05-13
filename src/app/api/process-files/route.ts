import { NextResponse } from 'next/server';
import { PdfReader } from 'pdfreader';
import Tesseract from 'tesseract.js';

// Interface for PdfReader item
interface PDFItem {
  page?: number;
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  file?: {
    path?: string;
    buffer?: string;
  };
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    let allText: string[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 10MB.` },
          { status: 400 }
        );
      }
      if (file.type === 'application/pdf') {
        // PDF extraction
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const pdfText = await extractTextFromPdf(buffer);
        allText.push(pdfText);
      } else if (file.type === 'image/jpeg' || file.type === 'image/png') {
        // Image OCR
        const arrayBuffer = await file.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        const ocrResult = await Tesseract.recognize(imageBuffer, 'eng');
        allText.push(ocrResult.data.text || '');
      } else {
        // Unsupported type
        allText.push('');
      }
    }

    return NextResponse.json({ text: allText.join('\n\n') });
  } catch (error) {
    console.error('process-files error:', error);
    return NextResponse.json(
      { error: `File processing failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// Helper for PDF extraction (reuse from process-pdf/route.ts)
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pageTexts: Record<number, { text: string; x: number; y: number }[]> = {};
    let currentPage = 0;
    new PdfReader().parseBuffer(buffer, (err, item: PDFItem | null) => {
      if (err) {
        reject(err);
        return;
      }
      if (!item) {
        // End of file
        const allText = Object.keys(pageTexts)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(pageNum => {
            const pageItems = pageTexts[parseInt(pageNum)];
            pageItems.sort((a, b) => {
              const yDiff = Math.abs(a.y - b.y);
              if (yDiff < 0.3) return a.x - b.x;
              return a.y - b.y;
            });
            const rows: typeof pageItems[] = [];
            let currentRow: typeof pageItems = [];
            let prevY: number | null = null;
            pageItems.forEach(item => {
              if (prevY === null || Math.abs(item.y - prevY) < 0.3) {
                currentRow.push(item);
              } else {
                rows.push([...currentRow]);
                currentRow = [item];
              }
              prevY = item.y;
            });
            if (currentRow.length > 0) rows.push(currentRow);
            const pageText = rows.map(row => {
              let rowText = '';
              let prevItem: typeof pageItems[0] | null = null;
              row.forEach(item => {
                if (prevItem) {
                  const gap = item.x - (prevItem.x + prevItem.text.length * 0.5);
                  if (gap > 0.5) rowText += ' ';
                }
                rowText += item.text;
                prevItem = item;
              });
              return rowText;
            }).join('\n');
            return `[Page ${pageNum}]\n${pageText}\n`;
          })
          .join('\n');
        resolve(allText.trim() || '');
        return;
      }
      if (item.page !== undefined) {
        currentPage = item.page;
        pageTexts[currentPage] = pageTexts[currentPage] || [];
      }
      if (item.text && item.x !== undefined && item.y !== undefined) {
        pageTexts[currentPage] = pageTexts[currentPage] || [];
        pageTexts[currentPage].push({
          text: item.text,
          x: item.x,
          y: item.y
        });
      }
    });
  });
} 