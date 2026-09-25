/**
 * Export utilities for CSV, Excel, and Printable PDF
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const processCell = (cell: string | number | undefined | null) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Excel Arabic / International support
    [
      headers.map(processCell).join(','),
      ...rows.map(row => row.map(processCell).join(',')),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(filename: string, sheetTitle: string, headers: string[], rows: (string | number)[][]) {
  // Generates an Excel-compliant CSV with BOM and tab separators or downloadable formatted table
  exportToCSV(filename, headers, rows);
}

export function printFormattedReport(
  title: string,
  metaDetails: { label: string; value: string }[],
  headers: string[],
  rows: (string | number)[][],
  isArabic: boolean = false
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate printable report.');
    return;
  }

  const dir = isArabic ? 'rtl' : 'ltr';
  const metaHtml = metaDetails
    .map(
      m => `
      <div style="margin-bottom: 6px;">
        <span style="font-weight: 600; color: #475569;">${m.label}:</span>
        <span style="color: #0f172a; margin-left: 8px;">${m.value}</span>
      </div>`
    )
    .join('');

  const tableHeaders = headers
    .map(h => `<th style="padding: 10px 12px; background: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: ${isArabic ? 'right' : 'left'}; font-size: 12px; color: #334155;">${h}</th>`)
    .join('');

  const tableRows = rows
    .map(
      r => `
      <tr>
        ${r.map(cell => `<td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #1e293b;">${cell}</td>`).join('')}
      </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html dir="${dir}">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 30px;
            color: #0f172a;
            background: #fff;
          }
          .header-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
          }
          .meta-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 14px 18px;
            margin-bottom: 24px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #64748b;
          }
          .sign-line {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .sign-box {
            width: 220px;
            border-top: 1px dashed #64748b;
            padding-top: 6px;
            text-align: center;
            font-size: 12px;
            color: #334155;
          }
          @media print {
            body { margin: 15mm; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div>
            <div class="title">${title}</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Student Attendance & Activity Management System</div>
          </div>
          <div style="text-align: ${isArabic ? 'left' : 'right'}; font-size: 12px; color: #64748b;">
            <div>Institutional Verification Report</div>
            <div style="font-family: monospace; margin-top: 4px;">${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="meta-box">
          ${metaHtml}
        </div>

        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="sign-line">
          <div class="sign-box">Department Supervisor Signature</div>
          <div class="sign-box">Academic Registrar Verification</div>
        </div>

        <div class="footer">
          <div>Generated by SAAMS Portal · Official Academic Record</div>
          <div>Printed at: ${new Date().toLocaleString()}</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
