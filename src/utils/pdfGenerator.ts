// Geração de PDF real usando jsPDF
import jsPDF from 'jspdf';
import { Invoice } from '../types/invoice';
import { ServiceData, Client } from '../types/route';
import { formatCurrency } from './formatUtils';

// Configuração de fonte e cores
const PRIMARY_COLOR = [102, 126, 234];
const SECONDARY_COLOR = [118, 75, 162];
const TEXT_COLOR = [26, 26, 46];
const BORDER_COLOR = [200, 200, 200];

export const generateInvoicePDF = async (invoice: Invoice, language: 'pt-BR' | 'en-US' = 'pt-BR'): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Header com gradiente (simulado com retângulos)
  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Logo/Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('BLESS POOL SYSTEM', margin, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(language === 'pt-BR' ? 'Sistema de Gerenciamento' : 'Management System', margin, 35);

  yPos = 60;

  // Informações da Invoice
  doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'pt-BR' ? 'INVOICE' : 'INVOICE', margin, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const invoiceInfo = [
    { label: language === 'pt-BR' ? 'Número:' : 'Number:', value: invoice.invoiceNumber },
    { label: language === 'pt-BR' ? 'Data de Emissão:' : 'Issue Date:', value: new Date(invoice.issueDate).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US') },
    { label: language === 'pt-BR' ? 'Data de Vencimento:' : 'Due Date:', value: new Date(invoice.dueDate).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US') },
    { label: language === 'pt-BR' ? 'Status:' : 'Status:', value: invoice.status },
  ];

  invoiceInfo.forEach((info, index) => {
    doc.text(`${info.label} ${info.value}`, margin + (index % 2) * 90, yPos);
    if (index % 2 === 1) yPos += 7;
  });

  if (invoiceInfo.length % 2 === 1) yPos += 7;
  yPos += 10;

  // Informações do Cliente
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'pt-BR' ? 'Cliente:' : 'Customer:', margin, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerName, margin, yPos);
  
  yPos += 15;

  // Tabela de Itens
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'pt-BR' ? 'Itens:' : 'Items:', margin, yPos);
  
  yPos += 8;
  
  // Cabeçalho da tabela
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'pt-BR' ? 'Descrição' : 'Description', margin + 2, yPos);
  doc.text(language === 'pt-BR' ? 'Qtd' : 'Qty', margin + 100, yPos);
  doc.text(language === 'pt-BR' ? 'Preço Unit.' : 'Unit Price', margin + 120, yPos);
  doc.text(language === 'pt-BR' ? 'Total' : 'Total', margin + 160, yPos);
  
  yPos += 10;

  // Itens
  doc.setFont('helvetica', 'normal');
  invoice.items.forEach((item) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }

    doc.text(item.description.substring(0, 40), margin + 2, yPos);
    doc.text(item.quantity.toString(), margin + 100, yPos);
    doc.text(formatCurrency(item.unitPrice, language), margin + 120, yPos);
    doc.text(formatCurrency(item.total, language), margin + 160, yPos);
    
    yPos += 7;
  });

  yPos += 5;

  // Linha separadora
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Totais
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'pt-BR' ? 'Subtotal:' : 'Subtotal:', margin + 120, yPos);
  doc.text(formatCurrency(invoice.subtotal, language), margin + 160, yPos);
  
  yPos += 7;

  if (invoice.lateFee && invoice.lateFee > 0) {
    doc.setFont('helvetica', 'normal');
    doc.text(language === 'pt-BR' ? 'Taxa de Atraso:' : 'Late Fee:', margin + 120, yPos);
    doc.text(formatCurrency(invoice.lateFee, language), margin + 160, yPos);
    yPos += 7;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(language === 'pt-BR' ? 'Total:' : 'Total:', margin + 120, yPos);
  doc.text(formatCurrency(invoice.total, language), margin + 160, yPos);

  yPos += 15;

  // Observações
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(language === 'pt-BR' ? 'Observações:' : 'Notes:', margin, yPos);
    yPos += 7;
    const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
    notesLines.forEach((line: string) => {
      doc.text(line, margin, yPos);
      yPos += 5;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
      doc.text(
      language === 'pt-BR' 
        ? `Página ${i} de ${pageCount} - Bless Pool System`
        : `Page ${i} of ${pageCount} - Bless Pool System`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
};

export const generateServiceReportPDF = async (
  serviceData: ServiceData,
  client: Client,
  language: 'pt-BR' | 'en-US' = 'pt-BR'
): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Header
  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('BLESS POOL SYSTEM', margin, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(language === 'pt-BR' ? 'Relatório de Serviço' : 'Service Report', margin, 35);

  yPos = 60;

  // Informações do Cliente
  doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'pt-BR' ? 'Informações do Cliente' : 'Customer Information', margin, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${language === 'pt-BR' ? 'Nome:' : 'Name:'} ${client.name}`, margin, yPos);
  yPos += 7;
  doc.text(`${language === 'pt-BR' ? 'Endereço:' : 'Address:'} ${client.address}`, margin, yPos);
  yPos += 7;
  doc.text(`${language === 'pt-BR' ? 'Data:' : 'Date:'} ${new Date().toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}`, margin, yPos);
  
  yPos += 15;

  // Checklist
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'pt-BR' ? 'Checklist' : 'Checklist', margin, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  serviceData.checklist.forEach((item) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }
    doc.text(`${item.checked ? '✓' : '☐'} ${item.label}`, margin + 5, yPos);
    yPos += 6;
  });

  yPos += 10;

  // Leituras de Químicos
  if (serviceData.readings.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(language === 'pt-BR' ? 'Leituras de Químicos' : 'Chemical Readings', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    serviceData.readings.forEach((reading) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(`${reading.chemical}: ${reading.value} ${reading.unit}`, margin + 5, yPos);
      yPos += 6;
    });
    yPos += 10;
  }

  // Dosagens Aplicadas
  if (serviceData.dosages.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(language === 'pt-BR' ? 'Dosagens Aplicadas' : 'Applied Dosages', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    serviceData.dosages.forEach((dosage) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(`${dosage.chemical}: ${dosage.amount} ${dosage.unit}`, margin + 5, yPos);
      yPos += 6;
    });
    yPos += 10;
  }

  // Observações
  if (serviceData.observations) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(language === 'pt-BR' ? 'Observações' : 'Observations', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(serviceData.observations, pageWidth - 2 * margin);
    notesLines.forEach((line: string) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin + 5, yPos);
      yPos += 6;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
      doc.text(
      language === 'pt-BR' 
        ? `Página ${i} de ${pageCount} - Bless Pool System`
        : `Page ${i} of ${pageCount} - Bless Pool System`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
};

// Função para enviar relatório de serviço por e-mail
export const sendServiceReportEmail = async (
  serviceData: ServiceData,
  client: Client,
  clientEmail: string,
  customMessage?: string,
  language: 'pt-BR' | 'en-US' = 'pt-BR'
): Promise<boolean> => {
  try {
    // Gerar PDF do relatório
    const pdfBlob = await generateServiceReportPDF(serviceData, client, language);
    
    // Em produção, aqui faria a chamada à API de e-mail (SendGrid, AWS SES, etc.)
    // Por enquanto, simulação
    
    const emailData = {
      to: clientEmail,
      subject: language === 'pt-BR' 
        ? `Relatório de Serviço - ${client.name} - Bless Pool System`
        : `Service Report - ${client.name} - Bless Pool System`,
      body: `
${language === 'pt-BR' ? 'Prezado(a)' : 'Dear'} ${client.name},

${language === 'pt-BR' 
  ? 'Segue em anexo o relatório do serviço realizado.'
  : 'Please find attached the service report.'}

${language === 'pt-BR' ? 'DETALHES:' : 'DETAILS:'}
- ${language === 'pt-BR' ? 'Data' : 'Date'}: ${new Date(serviceData.completedAt || '').toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}
- ${language === 'pt-BR' ? 'Técnico' : 'Technician'}: ${(serviceData as any).technician || 'N/A'}

${serviceData.readings.length > 0 ? `
${language === 'pt-BR' ? 'LEITURAS DE QUÍMICOS:' : 'CHEMICAL READINGS:'}
${serviceData.readings.map(r => `- ${r.chemical}: ${r.value} ${r.unit}`).join('\n')}
` : ''}

${serviceData.dosages.length > 0 ? `
${language === 'pt-BR' ? 'DOSAGENS APLICADAS:' : 'APPLIED DOSAGES:'}
${serviceData.dosages.map(d => `- ${d.chemical}: ${d.amount} ${d.unit}`).join('\n')}
` : ''}

${customMessage ? `\n${customMessage}\n` : ''}

${serviceData.observations ? `\n${language === 'pt-BR' ? 'Observações' : 'Observations'}: ${serviceData.observations}` : ''}

${language === 'pt-BR' ? 'Atenciosamente,' : 'Best regards,'}
Bless Pool System
      `,
      attachments: [
        {
          filename: language === 'pt-BR' 
            ? `relatorio_servico_${client.name}_${new Date().toISOString().split('T')[0]}.pdf`
            : `service_report_${client.name}_${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBlob, // PDF gerado
        },
      ],
    };

    console.log('Enviando relatório de serviço por e-mail...', emailData);
    
    // Simulação de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar relatório de serviço por e-mail:', error);
    return false;
  }
};
