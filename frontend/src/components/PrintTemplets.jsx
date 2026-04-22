// ─────────────────────────────────────────────────────────────────────────────
// printTemplate.js
// Usage: import { buildPrintHTML } from "./printTemplate.js";
// ─────────────────────────────────────────────────────────────────────────────

// ── Doctor header configs ────────────────────────────────────────────────────
import jivanJyot from "../assets/jivanjyot-red.png";

const DOCTORS = {
  "Dr. Darshak": {
    name: "Dr. Darshak H. Parmar",
    regd: "Regd. No. GB I -27840",
    degree: "B.A.M.S.",
    clinic: "JIVAN JYOT HEALTH CLINIC",
    address: `Ground floor, Shop no.6, Shree Raj Estate,<br/>
              Rajkot - Gondal Highway, Pipaliya.<br/>
              Dist. Rajkot, PIN-360311`,
  },
  "Dr. Himanshu": {
    name: "Dr. Himanshu D. Parmar",
    regd: "Regd. No. G -3817",
    degree: "D.H.M.S.",
    clinic: '"JIVAN-JYOT HEALTH CLINIC"',
    address: `Nr. Navdeep mall, Veraval main road,<br/> Veraval (Shapar). Pin-360024`,
  },
};

// ── Build the header HTML block based on selected doctor ────────────────────
const buildHeader = (drFilter) => {
  const doc = DOCTORS[drFilter];
  if (!doc) return "";

  return `
    <div class="clinic-header">
      <!-- Logo on the left -->
      <div class="clinic-logo-wrap">
        <img src="${jivanJyot}" alt="Clinic Logo" class="clinic-logo" />
      </div>

      <!-- Centered text content -->
      <div class="clinic-header-content">
        <div class="doctor-name">${doc.name}</div>
        <div class="doctor-meta">
          <span>(${doc.regd})</span>
          <span>(${doc.degree})</span>
        </div>
        <div class="clinic-clinic">${doc.clinic}</div>
        <div class="clinic-addr">${doc.address}</div>
      </div>

      <!-- Empty spacer to keep content truly centered -->
      <div class="clinic-logo-wrap"></div>
    </div>
  `;
};

// ── Main builder ─────────────────────────────────────────────────────────────
export const buildPrintHTML = (patients, filters, companiesData) => {
  const companyName = filters.companyId
    ? companiesData.find((c) => String(c.id) === String(filters.companyId))
        ?.companyName || "All Companies"
    : "All Companies";

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

  const totalAmount = patients.reduce(
    (sum, p) => sum + (Number(p.totalAmount) || 0),
    0,
  );

  const rows = patients
    .map((p, idx) => {
      const isF = (p.sex || "").toLowerCase().startsWith("f");
      const badgeStyle = isF
        ? "background:#fce7f3;color:#be185d;"
        : "background:#dbeafe;color:#1d4ed8;";

      // ✅ Build Rx string from billingItems
      const items =
        typeof p.billingItems === "string"
          ? JSON.parse(p.billingItems)
          : p.billingItems || [];

      const rx = items.map((item) => `${item.name} x${item.qty}`).join(", ");

      return `
      <tr>
        <td>${idx + 1}</td>
        <td>${formatDate(p.date)}</td>
        <td><b>${p.patientName || "—"}</b></td>
        <td style="font-size:11px;color:#374151;">${rx || "—"}</td>
        <td style="text-align:right;font-weight:700;color:#065f46;">
          &#8377;${Number(p.totalAmount || 0).toLocaleString("en-IN")}
        </td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Patient Report — Jivan Jyot Health Clinic</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 12px;
      color: #111;
      background: #fff;
      padding: 24px 32px;
      height: 100vh;        /* ← change min-height to height */
      display: flex;
      flex-direction: column;
    }

    /* ── MAIN CONTENT — grows to fill available space ── */
    .main-content {
      flex: 1;
      display: flex;          
      flex-direction: column; 
    }
.table-wrapper {
  flex: 1;                 
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
  .table-wrapper table {
  flex-shrink: 0;
}
    /* ── CLINIC HEADER — logo left, text centered ── */
    .clinic-header {
      display: flex;
      align-items: center;
      background: #f0f4ff;
      border-bottom: 2.5px solid #111;
      padding-bottom: 14px;
      margin-bottom: 14px;
    }
    .clinic-logo-wrap {
      width: 90px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-left: 14px;
    }
    .clinic-logo {
      width: 85px;
      height: 90px;
      object-fit: contain;
      border-radius: 8px;
      margin-left:50px
    }
    .clinic-header-content {
      flex: 1;
      text-align: center;
    }
    .doctor-name {
      font-size: 30px;
      font-weight: 800;
      font-family: 'Copperplate Gothic Bold', 'Copperplate', 'Copperplate Gothic Light', serif;
      letter-spacing: 1.5px;
      color: #111;
      font-variant: small-caps;
      line-height: 1.2;
    }
    .doctor-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 6px;
      font-size: 12px;
      color: #333;
      padding: 0 4px;
    }
    .clinic-clinic {
      margin-top: 14px;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #111;
      text-transform: uppercase;
    }
    .clinic-addr {
      margin-top: 4px;
      font-size: 12px;
      font-weight: 600;
      color: #222;
      line-height: 1.7;
    }

    /* ── REPORT TITLE BAR ── */
    .report-title-bar {
      background: #1d4ed8;
      color: #fff;
      text-align: center;
      padding: 7px 0;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      border-radius: 4px;
      margin-bottom: 12px;
    }

    /* ── PRINT META ── */
    .print-meta {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #6b7280;
      margin-bottom: 10px;
    }

    /* ── FILTER BAR ── */
    .filter-bar {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 5px;
      padding: 7px 14px;
      margin-bottom: 14px;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      font-size: 11px;
      color: #1e40af;
    }
    .filter-bar b { color: #1d4ed8; }

    /* ── TABLE ── */
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    thead tr { background: #1d4ed8; color: #fff; }
    thead th {
      padding: 8px 10px;
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    tbody tr:nth-child(even) { background: #f0f7ff; }
    tbody tr:nth-child(odd)  { background: #fff; }
    tbody tr:last-child td   { border-bottom: 2px solid #1d4ed8; }
    tbody td {
      padding: 7px 10px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 11.5px;
      color: #1f2937;
    }

    /* ── TOTALS ── */
    .totals-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
      margin-top: 10px;
    }
    .totals-box {
      background: #1d4ed8;
      color: #fff;
      padding: 9px 22px;
      border-radius: 6px;
      font-size: 12px;
    }
    .totals-box span { font-size: 16px; font-weight: 800; margin-left: 8px; }

    /* ── FOOTER — always at bottom ── */
    .footer {
      border-top: 1px solid #d1d5db;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 10px;
      color: #9ca3af;
      margin-top: auto;
      padding-top: 20px;
    }
    .sig-line {
      margin-top: 36px;
      border-top: 1px solid #374151;
      width: 160px;
      font-size: 10px;
      padding-top: 3px;
      color: #374151;
      text-align: center;
    }

    /* ── TOOLBAR (hidden on print) ── */
    .toolbar {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-bottom: 16px;
    }
    .btn {
      padding: 7px 20px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-print { background: #2563eb; color: #fff; border: none; }
    .btn-close  { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
tfoot tr {
      background: #1d4ed8;
      color: #fff;
    }
    tfoot td {
      padding: 8px 10px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border: none;
    }
      table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }

    @media print {
    .main-content {
    min-height: calc(100vh - 80px);
  }
      body {
        padding: 14px 18px;
        height: 100vh;
      }
      @page { margin: 0.4cm; size: A4; }
      .toolbar { display: none !important; }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>

  <!-- TOOLBAR — hidden when printing -->
  <div class="toolbar">
    <button class="btn btn-close" onclick="window.close()">✕ Close</button>
    <button class="btn btn-print" onclick="window.print()">🖨️ Print</button>
  </div>

  <!-- MAIN CONTENT — flex:1 so it fills available space -->
  <div class="main-content">

    <!-- DOCTOR HEADER -->
    ${buildHeader(filters.dr)}

    <!-- REPORT TITLE -->
    <div class="report-title-bar">${companyName}</div>

    <!-- PRINT META -->
    <div class="print-meta">
      <span></span>
      <span>Total Records: <b>${patients.length}</b></span>
    </div>

    ${
      filters.startDate || filters.endDate
        ? `
    <div class="filter-bar">
      ${filters.startDate ? `<span><b>From:</b> ${formatDate(filters.startDate)}</span>` : ""}
      ${filters.endDate ? `<span><b>To:</b> ${formatDate(filters.endDate)}</span>` : ""}
    </div>`
        : ""
    }

    <!-- TABLE -->
    <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Patient Name</th>
          <th>RX</th>
          <th style="text-align:right;">Amount (&#8377;)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      
    </table>
    <table>
    <tfoot>
        <tr>
          <td></td>
          <td></td>
          <td style="font-size:11px;font-weight:800;color:#fff;">Total Patients: ${patients.length}</td>
          <td></td>
          <td style="text-align:right;font-size:11px;font-weight:800;color:#fff;">&#8377;${totalAmount.toLocaleString("en-IN")}</td>
        </tr>
      </tfoot>
    </table>
    </div>

  </div>
  <!-- end .main-content -->

  <!-- TOTALS — outside main-content, sits above footer -->
  

  <!-- FOOTER — always at bottom of page -->
  <div class="footer">
    <div>
    </div>
    <div style="text-align:right;">
      This is a computer-generated report.<br/>
      Jivan Jyot Health Clinic
    </div>
  </div>

</body>
</html>`;
};
