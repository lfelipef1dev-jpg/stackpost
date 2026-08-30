import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/rbac';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(req, 'billing.read');
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabase();

  // Buscar invoice na tabela invoices
  const { data: invoice, error: invError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (invError || !invoice) {
    // Fallback: buscar em processed_payments
    const { data: payment } = await supabase
      .from('stackpost_processed_payments')
      .select('id, payment_id, order_id, team_id, processado_em, amount_cents, currency, status, gateway_raw')
      .eq('id', id)
      .single();

    if (!payment) {
      return NextResponse.json({ error: 'Fatura não encontrada' }, { status: 404 });
    }

    // Gerar PDF simples do payment
    const pdfContent = generateSimplePDF(payment);
    return new NextResponse(new Uint8Array(pdfContent), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fatura-${id}.pdf"`,
      },
    });
  }

  // Gerar PDF da invoice
  const pdfContent = generateInvoicePDF(invoice);
  return new NextResponse(new Uint8Array(pdfContent), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoice_number || id}.pdf"`,
    },
  });
}

function generateInvoicePDF(invoice: any): Buffer {
  const lines: string[] = [];
  lines.push('STACKPOST - FATURA');
  lines.push('');
  lines.push(`Numero: ${invoice.invoice_number || invoice.id}`);
  lines.push(`Status: ${invoice.status || 'paid'}`);
  lines.push(`Periodo: ${invoice.period_start || '-'} a ${invoice.period_end || '-'}`);
  lines.push('');
  lines.push(`Subtotal: R$ ${((invoice.subtotal_cents || 0) / 100).toFixed(2)}`);
  lines.push(`Desconto: R$ ${((invoice.discount_cents || 0) / 100).toFixed(2)}`);
  lines.push(`Taxa: R$ ${((invoice.tax_cents || 0) / 100).toFixed(2)}`);
  lines.push(`Total: R$ ${((invoice.total_cents || 0) / 100).toFixed(2)}`);
  lines.push('');
  if (invoice.line_items) {
    lines.push('ITENS:');
    const items = typeof invoice.line_items === 'string' ? JSON.parse(invoice.line_items) : invoice.line_items;
    if (Array.isArray(items)) {
      for (const item of items) {
        lines.push(`  - ${item.description || item.name || '-'}: R$ ${((item.amount_cents || 0) / 100).toFixed(2)}`);
      }
    }
  }
  lines.push('');
  lines.push(`Organizacao: ${invoice.organization_id || '-'}`);
  lines.push(`Team: ${invoice.team_id || '-'}`);
  lines.push(`Criada em: ${invoice.created_at || '-'}`);

  return buildPDF(lines.join('\n'));
}

function generateSimplePDF(payment: any): Buffer {
  const lines: string[] = [];
  lines.push('STACKPOST - COMPROVANTE DE PAGAMENTO');
  lines.push('');
  lines.push(`ID: ${payment.id}`);
  lines.push(`Payment ID: ${payment.payment_id || '-'}`);
  lines.push(`Order ID: ${payment.order_id || '-'}`);
  lines.push(`Team ID: ${payment.team_id || '-'}`);
  lines.push(`Data: ${payment.processado_em || '-'}`);
  lines.push(`Valor: R$ ${((payment.amount_cents || 0) / 100).toFixed(2)}`);
  lines.push(`Moeda: ${payment.currency || 'BRL'}`);
  lines.push(`Status: ${payment.status || 'approved'}`);

  return buildPDF(lines.join('\n'));
}

function buildPDF(text: string): Buffer {
  // PDF minimalista com texto
  const escaped = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const lines = escaped.split('\n');
  let content = '';
  let y = 750;
  for (const line of lines) {
    content += `BT /F1 10 Tf 50 ${y} Td (${line}) Tj ET\n`;
    y -= 15;
  }

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${content.length} >>
stream
${content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000${(241 + content.length + 50).toString().padStart(7, '0')} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${241 + content.length + 100}
%%EOF`;

  return Buffer.from(pdf, 'latin1');
}
