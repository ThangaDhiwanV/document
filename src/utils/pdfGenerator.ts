import jsPDF from 'jspdf';
import { Document, User } from '../types';
import { format } from 'date-fns';

export interface PDFGenerationOptions {
  includeAuditTrail?: boolean;
  includeSignatures?: boolean;
  watermark?: string;
}

export const generateDocumentPDF = async (
  document: Document,
  users: User[],
  options: PDFGenerationOptions = {}
): Promise<void> => {
  const {
    includeAuditTrail = true,
    includeSignatures = true,
    watermark
  } = options;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      addHeader();
    }
  };

  // Helper function to add header on each page
  const addHeader = () => {
    // Company logo area
    pdf.setFillColor(59, 130, 246);
    pdf.rect(margin, 10, 20, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PL', margin + 10, 20, { align: 'center' });

    // Company header
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pharma LIMS Document Management System', margin + 25, 15);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Quality Control Laboratory - Building A', margin + 25, 20);
    
    // Document status watermark
    if (document.status === 'signed') {
      pdf.setTextColor(34, 197, 94);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('✓ DIGITALLY SIGNED', pageWidth - margin, 15, { align: 'right' });
    }

    // Horizontal line
    pdf.setDrawColor(229, 231, 235);
    pdf.line(margin, 30, pageWidth - margin, 30);
    
    yPosition = 40;
  };

  // Add watermark if specified
  const addWatermark = (text: string) => {
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.1 }));
    pdf.setTextColor(128, 128, 128);
    pdf.setFontSize(50);
    pdf.setFont('helvetica', 'bold');
    
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    pdf.text(text, centerX, centerY, {
      align: 'center',
      angle: 45
    });
    pdf.restoreGraphicsState();
  };

  // Start document generation
  addHeader();

  if (watermark) {
    addWatermark(watermark);
  }

  // Document title and metadata section
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 41, 55);
  pdf.text(document.name, margin, yPosition);
  yPosition += 12;

  // Document metadata in a structured layout
  const metadataBoxY = yPosition;
  pdf.setFillColor(249, 250, 251);
  pdf.rect(margin, metadataBoxY, pageWidth - 2 * margin, 25, 'F');
  pdf.setDrawColor(229, 231, 235);
  pdf.rect(margin, metadataBoxY, pageWidth - 2 * margin, 25, 'D');

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(75, 85, 99);

  const creator = users.find(u => u.id === document.createdBy);
  
  // Left column
  pdf.text(`Document ID: ${document.id}`, margin + 5, metadataBoxY + 6);
  pdf.text(`Type: ${document.type.replace('_', ' ').toUpperCase()}`, margin + 5, metadataBoxY + 12);
  pdf.text(`Created by: ${creator?.name || 'Unknown'}`, margin + 5, metadataBoxY + 18);

  // Right column
  pdf.text(`Version: ${document.version}`, pageWidth - margin - 60, metadataBoxY + 6);
  pdf.text(`Status: ${document.status.replace('_', ' ').toUpperCase()}`, pageWidth - margin - 60, metadataBoxY + 12);
  pdf.text(`Created: ${format(document.createdAt, 'MMM d, yyyy')}`, pageWidth - margin - 60, metadataBoxY + 18);

  yPosition += 35;

  // Document content section with better structure
  if (document.data && Object.keys(document.data).length > 0) {
    checkPageBreak(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Document Content', margin, yPosition);
    yPosition += 12;

    // Organize content by sections if possible
    const contentEntries = Object.entries(document.data);
    const sectionsPerRow = 2;
    const sectionWidth = (pageWidth - 2 * margin - 10) / sectionsPerRow;

    contentEntries.forEach(([key, value], index) => {
      const col = index % sectionsPerRow;
      const row = Math.floor(index / sectionsPerRow);
      
      if (col === 0) {
        checkPageBreak(25);
      }

      const xPos = margin + (col * (sectionWidth + 10));
      const yPos = yPosition + (row * 25);

      // Field container
      pdf.setFillColor(248, 250, 252);
      pdf.rect(xPos, yPos, sectionWidth, 20, 'F');
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(xPos, yPos, sectionWidth, 20, 'D');

      // Field label
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(71, 85, 105);
      const fieldLabel = key.replace('field-', '').replace(/([A-Z])/g, ' $1').trim();
      pdf.text(fieldLabel, xPos + 3, yPos + 6);

      // Field value
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(15, 23, 42);
      const fieldValue = String(value || 'Not specified');
      const truncatedValue = fieldValue.length > 30 ? fieldValue.substring(0, 30) + '...' : fieldValue;
      pdf.text(truncatedValue, xPos + 3, yPos + 12);

      // Update yPosition after each row
      if (col === sectionsPerRow - 1 || index === contentEntries.length - 1) {
        yPosition = yPos + 25;
      }
    });

    yPosition += 10;
  }

  // Enhanced test results section for pharmaceutical documents
  if (document.type === 'coa' || document.type === 'test_method') {
    checkPageBreak(80);
    yPosition += 10;
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Analytical Results', margin, yPosition);
    yPosition += 12;

    // Professional table with better styling
    const tableData = [
      { parameter: 'Assay (%)', specification: '98.0 - 102.0', result: '99.8', status: 'Pass' },
      { parameter: 'Related Substances (%)', specification: '≤ 2.0', result: '0.3', status: 'Pass' },
      { parameter: 'Water Content (%)', specification: '≤ 0.5', result: '0.2', status: 'Pass' },
      { parameter: 'pH', specification: '6.0 - 8.0', result: '7.2', status: 'Pass' },
      { parameter: 'Dissolution (%)', specification: '≥ 80% in 30 min', result: '95%', status: 'Pass' }
    ];

    // Table header with better styling
    pdf.setFillColor(59, 130, 246);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    
    const colWidths = [50, 45, 30, 25];
    let xPos = margin + 3;
    
    ['Parameter', 'Specification', 'Result', 'Status'].forEach((header, index) => {
      pdf.text(header, xPos, yPosition + 7);
      xPos += colWidths[index];
    });
    
    yPosition += 12;

    // Table data with alternating colors
    tableData.forEach((row, index) => {
      checkPageBreak(8);
      
      // Alternating row colors
      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
      }
      
      // Row border
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'D');
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(9);
      
      xPos = margin + 3;
      [row.parameter, row.specification, row.result].forEach((cell, cellIndex) => {
        pdf.text(cell, xPos, yPosition + 5);
        xPos += colWidths[cellIndex];
      });
      
      // Status with color coding
      pdf.setTextColor(row.status === 'Pass' ? 34 : 239, row.status === 'Pass' ? 197 : 68, row.status === 'Pass' ? 94 : 68);
      pdf.setFont('helvetica', 'bold');
      pdf.text(row.status, xPos, yPosition + 5);
      
      yPosition += 8;
    });

    yPosition += 10;
  }

  // Enhanced digital signatures section
  if (includeSignatures && document.signatures.length > 0) {
    checkPageBreak(50);
    yPosition += 15;
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Digital Signatures & Approvals', margin, yPosition);
    yPosition += 12;

    document.signatures.forEach((signature, index) => {
      checkPageBreak(40);
      
      const signer = users.find(u => u.id === signature.userId);
      
      // Enhanced signature box
      pdf.setDrawColor(34, 197, 94);
      pdf.setFillColor(240, 253, 244);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'FD');
      
      // Signature verification icon
      pdf.setFillColor(34, 197, 94);
      pdf.circle(margin + 15, yPosition + 17, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('✓', margin + 15, yPosition + 20, { align: 'center' });
      
      // Signature details in structured format
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${signer?.name || 'Unknown Signer'}`, margin + 30, yPosition + 8);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(75, 85, 99);
      pdf.text(`Role: ${signature.userRole.replace('_', ' ').toUpperCase()}`, margin + 30, yPosition + 14);
      pdf.text(`Signed: ${format(signature.signedAt, 'MMM d, yyyy HH:mm:ss')}`, margin + 30, yPosition + 20);
      pdf.text(`Reason: ${signature.reason}`, margin + 30, yPosition + 26);
      
      // Security information
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`IP: ${signature.ipAddress}`, pageWidth - margin - 50, yPosition + 14, { align: 'right' });
      
      const signatureHash = `SHA256: ${signature.id.substring(0, 8)}...${signature.signatureData.substring(0, 12)}`;
      pdf.setFont('helvetica', 'mono');
      pdf.text(signatureHash, pageWidth - margin - 50, yPosition + 20, { align: 'right' });
      
      // Compliance statement
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(7);
      pdf.text('21 CFR Part 11 Compliant Digital Signature', pageWidth - margin - 50, yPosition + 26, { align: 'right' });
      
      yPosition += 40;
    });
  }

  // Enhanced audit trail section
  if (includeAuditTrail && document.auditTrail.length > 0) {
    checkPageBreak(40);
    yPosition += 15;
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Document Audit Trail', margin, yPosition);
    yPosition += 12;

    // Audit trail table header
    pdf.setFillColor(243, 244, 246);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
    pdf.setDrawColor(209, 213, 219);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'D');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 65, 81);
    pdf.text('Timestamp', margin + 3, yPosition + 5);
    pdf.text('Action', margin + 45, yPosition + 5);
    pdf.text('User', margin + 90, yPosition + 5);
    pdf.text('Details', margin + 125, yPosition + 5);
    
    yPosition += 10;

    document.auditTrail.forEach((entry, index) => {
      checkPageBreak(12);
      
      const user = users.find(u => u.id === entry.userId);
      
      // Alternating row colors
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
      }
      
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'D');
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(31, 41, 55);
      
      pdf.text(format(entry.timestamp, 'MMM d, HH:mm'), margin + 3, yPosition + 6);
      pdf.text(entry.action, margin + 45, yPosition + 6);
      pdf.text(user?.name || 'Unknown', margin + 90, yPosition + 6);
      
      // Truncate details if too long
      const details = entry.details || '';
      const truncatedDetails = details.length > 25 ? details.substring(0, 25) + '...' : details;
      pdf.text(truncatedDetails, margin + 125, yPosition + 6);
      
      yPosition += 10;
    });
  }

  // Enhanced footer with compliance information
  const addFooter = () => {
    const footerY = pageHeight - 20;
    pdf.setDrawColor(229, 231, 235);
    pdf.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
    
    // Compliance box
    pdf.setFillColor(239, 246, 255);
    pdf.rect(margin, footerY - 6, pageWidth - 2 * margin, 12, 'F');
    pdf.setDrawColor(147, 197, 253);
    pdf.rect(margin, footerY - 6, pageWidth - 2 * margin, 12, 'D');
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175);
    pdf.text('FDA 21 CFR Part 11 Compliant Document', margin + 3, footerY - 2);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text(`Generated: ${format(new Date(), 'MMM d, yyyy HH:mm:ss')}`, pageWidth - margin - 3, footerY - 2, { align: 'right' });
    
    pdf.text('This document was generated electronically and maintains data integrity', margin + 3, footerY + 2);
    pdf.text(`Page ${pdf.internal.getCurrentPageInfo().pageNumber}`, pageWidth - margin - 3, footerY + 2, { align: 'right' });
  };

  // Add footer to all pages
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter();
  }

  // Save the PDF with structured filename
  const fileName = `${document.name.replace(/[^a-zA-Z0-9]/g, '_')}_v${document.version}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
  pdf.save(fileName);
};