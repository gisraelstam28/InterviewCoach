// frontend/src/utils/pdfUtils.ts
import * as pdfjsLib from 'pdfjs-dist';

// Initialize the PDF.js worker.
try {
  // The worker file has an .mjs extension in newer versions of pdfjs-dist
  // For Vite, using `new URL` with `import.meta.url` is a common way to get the correct path.
  const pdfWorkerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
  console.log('PDF.js worker initialized with path:', pdfWorkerSrc);
} catch (e) {
  console.warn(
    "Failed to set PDF.js worker path using `new URL`. This might happen in some environments or test runners. Error:", e
  );
  // Fallback: Ensure 'pdf.worker.min.js' from 'node_modules/pdfjs-dist/build/'
  // is copied to your 'public' assets folder.
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'; // Assumes it's in the root of public
  console.info("Attempting fallback PDF.js worker path: '/pdf.worker.min.js'. Ensure 'pdf.worker.min.js' is copied to your public assets folder.");
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // The `items` array can contain objects of type TextItem.
    const pageText = textContent.items.map(item => (item as any).str).join(' '); // Using 'as any' for simplicity
    fullText += pageText + '\n';
  }
  return fullText.trim();
}
