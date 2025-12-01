// Serviço de envio de e-mails
import { Invoice } from '../types/invoice';

export const sendInvoiceEmail = async (invoice: Invoice): Promise<boolean> => {
  try {
    // Em produção, aqui faria a chamada à API de e-mail (SendGrid, AWS SES, etc.)
    // Por enquanto, simulação
    
    const emailData = {
      to: 'cliente@example.com', // Em produção, buscar do customer
      subject: `Invoice ${invoice.invoiceNumber} - Bless Pool System`,
      body: `
Prezado(a) ${invoice.customerName},

Segue em anexo a invoice ${invoice.invoiceNumber}.

DETALHES:
- Data de Emissão: ${new Date(invoice.issueDate).toLocaleDateString('pt-BR')}
- Data de Vencimento: ${new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
- Valor Total: R$ ${invoice.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
${invoice.lateFee && invoice.lateFee > 0 ? `- Taxa de Atraso: R$ ${invoice.lateFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}

ITENS:
${invoice.items.map(item => 
  `- ${item.description}: ${item.quantity} x R$ ${item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} = R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
).join('\n')}

${invoice.notes ? `\nObservações: ${invoice.notes}` : ''}

Por favor, efetue o pagamento até a data de vencimento.

Atenciosamente,
Bless Pool System
      `,
      attachments: [
        // Em produção, gerar PDF da invoice e anexar
        {
          filename: `invoice_${invoice.invoiceNumber}.pdf`,
          content: 'PDF_CONTENT_HERE', // Em produção, seria o PDF gerado
        },
      ],
    };

    console.log('Enviando e-mail...', emailData);
    
    // Simulação de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
};

