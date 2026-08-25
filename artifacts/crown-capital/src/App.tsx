import { useMemo, useState } from 'react';
import { BarChart3, Building2, Check, ChevronDown, CircleAlert, Clock3, Filter, Home, Menu, Plus, Search, ShieldCheck, Sparkles, X } from 'lucide-react';

type Incident = {
  id: number;
  title: string;
  property: string;
  category: 'Plumbing' | 'Electrical' | 'HVAC' | 'Security';
  impact: number;
  status: 'Open' | 'In progress' | 'Resolved';
  date: string;
  description: string;
};

const initialIncidents: Incident[] = [
  { id: 1, title: 'Boiler pressure dropping', property: '18 Pemberton Road', category: 'HVAC', impact: 4, status: 'In progress', date: 'Today, 09:42', description: 'Pressure drops overnight and the heating loop needs topping up each morning.' },
  { id: 2, title: 'Water staining in stairwell', property: '4B Larkspur Court', category: 'Plumbing', impact: 3, status: 'Open', date: 'Yesterday, 16:18', description: 'Light staining has appeared below the second-floor bathroom window.' },
  { id: 3, title: 'Rear entrance light failed', property: '72 Willow Lane', category: 'Electrical', impact: 2, status: 'Resolved', date: 'Aug 22, 11:05', description: 'The dusk-to-dawn light was not activating after the bulb was replaced.' },
  { id: 4, title: 'Intercom not connecting', property: '18 Pemberton Road', category: 'Security', impact: 3, status: 'Open', date: 'Aug 21, 14:32', description: 'Residents cannot release the front door from two of the internal handsets.' },
  { id: 5, title: 'Extractor fan noise', property: '4B Larkspur Court', category: 'HVAC', impact: 1, status: 'Resolved', date: 'Aug 18, 10:11', description: 'Fan bearing was replaced and the vibration is no longer present.' },
];

const impactLabels = ['Low', 'Moderate', 'Notable', 'High', 'Critical'];
const categories: Incident['category'][] = ['Plumbing', 'Electrical', 'HVAC', 'Security'];

function ImpactScore({ value, large = false }: { value: number; large?: boolean }) {
  return (
    <div className={`impact-score impact-${value} ${large ? 'impact-large' : ''}`} title={`${impactLabels[value - 1]} impact`}>
      <span>{value}</span>
      {large && <small>{impactLabels[value - 1]} impact</small>}
    </div>
  );
}

function App() {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [filter, setFilter] = useState<'All' | Incident['status']>('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [newIncident, setNewIncident] = useState({ title: '', property: '', category: 'Plumbing' as Incident['category'], impact: 3, description: '' });

  const visibleIncidents = useMemo(() => incidents.filter((incident) => {
    const matchesStatus = filter === 'All' || incident.status === filter;
    const term = search.toLowerCase();
    return matchesStatus && (!term || `${incident.title} ${incident.property} ${incident.category}`.toLowerCase().includes(term));
  }), [incidents, filter, search]);

  const openCount = incidents.filter((item) => item.status === 'Open').length;
  const averageImpact = (incidents.reduce((sum, item) => sum + item.impact, 0) / incidents.length).toFixed(1);
  const criticalCount = incidents.filter((item) => item.impact >= 4 && item.status !== 'Resolved').length;

  const addIncident = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newIncident.title.trim() || !newIncident.property.trim()) return;
    const incident: Incident = {
      id: Date.now(),
      title: newIncident.title,
      property: newIncident.property,
      category: newIncident.category,
      impact: newIncident.impact,
      status: 'Open',
      date: 'Just now',
      description: newIncident.description || 'No additional description recorded.',
    };
    setIncidents((current) => [incident, ...current]);
    setNewIncident({ title: '', property: '', category: 'Plumbing', impact: 3, description: '' });
    setShowForm(false);
  };

  return (
    <div className="maintenance-app">
      <aside className={`maintenance-sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand"><div className="brand-symbol">C</div><span>FIELDNOTE</span></div>
        <div className="sidebar-section-label">Workspace</div>
        <nav>
          <button className="nav-item nav-active"><BarChart3 size={17} /> Overview</button>
          <button className="nav-item"><CircleAlert size={17} /> Incidents <span className="nav-count">{openCount}</span></button>
          <button className="nav-item"><Building2 size={17} /> Properties</button>
          <button className="nav-item"><ShieldCheck size={17} /> Contractors</button>
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-health"><span className="health-dot" /><div><strong>Portfolio health</strong><small>All systems operational</small></div></div>
        <div className="sidebar-profile"><div className="profile-avatar">AM</div><div><strong>Alex Morgan</strong><small>Portfolio manager</small></div><ChevronDown size={15} /></div>
      </aside>

      <main className="maintenance-main">
        <header className="maintenance-header">
          <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu"><Menu size={20} /></button>
          <div><p className="eyebrow">Tuesday, 25 August 2026</p><h1>Maintenance journal</h1></div>
          <button className="primary-button" onClick={() => setShowForm(true)}><Plus size={17} /> Log incident</button>
        </header>

        <section className="welcome-panel">
          <div><span className="welcome-icon"><Sparkles size={17} /></span><div><p className="eyebrow">Good morning, Alex</p><h2>Keep the details close.<br /><em>Keep the impact visible.</em></h2></div></div>
          <p className="welcome-copy">A clear view of the small things that protect the bigger picture across your property portfolio.</p>
        </section>

        <section className="metric-grid">
          <div className="metric-card"><div className="metric-icon metric-amber"><CircleAlert size={18} /></div><div><span>Open incidents</span><strong>{openCount}</strong><small><b>2 new</b> in the last 7 days</small></div></div>
          <div className="metric-card"><div className="metric-icon metric-blue"><Clock3 size={18} /></div><div><span>Avg. resolution time</span><strong>2.4 <i>days</i></strong><small><b className="positive">↓ 18%</b> vs last month</small></div></div>
          <div className="metric-card"><div className="metric-icon metric-green"><ShieldCheck size={18} /></div><div><span>Portfolio health</span><strong>94 <i>/ 100</i></strong><small><b className="positive">↑ 4 pts</b> this quarter</small></div></div>
          <div className="metric-card"><div className="metric-icon metric-red"><CircleAlert size={18} /></div><div><span>High impact</span><strong>{criticalCount}</strong><small>{criticalCount ? 'Needs attention today' : 'Nothing urgent'}</small></div></div>
        </section>

        <section className="journal-section">
          <div className="section-heading"><div><p className="eyebrow">The record</p><h2>Recent incidents</h2></div><button className="text-button">View all <span>→</span></button></div>
          <div className="toolbar"><div className="search-wrap"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search incidents, properties..." /></div><div className="filter-group"><Filter size={15} />{(['All', 'Open', 'In progress', 'Resolved'] as const).map((item) => <button key={item} className={filter === item ? 'filter-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
          <div className="incident-list">
            {visibleIncidents.map((incident) => <button className="incident-row" key={incident.id} onClick={() => setSelected(incident)}>
              <ImpactScore value={incident.impact} /><div className="incident-content"><div className="incident-title-line"><strong>{incident.title}</strong><span className={`status status-${incident.status.toLowerCase().replace(' ', '-')}`}>{incident.status}</span></div><p>{incident.property} <span>·</span> {incident.category}</p></div><time>{incident.date}</time><ChevronDown className="row-chevron" size={17} />
            </button>)}
            {!visibleIncidents.length && <div className="empty-state"><CircleAlert size={20} /><strong>No incidents found</strong><span>Try another search or filter.</span></div>}
          </div>
        </section>

        <section className="bottom-grid">
          <div className="insight-card"><div className="insight-top"><div><p className="eyebrow">Impact overview</p><h2>Small patterns.<br /><em>Useful signals.</em></h2></div><BarChart3 size={21} /></div><div className="bar-chart">{categories.map((category) => { const count = incidents.filter((item) => item.category === category).length; return <div className="bar-row" key={category}><span>{category}</span><div><i style={{ width: `${Math.max(14, count / incidents.length * 100)}%` }} /></div><b>{count}</b></div>; })}</div></div>
          <div className="next-card"><p className="eyebrow">Next review</p><h2>September<br /><em>portfolio walk.</em></h2><p>Three properties are due for their quarterly maintenance review.</p><button className="outline-button"><Home size={15} /> Open schedule</button></div>
        </section>
        <footer><span>FIELDNOTE / MAINTENANCE OS</span><span>Every detail, accounted for.</span></footer>
      </main>

      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="incident-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)} aria-label="Close"><X size={18} /></button><ImpactScore value={selected.impact} large /><p className="eyebrow">{selected.category} · {selected.date}</p><h2>{selected.title}</h2><div className="modal-property"><Home size={16} /> {selected.property}</div><p className="modal-description">{selected.description}</p><div className="modal-actions"><span className={`status status-${selected.status.toLowerCase().replace(' ', '-')}`}>{selected.status}</span><button className="outline-button" onClick={() => { setIncidents((items) => items.map((item) => item.id === selected.id ? { ...item, status: item.status === 'Resolved' ? 'Open' : 'Resolved' } : item)); setSelected(null); }}><Check size={15} /> {selected.status === 'Resolved' ? 'Reopen incident' : 'Mark resolved'}</button></div></div></div>}
      {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><form className="incident-modal form-modal" onSubmit={addIncident} onClick={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowForm(false)} aria-label="Close"><X size={18} /></button><p className="eyebrow">New entry</p><h2>Log an incident.</h2><label>Incident title<input required value={newIncident.title} onChange={(event) => setNewIncident({ ...newIncident, title: event.target.value })} placeholder="e.g. Leaking tap in kitchen" /></label><label>Property<input required value={newIncident.property} onChange={(event) => setNewIncident({ ...newIncident, property: event.target.value })} placeholder="e.g. 18 Pemberton Road" /></label><div className="form-two"><label>Category<select value={newIncident.category} onChange={(event) => setNewIncident({ ...newIncident, category: event.target.value as Incident['category'] })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Impact score<select value={newIncident.impact} onChange={(event) => setNewIncident({ ...newIncident, impact: Number(event.target.value) })}>{impactLabels.map((label, index) => <option value={index + 1} key={label}>{index + 1} — {label}</option>)}</select></label></div><label>Notes <span className="optional">(optional)</span><textarea value={newIncident.description} onChange={(event) => setNewIncident({ ...newIncident, description: event.target.value })} placeholder="What happened?" rows={3} /></label><button className="primary-button form-submit" type="submit"><Plus size={17} /> Add to journal</button></form></div>}
    </div>
  );
}

export default App;