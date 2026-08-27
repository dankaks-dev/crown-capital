type DossierEntry = {
  date: string;
  title: string;
  description: string;
  category: string;
  cost: number | null;
  receipt: boolean;
};

type DossierDocument = {
  title: string;
  docType: string | null;
  issueDate: string | null;
  expiryDate: string | null;
};

export function buildDossier(opts: {
  propertyName: string;
  baseline: number | null;
  estimatedValue: number | null;
  entries: DossierEntry[];
  documents: DossierDocument[];
}) {
  const { propertyName, baseline, estimatedValue, entries, documents } = opts;

  const verified = entries.filter((e) => e.receipt);
  const reported = entries.filter((e) => !e.receipt);

  const byDate = (a: DossierEntry, b: DossierEntry) => b.date.localeCompare(a.date);

  const capex = entries.filter((e) => e.category === 'Improvement').reduce((sum, e) => sum + (e.cost || 0), 0);
  const opex = entries.filter((e) => e.category !== 'Improvement').reduce((sum, e) => sum + (e.cost || 0), 0);

  const entryBlock = (list: DossierEntry[]) => list.sort(byDate).map((e) => `
    <article class="entry">
      <div class="entry-head">
        <div><h3>${escapeHtml(e.title)}</h3><p>${e.date} · ${e.category}</p></div>
        ${e.receipt ? '<span class="tag verified">Verified</span>' : '<span class="tag reported">Self-reported</span>'}
      </div>
      <p>${escapeHtml(e.description)}</p>
      ${e.cost ? `<p class="cost">Cost: £${e.cost.toFixed(2)}</p>` : ''}
    </article>`).join('') || '<p class="none">None recorded.</p>';

  const docBlock = documents.length ? documents.map((d) => `
    <div class="doc">
      <strong>${escapeHtml(d.title)}</strong>
      <span>${escapeHtml(d.docType || 'Document')}${d.issueDate ? ` · Issued ${d.issueDate}` : ''}${d.expiryDate ? ` · Expires ${d.expiryDate}` : ''}</span>
    </div>`).join('') : '<p class="none">No documents stored.</p>';

  return `<!doctype html><html><head><meta charset="utf-8">
<title>${escapeHtml(propertyName)} · Property Dossier</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;margin:40px;color:#243735;line-height:1.5}
h1{margin:0 0 4px;font-size:30px}
.sub{color:#74827c;font-size:13px;margin:0 0 24px;padding-bottom:20px;border-bottom:2px solid #e1e8e3}
h2{margin:34px 0 12px;font-size:19px;border-bottom:1px solid #e1e8e3;padding-bottom:7px}
.summary{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:8px}
.summary div{flex:1;min-width:140px;border:1px solid #e1e8e3;border-radius:5px;padding:14px}
.summary span{display:block;color:#82918b;font-size:11px}
.summary strong{display:block;margin-top:6px;font-size:20px}
.entry{page-break-inside:avoid;border:1px solid #e1e8e3;border-radius:6px;padding:16px;margin:11px 0}
.entry-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
.entry h3{margin:0 0 4px;font-size:15px}
.entry-head p{margin:0;color:#82918b;font-size:12px}
.entry p{margin:8px 0 0;font-size:13px}
.cost{font-weight:bold}
.tag{padding:5px 8px;border-radius:3px;font-size:11px;white-space:nowrap}
.verified{background:#e0f1e7;color:#35745c}
.reported{background:#f0ece4;color:#8a7a5c}
.doc{border:1px solid #e1e8e3;border-radius:5px;padding:12px;margin:8px 0}
.doc span{display:block;margin-top:4px;color:#82918b;font-size:12px}
.none{color:#9baaa3;font-size:13px}
.foot{margin-top:36px;padding-top:16px;border-top:1px solid #e1e8e3;color:#9baaa3;font-size:11px}
</style></head><body>
<h1>${escapeHtml(propertyName)}</h1>
<p class="sub">Property Maintenance &amp; Compliance Record · Generated ${new Date().toLocaleDateString('en-GB')} · HomeVault</p>

<h2>Summary of critical assets</h2>
<div class="summary">
  <div><span>Baseline value</span><strong>${baseline !== null ? `£${baseline.toLocaleString('en-GB')}` : '—'}</strong></div>
  <div><span>Estimated value</span><strong>${estimatedValue !== null ? `£${Math.round(estimatedValue).toLocaleString('en-GB')}` : '—'}</strong></div>
  <div><span>Total records</span><strong>${entries.length}</strong></div>
  <div><span>Documents held</span><strong>${documents.length}</strong></div>
</div>

<h2>Tax-relevant expenditure history</h2>
<div class="summary">
  <div><span>Capital (improvements)</span><strong>£${capex.toFixed(2)}</strong></div>
  <div><span>Revenue (repairs &amp; upkeep)</span><strong>£${opex.toFixed(2)}</strong></div>
</div>
<p class="none">Categorised for your accountant. HomeVault does not provide tax advice.</p>

<h2>Verified work (${verified.length})</h2>
${entryBlock(verified)}

<h2>Self-reported records (${reported.length})</h2>
${entryBlock(reported)}

<h2>Compliance vault (${documents.length})</h2>
${docBlock}

<p class="foot">This record is compiled from entries made by the property owner. Verified items are supported by a receipt or professional certificate. This document is not a survey and does not constitute a formal RICS valuation.</p>
</body></html>`;
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
