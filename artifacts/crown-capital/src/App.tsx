import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Printer, Upload, X, Building2, FileText } from 'lucide-react';

type Category = 'Maintenance' | 'Repair' | 'Improvement' | 'Issue';
type Entry = {
  id: number;
  date: string;
  title: string;
  description: string;
  category: Category;
  cost: number | null;
  receipt: boolean;
  photo: string | null;
};
type Property = {
  id: number;
  name: string;
  entries: Entry[];
  currentValue: number;
  createdDate: string;
};

const emptyEntry = (): Omit<Entry, 'id'> => ({
  date: new Date().toISOString().split('T')[0],
  title: '',
  description: '',
  category: 'Maintenance',
  cost: null,
  receipt: false,
  photo: null,
});

function calculateImpactScore(entry: Entry) {
  const cost = entry.cost || 0;
  const title = entry.title.toLowerCase();
  if (entry.category === 'Improvement') {
    if (title.includes('loft')) return { impact: '+15–25%', value: '£52,500–£87,500' };
    if (title.includes('extension')) return { impact: '+10–20%', value: '£35,000–£70,000' };
    if (title.includes('bathroom')) return { impact: '+5–8%', value: '£17,500–£28,000' };
    if (title.includes('solar') || title.includes('heat pump')) return { impact: '+3–5%', value: '£10,500–£17,500' };
    return { impact: '+3–8%', value: '£10,500–£28,000' };
  }
  if (entry.category === 'Repair') {
    if (entry.receipt && cost > 0) return { impact: 'Protected', value: `£${(cost * 2.5).toFixed(0)} risk mitigation` };
    return { impact: 'Pending', value: 'Awaiting receipt' };
  }
  if (entry.category === 'Maintenance') return entry.receipt
    ? { impact: 'Protected', value: '£1,500 professional log' }
    : { impact: 'Logged', value: 'Add receipt to confirm' };
  if (entry.category === 'Issue') return { impact: '−5–15%', value: '£17,500–£52,500 risk' };
  return { impact: '—', value: '—' };
}

function App() {
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('crownCapitalProperties');
      return saved ? JSON.parse(saved) as Property[] : [];
    } catch {
      return [];
    }
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [entryForm, setEntryForm] = useState(emptyEntry);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | Category>('All');

  useEffect(() => {
    localStorage.setItem('crownCapitalProperties', JSON.stringify(properties));
  }, [properties]);

  const selectedProperty = properties.find((property) => property.id === selectedId) || null;
  const filteredEntries = useMemo(() => {
    if (!selectedProperty) return [];
    return [...selectedProperty.entries]
      .filter((entry) => categoryFilter === 'All' || entry.category === categoryFilter)
      .filter((entry) => `${entry.title} ${entry.description}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedProperty, categoryFilter, search]);

  const addProperty = () => {
    const name = propertyName.trim();
    if (!name) return;
    const property: Property = { id: Date.now(), name, entries: [], currentValue: 350000, createdDate: new Date().toISOString() };
    setProperties((current) => [...current, property]);
    setSelectedId(property.id);
    setPropertyName('');
    setShowPropertyForm(false);
  };

  const addEntry = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProperty || !entryForm.title.trim() || !entryForm.description.trim()) return;
    const entry: Entry = { id: Date.now(), ...entryForm };
    const updated = { ...selectedProperty, entries: [entry, ...selectedProperty.entries] };
    setProperties((current) => current.map((property) => property.id === updated.id ? updated : property));
    setEntryForm(emptyEntry());
    setShowEntryForm(false);
  };

  const deleteEntry = (entryId: number) => {
    if (!selectedProperty) return;
    const updated = { ...selectedProperty, entries: selectedProperty.entries.filter((entry) => entry.id !== entryId) };
    setProperties((current) => current.map((property) => property.id === updated.id ? updated : property));
  };

  const deleteProperty = (propertyId: number) => {
    setProperties((current) => current.filter((property) => property.id !== propertyId));
    if (selectedId === propertyId) setSelectedId(null);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEntryForm((current) => ({ ...current, photo: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const printJournal = () => {
    if (!selectedProperty) return;
    const entryMarkup = [...selectedProperty.entries].sort((a, b) => b.date.localeCompare(a.date)).map((entry) => {
      const impact = calculateImpactScore(entry);
      return `<article class="entry"><div class="entry-head"><div><h3>${entry.title}</h3><p>${entry.date} · ${entry.category}</p></div><strong>${impact.impact}</strong></div><p>${entry.description}</p>${entry.cost ? `<p><b>Cost:</b> £${entry.cost.toFixed(2)}</p>` : ''}${entry.receipt ? '<p class="green">✓ Receipt attached</p>' : ''}<div class="valuation"><b>Valuation impact:</b> ${impact.value}</div></article>`;
    }).join('');
    const printWindow = window.open('', '', 'height=800,width=900');
    if (!printWindow) return;
    printWindow.document.write(`<!doctype html><html><head><title>${selectedProperty.name} · Maintenance Journal</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#273b38}h1{margin:0 0 6px}.meta{color:#65746f;border-bottom:2px solid #e5ebe7;padding-bottom:20px}.entry{page-break-inside:avoid;border:1px solid #dce5df;padding:20px;margin:15px 0;border-radius:8px}.entry-head{display:flex;justify-content:space-between;gap:20px}.entry h3{margin:0 0 5px}.entry p{line-height:1.55}.entry-head p{margin:0;color:#71807a;font-size:13px}.entry-head strong{background:#e3f0e9;padding:7px 10px;border-radius:4px;color:#3d7460;white-space:nowrap}.valuation{padding:10px;background:#f2f6f3;border-radius:4px}.green{color:#258157}</style></head><body><h1>${selectedProperty.name}</h1><p class="meta">Maintenance Journal · Printed ${new Date().toLocaleDateString('en-GB')} · ${selectedProperty.entries.length} entries</p>${entryMarkup || '<p>No entries recorded.</p>'}</body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <div className="property-journal">
      <header className="pj-header"><div className="pj-brand"><span className="pj-crown">C</span><div><strong>Crown &amp; Capital</strong><small>Property maintenance &amp; valuation log</small></div></div><div className="pj-header-note">Every detail, accounted for.</div></header>
      <div className="pj-layout">
        <aside className="pj-sidebar">
          <button className="pj-primary pj-full" onClick={() => setShowPropertyForm((open) => !open)}><Plus size={17} /> New property</button>
          {showPropertyForm && <div className="pj-inline-form"><input autoFocus value={propertyName} onChange={(event) => setPropertyName(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addProperty()} placeholder="Property address or name" /><button className="pj-secondary pj-full" onClick={addProperty}>Create property</button></div>}
          <div className="pj-sidebar-label">Your properties</div>
          {!properties.length ? <div className="pj-empty-side"><Building2 size={20} /><span>No properties yet.</span><small>Create one to get started.</small></div> : properties.map((property) => <button className={`pj-property ${selectedId === property.id ? 'pj-property-active' : ''}`} key={property.id} onClick={() => setSelectedId(property.id)}><span>{property.name}</span><small>{property.entries.length} {property.entries.length === 1 ? 'entry' : 'entries'}</small></button>)}
          <div className="pj-side-footer">Local journal<br /><span>Your data stays in this browser.</span></div>
        </aside>

        <main className="pj-main">
          {!selectedProperty ? <div className="pj-welcome"><div className="pj-welcome-icon"><FileText size={27} /></div><p className="pj-kicker">Crown &amp; Capital / Field notes</p><h1>Keep a record of<br /><em>what makes a home.</em></h1><p className="pj-lead">Track the care, improvements, and decisions that protect the value of your property portfolio.</p><button className="pj-primary" onClick={() => setShowPropertyForm(true)}><Plus size={17} /> Add your first property</button></div> : <>
            <div className="pj-property-head"><div><p className="pj-kicker">Selected property</p><h1>{selectedProperty.name}</h1><p className="pj-muted">{selectedProperty.entries.length} log entries · Current value £{selectedProperty.currentValue.toLocaleString('en-GB')}</p></div><div className="pj-actions"><button className="pj-outline" onClick={printJournal}><Printer size={16} /> Print</button><button className="pj-danger" onClick={() => deleteProperty(selectedProperty.id)}><Trash2 size={16} /> Delete</button></div></div>
            <div className="pj-summary"><div><span>Total entries</span><strong>{selectedProperty.entries.length}</strong></div><div><span>Improvements</span><strong>{selectedProperty.entries.filter((entry) => entry.category === 'Improvement').length}</strong></div><div><span>Receipts attached</span><strong>{selectedProperty.entries.filter((entry) => entry.receipt).length}</strong></div><div><span>Last updated</span><strong>{selectedProperty.entries[0]?.date || '—'}</strong></div></div>
            <div className="pj-log-head"><div><p className="pj-kicker">The record</p><h2>Maintenance journal</h2></div><button className="pj-primary" onClick={() => setShowEntryForm((open) => !open)}><Plus size={17} /> Log new entry</button></div>
            {showEntryForm && <form className="pj-entry-form" onSubmit={addEntry}><div className="pj-form-grid"><label>Date<input type="date" value={entryForm.date} onChange={(event) => setEntryForm({ ...entryForm, date: event.target.value })} /></label><label>Category<select value={entryForm.category} onChange={(event) => setEntryForm({ ...entryForm, category: event.target.value as Category })}><option>Maintenance</option><option>Repair</option><option>Improvement</option><option>Issue</option></select></label></div><label>Title<input required value={entryForm.title} onChange={(event) => setEntryForm({ ...entryForm, title: event.target.value })} placeholder="e.g. Boiler service, roof repair, loft conversion" /></label><label>What happened? What was done?<textarea required rows={4} value={entryForm.description} onChange={(event) => setEntryForm({ ...entryForm, description: event.target.value })} placeholder="Add the useful detail..." /></label><div className="pj-form-grid"><label>Cost (£)<input type="number" min="0" step="0.01" value={entryForm.cost ?? ''} onChange={(event) => setEntryForm({ ...entryForm, cost: event.target.value ? Number(event.target.value) : null })} placeholder="Optional" /></label><label className="pj-check"><input type="checkbox" checked={entryForm.receipt} onChange={(event) => setEntryForm({ ...entryForm, receipt: event.target.checked })} /> Receipt or professional certificate attached</label></div><label className="pj-upload"><Upload size={15} /> Add photo (optional)<input type="file" accept="image/*" onChange={handlePhotoUpload} /></label>{entryForm.photo && <img className="pj-photo-preview" src={entryForm.photo} alt="Selected property work" />}<div className="pj-form-actions"><button type="button" className="pj-outline" onClick={() => setShowEntryForm(false)}>Cancel</button><button type="submit" className="pj-primary">Save entry</button></div></form>}
            <div className="pj-filters"><div className="pj-search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this journal..." />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}</div><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as 'All' | Category)}><option>All</option><option>Maintenance</option><option>Repair</option><option>Improvement</option><option>Issue</option></select></div>
            {!filteredEntries.length ? <div className="pj-empty-main"><FileText size={25} /><strong>No entries match your filters.</strong><span>Log the first detail worth keeping.</span></div> : <div className="pj-entries">{filteredEntries.map((entry) => { const impact = calculateImpactScore(entry); return <article className="pj-entry" key={entry.id}><div className="pj-entry-top"><div><p className="pj-kicker">{entry.date} · {entry.category}</p><h3>{entry.title}</h3></div><div className="pj-entry-controls"><span className={`pj-impact pj-impact-${entry.category.toLowerCase()}`}>{impact.impact}</span><button onClick={() => deleteEntry(entry.id)} aria-label={`Delete ${entry.title}`}><Trash2 size={15} /></button></div></div><p className="pj-description">{entry.description}</p>{entry.cost !== null && <p className="pj-cost">Cost: £{entry.cost.toFixed(2)}</p>}{entry.receipt && <p className="pj-receipt">✓ Receipt attached</p>}{entry.photo && <img className="pj-entry-photo" src={entry.photo} alt={`${entry.title} record`} />}<div className="pj-valuation"><span>Valuation impact</span><strong>{impact.value}</strong></div></article>; })}</div>}
          </>}
        </main>
      </div>
    </div>
  );
}

export default App;