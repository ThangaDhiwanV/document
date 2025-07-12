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
    // Company logo area (placeholder)
    pdf.setFillColor(59, 130, 246); // Blue color
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
      pdf.setTextColor(34, 197, 94); // Green
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
    
    // Rotate and center the watermark
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

  // Document title and metadata
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 41, 55);
  pdf.text(document.name, margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Document ID: ${document.id}`, margin, yPosition);
  pdf.text(`Version: ${document.version}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 6;

  pdf.text(`Type: ${document.type.replace('_', ' ').toUpperCase()}`, margin, yPosition);
  pdf.text(`Status: ${document.status.replace('_', ' ').toUpperCase()}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 6;

  const creator = users.find(u => u.id === document.createdBy);
  pdf.text(`Created by: ${creator?.name || 'Unknown'}`, margin, yPosition);
  pdf.text(`Created: ${format(document.createdAt, 'MMM d, yyyy HH:mm')}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 15;

  // Document content section
  checkPageBreak(20);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 41, 55);
  pdf.text('Document Content', margin, yPosition);
  yPosition += 10;

  // Add document data
  if (document.data && Object.keys(document.data).length > 0) {
    Object.entries(document.data).forEach(([key, value]) => {
      checkPageBreak(15);
      
      // Field label
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(75, 85, 99);
      const fieldLabel = key.replace('field-', '').replace(/([A-Z])/g, ' $1').trim();
      pdf.text(`${fieldLabel}:`, margin, yPosition);
      yPosition += 5;

      // Field value
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(31, 41, 55);
      const fieldValue = String(value || 'Not specified');
      
      // Handle long text with word wrapping
      const maxWidth = pageWidth - 2 * margin;
      const lines = pdf.splitTextToSize(fieldValue, maxWidth);
      
      lines.forEach((line: string) => {
        checkPageBreak(5);
        pdf.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      
      yPosition += 5;
    });
  } else {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(107, 114, 128);
    pdf.text('No content data available', margin, yPosition);
    yPosition += 10;
  }

  // Add sample pharmaceutical data for demonstration
  checkPageBreak(60);
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 41, 55);
  pdf.text('Test Results Summary', margin, yPosition);
  yPosition += 10;

  const sampleData = [
    { parameter: 'Assay (%)', specification: '98.0 - 102.0', result: '99.8', status: 'Pass' },
    { parameter: 'Related Substances (%)', specification: '≤ 2.0', result: '0.3', status: 'Pass' },
    { parameter: 'Water Content (%)', specification: '≤ 0.5', result: '0.2', status: 'Pass' },
    { parameter: 'pH', specification: '6.0 - 8.0', result: '7.2', status: 'Pass' }
  ];

  // Table header
  pdf.setFillColor(243, 244, 246);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 41, 55);
  
  const colWidths = [60, 40, 30, 25];
  let xPos = margin + 2;
  
  ['Parameter', 'Specification', 'Result', 'Status'].forEach((header, index) => {
    pdf.text(header, xPos, yPosition + 5);
    xPos += colWidths[index];
  });
  
  yPosition += 10;

  // Table data
  sampleData.forEach((row, index) => {
    checkPageBreak(8);
    
    if (index % 2 === 0) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 6, 'F');
    }
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(31, 41, 55);
    
    xPos = margin + 2;
    [row.parameter, row.specification, row.result].forEach((cell, cellIndex) => {
      pdf.text(cell, xPos, yPosition + 4);
      xPos += colWidths[cellIndex];
    });
    
    // Status with color
    pdf.setTextColor(row.status === 'Pass' ? 34 : 239, row.status === 'Pass' ? 197 : 68, row.status === 'Pass' ? 94 : 68);
    pdf.setFont('helvetica', 'bold');
    pdf.text(row.status, xPos, yPosition + 4);
    
    yPosition += 6;
  });

  // Digital signatures section
  if (includeSignatures && document.signatures.length > 0) {
    checkPageBreak(40);
    yPosition += 15;
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Digital Signatures', margin, yPosition);
    yPosition += 10;

    document.signatures.forEach((signature, index) => {
      checkPageBreak(35);
      
      const signer = users.find(u => u.id === signature.userId);
      
      // Signature box
      pdf.setDrawColor(229, 231, 235);
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'FD');
      
      // Signature icon/placeholder
      pdf.setFillColor(34, 197, 94);
      pdf.rect(margin + 5, yPosition + 5, 20, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('✓', margin + 15, yPosition + 17, { align: 'center' });
      
      // Signature details
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${signer?.name || 'Unknown Signer'}`, margin + 30, yPosition + 8);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Role: ${signature.userRole.replace('_', ' ').toUpperCase()}`, margin + 30, yPosition + 13);
      pdf.text(`Signed: ${format(signature.signedAt, 'MMM d, yyyy HH:mm:ss')}`, margin + 30, yPosition + 18);
      pdf.text(`Reason: ${signature.reason}`, margin + 30, yPosition + 23);
      pdf.text(`IP: ${signature.ipAddress}`, pageWidth - margin - 30, yPosition + 18, { align: 'right' });
      
      // Digital signature hash (simulated)
      const signatureHash = `SHA256: ${signature.id.substring(0, 8)}...${signature.signatureData.substring(0, 16)}`;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'mono');
      pdf.text(signatureHash, pageWidth - margin - 30, yPosition + 23, { align: 'right' });
      
      yPosition += 35;
    });
  }

  // Audit trail section
  if (includeAuditTrail && document.auditTrail.length > 0) {
    checkPageBreak(30);
    yPosition += 15;
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Audit Trail', margin, yPosition);
    yPosition += 10;

    document.auditTrail.forEach((entry) => {
      checkPageBreak(12);
      
      const user = users.find(u => u.id === entry.userId);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text(`${format(entry.timestamp, 'MMM d, yyyy HH:mm:ss')}`, margin, yPosition);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${entry.action} by ${user?.name || 'Unknown'}`, margin + 40, yPosition);
      
      if (entry.details) {
        yPosition += 4;
        pdf.setTextColor(107, 114, 128);
        pdf.setFontSize(8);
        pdf.text(entry.details, margin + 5, yPosition);
      }
      
      yPosition += 8;
    });
  }

  // Footer with compliance information
  const addFooter = () => {
    const footerY = pageHeight - 15;
    pdf.setDrawColor(229, 231, 235);
    pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    pdf.text('This document was generated electronically and is compliant with 21 CFR Part 11', margin, footerY);
    pdf.text(`Generated: ${format(new Date(), 'MMM d, yyyy HH:mm:ss')}`, pageWidth - margin, footerY, { align: 'right' });
  };

  // Add footer to all pages
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter();
  }

  // Save the PDF
  const fileName = `${document.name.replace(/[^a-zA-Z0-9]/g, '_')}_v${document.version}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
  pdf.save(fileName);
};