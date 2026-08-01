import { jsPDF } from 'jspdf';
import { AnalysisResult } from '../types';

export function exportAnalysisToPdf(result: AnalysisResult) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('AI BUG FIX ASSISTANT REPORT', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Generated: ${new Date(result.createdAt).toLocaleString()} | ID: ${result.id}`, 14, 24);

  y = 36;

  // Summary Card
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 22, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Language: ${result.language} (${result.framework})`, 18, y + 7);
  doc.text(`Severity: ${result.severity}`, 90, y + 7);
  doc.text(`Category: ${result.category}`, 140, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Confidence Score: ${result.confidence}%`, 18, y + 15);
  doc.text(`Time Complexity: ${result.time_complexity}`, 90, y + 15);
  doc.text(`Space Complexity: ${result.space_complexity}`, 140, y + 15);

  y += 30;

  // Bug Summary Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. BUG SUMMARY', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(result.bug_summary, pageWidth - 28);
  doc.text(summaryLines, 14, y);
  y += summaryLines.length * 5 + 6;

  // Root Cause
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. ROOT CAUSE ANALYSIS', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const causeLines = doc.splitTextToSize(result.root_cause, pageWidth - 28);
  doc.text(causeLines, 14, y);
  y += causeLines.length * 5 + 6;

  // Fix Steps
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. STEP-BY-STEP FIX', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  result.step_by_step_fix.forEach((step, idx) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const stepText = `${idx + 1}. ${step}`;
    const lines = doc.splitTextToSize(stepText, pageWidth - 28);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 2;
  });

  y += 4;

  // Corrected Code Snippet Header
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('4. CORRECTED CODE', 14, y);
  y += 6;

  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, pageWidth - 28, 45, 'F');

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  const codeLines = doc.splitTextToSize(result.fixed_code || '', pageWidth - 36);
  doc.text(codeLines.slice(0, 10), 18, y + 6);

  y += 52;

  // Security & Best Practices Summary
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  if (result.security_issues && result.security_issues.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38); // Red
    doc.text(`5. SECURITY VULNERABILITIES DETECTED (${result.security_issues.length})`, 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    result.security_issues.forEach((v) => {
      doc.text(`• [${v.severity}] ${v.type}: ${v.description}`, 14, y);
      y += 5;
    });
  }

  // Save PDF
  doc.save(`AIBugFix_${result.language}_${result.id.slice(-6)}.pdf`);
}
