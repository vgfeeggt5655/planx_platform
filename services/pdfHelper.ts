
// We need to dynamically import these heavy libraries to use them.
// Let's assume they are available via a global script tag or a CDN.
// For a real build setup, you'd use `import * as pdfjsLib from 'pdfjs-dist/build/pdf';`
// and `import { jsPDF } from 'jspdf';`

// Let's create a placeholder for now, as a full setup is complex without a bundler.
// A real app would load these from a CDN in index.html.
// e.g., <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

import { Flashcard } from '../types';

declare const pdfjsLib: any;
declare const jspdf: any;


export const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
    try {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('pdf.js library is not loaded.');
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to process PDF file.');
    }
};

export const createPdfFromFlashcards = (flashcards: Flashcard[], lectureTitle: string): void => {
    try {
        if (typeof jspdf === 'undefined') {
            throw new Error('jsPDF library is not loaded.');
        }

        const { jsPDF } = jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Flashcards for: ${lectureTitle}`, 14, 22);

        doc.setFontSize(12);
        let y = 40;

        flashcards.forEach((card, index) => {
            if (y > 270) { // Check for page break
                doc.addPage();
                y = 20;
            }

            doc.setFont('helvetica', 'bold');
            const frontText = doc.splitTextToSize(`Q: ${card.front}`, 180);
            doc.text(frontText, 14, y);
            y += (frontText.length * 7);

            doc.setFont('helvetica', 'normal');
            const backText = doc.splitTextToSize(`A: ${card.back}`, 180);
            doc.text(backText, 14, y);
            y += (backText.length * 7);

            if (index < flashcards.length - 1) {
                y += 5;
                doc.setDrawColor(200);
                doc.line(14, y, 196, y); // Separator line
                y += 10;
            }
        });
        
        doc.save(`${lectureTitle}-flashcards.pdf`);
    } catch(error) {
        console.error('Error creating PDF from flashcards:', error);
        alert('Could not generate PDF. Please ensure jsPDF library is loaded correctly.');
    }
};
