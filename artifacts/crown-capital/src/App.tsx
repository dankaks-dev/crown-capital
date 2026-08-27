import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Printer, Upload, X, Building2, FileText, LogOut, Lock, Home, Download } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import Landing from '@/components/Landing';
import ComplianceVault, { expiryStatus } from '@/components/ComplianceVault';
import type { VaultDocument } from '@/components/ComplianceVault';
import ValueProjector from '@/components/ValueProjector';
import { computeValuation } from '@/lib/valuation';
import type { Rule, ValuationItem } from '@/lib/valuation';
import { buildDossier } from '@/lib/dossier';

type Category = 'Maintenance' | 'Repair' | 'Improvement' | 'Issue';
type Tier = 'free' | 'pro' | 'portfolio';
type Entry = {
  id: string;
  date: string;
  title: string;
  description: string;
  category: Category;
  cost: number | null;
  receipt: boolean;
  photoPath: string | null;
  improvementType: string | null;
  isCapex: boolean;
  status: string;
};
type Property = {
  id: string;
  name: string;
  entries: Entry[];
  currentValue: number | null;
  createdDate: string;
  epcRating: string | null;
  boilerYear: number | null;
  roofNote: string | null;
};

const LIMITS: Record<Tier, number> = { free: 1, pro: 3, portfolio: Infinity };
const TIER_LABEL: Record<Tier, string> = { free: 'Free', pro: 'Pro', portfolio: 'Portfolio' };

const emptyEntry = () => ({
  date: new Date().toISOString().split('T')[0],
  title: '',
  description: '',
  category: 'Maintenance' as Category,
  cost: null as number | null,
  receipt: false,
  improvementType: '',
  isCapex: false,
});

function calculateImpactScore(entry: Entry) {
  const cost = entry.cost || 0;
  if (entry.category === 'Repair') {
    if (entry.receipt && cost > 0) return { impact: 'Protected', value: `£${(cost * 2.5).toFixed(0)} risk mitigation` };
    return { impact: 'Pending', value: 'Awaiting receipt' };
  }
  if (entry.category === 'Maintenance') return entry.receipt
    ? { impact: 'Protected', value: '£1,500 professional log' }
    : { impact: 'Logged', value: 'Add receipt to confirm' };
  if (entry.category === 'Issue') return { impact: 'Risk', value: 'See value projector' };
  return { impact: entry.improvementType ? 'Counted' : 'Uncategorised', value: entry.improvementType ? 'In value projector' : 'Pick an improvement type' };
}

function EntryPhoto({ path, alt, className }: { path: string; alt: string; className: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    supabase.storage.from('photos').createSignedUrl(path, 3600).then(({ data }) => {
      if (active && data) setUrl(data.signedUrl);
    });
    return () => { active = false; };
  }, [path]);
  if (!url) return null;
  return <img className={className} src={url} alt={alt} />;
}

function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const action = mode === 'signin'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });
    const { error } = await action;
    if (error) setMessage(error.message);
    else if (mode === 'signup') setMessage('Account created. Check your email to confirm, then sign in.');
    setBusy(false);
  };

  return (
    <div className="hv-auth">
      <div className="hv-auth-card">
        <div className="hv-auth-brand">
          <span className="hv-auth-mark">H</span>
          <div><strong>HomeVault</strong><small>Property maintenance &amp; valuation log</small></div>
        </div>
        <h1>{mode === 'signin' ? <>Welcome <em>back.</em></> : <>Start your <em>record.</em></>}</h1>
        <p className="hv-auth-sub">
          {mode === 'signin'
            ? 'Sign in to your property records.'
            : 'Track the care, improvements, and decisions that protect the value of your property.'}
        </p>
        <form onSubmit={submit}>
          <label>Email
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </label>
          <label>Password
            <input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
          </label>
          {message && <p className="hv-auth-message">{message}</p>}
          <button type="submit" className="hv-auth-submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button type="button" className="hv-auth-switch" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(null); }}>
          {mode === 'signin' ? 'No account? Create one' : 'Already have an account? Sign in'}
        </button>
        <p className="hv-auth-foot">Your property. Your records. Your proof.</p>
      </div>
    </div>
  );
}

function UpgradePanel({ tier, onCheckout, busyPlan }: { tier: Tier; onCheckout: (plan: 'pro' | 'portfolio') => void; busyPlan: string | null }) {
  return (
    <div className="hv-upgrade">
      <div className="hv-upgrade-head">
        <p className="pj-kicker">Your plan</p>
        <h2>Room for more properties</h2>
        <p>You're on {TIER_LABEL[tier]}. Upgrade to keep records for more of your portfolio.</p>
      </div>
      <div className="hv-plans">
        <div className={`hv-plan ${tier === 'pro' ? 'hv-plan-featured' : ''}`}>
          <span className="hv-plan-name">HomeVault Pro</span>
          <div className="hv-plan-price"><strong>£5.99</strong><span>per month</span></div>
          <p>Up to 3 properties, full maintenance record.</p>
          <button onClick={() => onCheckout('pro')} disabled={busyPlan !== null || tier === 'pro' || tier === 'portfolio'}>
            {tier === 'pro' ? 'Current plan' : busyPlan === 'pro' ? 'Please wait…' : 'Choose Pro'}
          </button>
        </div>
        <div className={`hv-plan ${tier === 'portfolio' ? 'hv-plan-featured' : ''}`}>
          <span className="hv-plan-name">HomeVault Portfolio</span>
          <div className="hv-plan-price"><strong>£9.99</strong><span>per month</span></div>
          <p>Unlimited properties for landlords and larger portfolios.</p>
          <button onClick={() => onCheckout('portfolio')} disabled={busyPlan !== null || tier === 'portfolio'}>
            {tier === 'portfolio' ? 'Current plan' : busyPlan === 'portfolio' ? 'Please wait…' : 'Choose Portfolio'}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [tier, setTier] = useState<Tier>('free');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [rules, setRules] = useState<Record<string, Rule>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showBigThree, setShowBigThree] = useState(false);
  const [bigThree, setBigThree] = useState({ epcRating: '', boilerYear: '', roofNote: '' });
  const [propertyName, setPropertyName] = useState('');
  const [entryForm, setEntryForm] = useState(emptyEntry);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | Category>('All');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadTier = async () => {
    const { data } = await supabase.from('subscriptions').select('tier, status').maybeSingle();
    if (data && data.status === 'active') setTier(data.tier as Tier);
    else setTier('free');
  };

  const loadRules = async () => {
    const { data } = await supabase.from('valuation_rules')
      .select('id, label, logic_type, behavior, low, high, active');
    const map: Record<string, Rule> = {};
    for (const row of data ?? []) {
      if (row.active === false) continue;
      map[row.id] = {
        id: row.id,
        label: row.label,
        logicType: row.logic_type,
        behavior: row.behavior,
        low: Number(row.low),
        high: Number(row.high),
      };
    }
    setRules(map);
  };

  const loadData = async () => {
    const { data: rows, error: propertyError } = await supabase
      .from('properties').select('id, address, baseline_value, created_at, epc_rating, boiler_year, roof_note').order('created_at');
    if (propertyError) { setError(propertyError.message); return; }
    const { data: entryRows, error: entryError } = await supabase
      .from('log_entries')
      .select('id, property_id, title, description, category, cost, entry_date, receipt, photo_path, improvement_type, is_capex, status')
      .order('entry_date', { ascending: false });
    if (entryError) { setError(entryError.message); return; }
    const { data: docRows } = await supabase
      .from('documents')
      .select('id, property_id, title, doc_type, issue_date, expiry_date, storage_path')
      .order('created_at', { ascending: false });
    setDocuments((docRows ?? []).map((d) => ({
      id: d.id,
      propertyId: d.property_id,
      title: d.title,
      docType: d.doc_type,
      issueDate: d.issue_date,
      expiryDate: d.expiry_date,
      storagePath: d.storage_path,
    })) as (VaultDocument & { propertyId: string })[]);
    setProperties((rows ?? []).map((row) => ({
      id: row.id,
      name: row.address,
      currentValue: row.baseline_value,
      createdDate: row.created_at,
      epcRating: row.epc_rating,
      boilerYear: row.boiler_year,
      roofNote: row.roof_note,
      entries: (entryRows ?? []).filter((entry) => entry.property_id === row.id).map((entry) => ({
        id: entry.id,
        date: entry.entry_date,
        title: entry.title,
        description: entry.description ?? '',
        category: entry.category as Category,
        cost: entry.cost,
        receipt: entry.receipt,
        photoPath: entry.photo_path,
        improvementType: entry.improvement_type,
        isCapex: entry.is_capex,
        status: entry.status,
      })),
    })));
  };

  useEffect(() => {
    if (session) { loadTier(); loadRules(); loadData(); }
    else { setProperties([]); setSelectedId(null); setTier('free'); setDocuments([]); }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') !== 'success') return;
    const sessionId = params.get('session_id');
    if (!sessionId) return;
    (async () => {
      const { data: authData } = await supabase.auth.getSession();
      const token = authData.session?.access_token;
      if (!token) return;
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId }),
      });
      const result = await response.json();
      if (result.success) { setTier(result.tier as Tier); setShowUpgrade(false); }
      else setError(result.error || 'Could not confirm payment.');
      window.history.replaceState({}, '', window.location.pathname);
    })();
  }, [session]);

  const limit = LIMITS[tier];
  const unlockedIds = useMemo(
    () => new Set(properties.slice(0, limit === Infinity ? properties.length : limit).map((p) => p.id)),
    [properties, limit],
  );
  const atLimit = properties.length >= limit;
  const selectedProperty = properties.find((property) => property.id === selectedId) || null;
  const selectedLocked = selectedProperty ? !unlockedIds.has(selectedProperty.id) : false;

  const filteredEntries = useMemo(() => {
    if (!selectedProperty) return [];
    return [...selectedProperty.entries]
      .filter((entry) => categoryFilter === 'All' || entry.category === categoryFilter)
      .filter((entry) => `${entry.title} ${entry.description}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedProperty, categoryFilter, search]);

  const valuationItems: ValuationItem[] = useMemo(() => {
    if (!selectedProperty) return [];
    return selectedProperty.entries
      .filter((e) => e.improvementType)
      .map((e) => ({
        id: e.id,
        improvementType: e.improvementType as string,
        date: e.date,
        status: e.status,
        cost: e.cost,
        title: e.title,
      }));
  }, [selectedProperty]);

  const valuation = useMemo(() => {
    if (!selectedProperty || selectedProperty.currentValue === null) return null;
    return computeValuation(selectedProperty.currentValue, valuationItems, rules);
  }, [selectedProperty, valuationItems, rules]);

  const startCheckout = async (plan: 'pro' | 'portfolio') => {
    setBusyPlan(plan);
    setError(null);
    try {
      const { data: authData } = await supabase.auth.getSession();
      const token = authData.session?.access_token;
      if (!token) { setBusyPlan(null); setError('Please sign in again.'); return; }
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tier: plan }),
      });
      const result = await response.json();
      if (result.url) { window.location.href = result.url; return; }
      setError(result.error || 'Could not start checkout.');
    } catch {
      setError('Checkout service unavailable.');
    }
    setBusyPlan(null);
  };

  const openPropertyForm = () => {
    if (atLimit) { setShowUpgrade(true); setShowPropertyForm(false); return; }
    setShowPropertyForm((open) => !open);
  };

  const addProperty = async () => {
    const name = propertyName.trim();
    if (!name || !session) return;
    if (atLimit) { setShowUpgrade(true); setShowPropertyForm(false); return; }
    setBusy(true);
    const { data, error: insertError } = await supabase.from('properties')
      .insert({ user_id: session.user.id, address: name })
      .select('id, address, baseline_value, created_at, epc_rating, boiler_year, roof_note').single();
    setBusy(false);
    if (insertError || !data) { setError(insertError?.message ?? 'Could not create property.'); return; }
    setProperties((current) => [...current, {
      id: data.id, name: data.address, entries: [], currentValue: data.baseline_value,
      createdDate: data.created_at, epcRating: data.epc_rating, boilerYear: data.boiler_year, roofNote: data.roof_note,
    }]);
    setSelectedId(data.id);
    setPropertyName('');
    setShowPropertyForm(false);
  };

  const saveBaseline = async (value: number) => {
    if (!selectedProperty) return;
    const newValue = value > 0 ? value : null;
    const { error: updateError } = await supabase.from('properties')
      .update({ baseline_value: newValue }).eq('id', selectedProperty.id);
    if (updateError) { setError(updateError.message); return; }
    setProperties((c) => c.map((p) => p.id === selectedProperty.id ? { ...p, currentValue: newValue } : p));
  };

  const saveBigThree = async () => {
    if (!selectedProperty) return;
    const payload = {
      epc_rating: bigThree.epcRating || null,
      boiler_year: bigThree.boilerYear ? Number(bigThree.boilerYear) : null,
      roof_note: bigThree.roofNote || null,
    };
    const { error: updateError } = await supabase.from('properties').update(payload).eq('id', selectedProperty.id);
    if (updateError) { setError(updateError.message); return; }
    setProperties((c) => c.map((p) => p.id === selectedProperty.id
      ? { ...p, epcRating: payload.epc_rating, boilerYear: payload.boiler_year, roofNote: payload.roof_note } : p));
    setShowBigThree(false);
  };

  const openBigThree = () => {
    if (!selectedProperty) return;
    setBigThree({
      epcRating: selectedProperty.epcRating || '',
      boilerYear: selectedProperty.boilerYear ? String(selectedProperty.boilerYear) : '',
      roofNote: selectedProperty.roofNote || '',
    });
    setShowBigThree(true);
  };

  const resolveEntry = async (entryId: string) => {
    const { error: updateError } = await supabase.from('log_entries').update({ status: 'resolved' }).eq('id', entryId);
    if (updateError) { setError(updateError.message); return; }
    setProperties((c) => c.map((p) => ({
      ...p, entries: p.entries.map((e) => e.id === entryId ? { ...e, status: 'resolved' } : e),
    })));
  };

  const addEntry = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProperty || !session || selectedLocked) return;
    if (!entryForm.title.trim() || !entryForm.description.trim()) return;

    const rule = entryForm.improvementType ? rules[entryForm.improvementType] : null;
    if (rule && (rule.logicType === 'PROPORTIONAL_DEVALUATION' || rule.logicType === 'FIXED_DEVALUATION')) {
      if (!window.confirm(`Market alert: "${rule.label}" typically reduces value. Are you sure you want to log this?`)) return;
    }

    setBusy(true);
    let photoPath: string | null = null;
    if (photoFile) {
      const extension = photoFile.name.split('.').pop() || 'jpg';
      const path = `${session.user.id}/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('photos').upload(path, photoFile);
      if (uploadError) { setError(uploadError.message); setBusy(false); return; }
      photoPath = path;
    }
    const { data, error: insertError } = await supabase.from('log_entries').insert({
      property_id: selectedProperty.id,
      user_id: session.user.id,
      title: entryForm.title.trim(),
      description: entryForm.description.trim(),
      category: entryForm.category,
      cost: entryForm.cost,
      entry_date: entryForm.date,
      receipt: entryForm.receipt,
      photo_path: photoPath,
      improvement_type: entryForm.improvementType || null,
      is_capex: entryForm.isCapex,
    }).select('id, entry_date, title, description, category, cost, receipt, photo_path, improvement_type, is_capex, status').single();
    setBusy(false);
    if (insertError || !data) { setError(insertError?.message ?? 'Could not save entry.'); return; }
    const entry: Entry = {
      id: data.id, date: data.entry_date, title: data.title, description: data.description ?? '',
      category: data.category as Category, cost: data.cost, receipt: data.receipt, photoPath: data.photo_path,
      improvementType: data.improvement_type, isCapex: data.is_capex, status: data.status,
    };
    setProperties((current) => current.map((property) => property.id === selectedProperty.id
      ? { ...property, entries: [entry, ...property.entries] } : property));
    setEntryForm(emptyEntry());
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowEntryForm(false);
  };

  const deleteEntry = async (entryId: string) => {
    if (!selectedProperty) return;
    const entry = selectedProperty.entries.find((item) => item.id === entryId);
    const { error: deleteError } = await supabase.from('log_entries').delete().eq('id', entryId);
    if (deleteError) { setError(deleteError.message); return; }
    if (entry?.photoPath) await supabase.storage.from('photos').remove([entry.photoPath]);
    setProperties((current) => current.map((property) => property.id === selectedProperty.id
      ? { ...property, entries: property.entries.filter((item) => item.id !== entryId) } : property));
  };

  const deleteProperty = async (propertyId: string) => {
    if (!window.confirm('Delete this property and all of its entries?')) return;
    const { error: deleteError } = await supabase.from('properties').delete().eq('id', propertyId);
    if (deleteError) { setError(deleteError.message); return; }
    setProperties((current) => current.filter((property) => property.id !== propertyId));
    if (selectedId === propertyId) setSelectedId(null);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const generateDossier = () => {
    if (!selectedProperty) return;
    const docsForProperty = (documents as (VaultDocument & { propertyId: string })[])
      .filter((d) => d.propertyId === selectedProperty.id);
    const html = buildDossier({
      propertyName: selectedProperty.name,
      baseline: selectedProperty.currentValue,
      estimatedValue: valuation ? valuation.mid.finalValue : null,
      epcRating: selectedProperty.epcRating,
      boilerYear: selectedProperty.boilerYear,
      roofNote: selectedProperty.roofNote,
      entries: selectedProperty.entries.map((e) => ({
        date: e.date, title: e.title, description: e.description,
        category: e.category, cost: e.cost, receipt: e.receipt, isCapex: e.isCapex,
      })),
      documents: docsForProperty.map((d) => ({
        title: d.title, docType: d.docType, issueDate: d.issueDate, expiryDate: d.expiryDate,
      })),
    });
    const win = window.open('', '', 'height=900,width=900');
    if (!win) { setError('Allow pop-ups to generate the dossier.'); return; }
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 350);
  };

  const printJournal = () => {
    if (!selectedProperty) return;
    const entryMarkup = [...selectedProperty.entries].sort((a, b) => b.date.localeCompare(a.date)).map((entry) => {
      const impact = calculateImpactScore(entry);
      return `<article class="entry"><div class="entry-head"><div><h3>${entry.title}</h3><p>${entry.date} · ${entry.category}</p></div><strong>${impact.impact}</strong></div><p>${entry.description}</p>${entry.cost ? `<p><b>Cost:</b> £${entry.cost.toFixed(2)}</p>` : ''}${entry.receipt ? '<p class="green">✓ Receipt attached</p>' : ''}</article>`;
    }).join('');
    const printWindow = window.open('', '', 'height=800,width=900');
    if (!printWindow) return;
    printWindow.document.write(`<!doctype html><html><head><title>${selectedProperty.name} · Maintenance Journal</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#273b38}h1{margin:0 0 6px}.meta{color:#65746f;border-bottom:2px solid #e5ebe7;padding-bottom:20px}.entry{page-break-inside:avoid;border:1px solid #dce5df;padding:20px;margin:15px 0;border-radius:8px}.entry-head{display:flex;justify-content:space-between;gap:20px}.entry h3{margin:0 0 5px}.entry p{line-height:1.55}.entry-head p{margin:0;color:#71807a;font-size:13px}.entry-head strong{background:#e3f0e9;padding:7px 10px;border-radius:4px;color:#3d7460;white-space:nowrap}.green{color:#258157}</style></head><body><h1>${selectedProperty.name}</h1><p class="meta">Maintenance Journal · Printed ${new Date().toLocaleDateString('en-GB')} · ${selectedProperty.entries.length} entries</p>${entryMarkup || '<p>No entries recorded.</p>'}</body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const ruleOptions = useMemo(() => Object.values(rules).sort((a, b) => a.label.localeCompare(b.label)), [rules]);

  if (!authReady) return null;
  if (!session) return showAuth
    ? <AuthScreen />
    : <Landing onSignIn={() => setShowAuth(true)} onGetStarted={() => setShowAuth(true)} />;

  return (
    <div className="property-journal">
      <header className="pj-header">
        <button className="pj-brand" style={{ border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left' }} onClick={() => { setSelectedId(null); setShowUpgrade(false); }}>
          <span className="pj-crown">H</span>
          <div><strong>HomeVault</strong><small>Property maintenance &amp; valuation log</small></div>
        </button>
        <div className="pj-header-actions">
          {selectedId && <button className="pj-outline" onClick={() => { setSelectedId(null); setShowUpgrade(false); }}><Home size={14} /> All properties</button>}
          <span className="hv-tier-badge">{TIER_LABEL[tier]}</span>
          {tier !== 'portfolio' && <button className="pj-outline" onClick={() => setShowUpgrade((open) => !open)}>Upgrade</button>}
          <button className="pj-outline" onClick={() => supabase.auth.signOut()}><LogOut size={14} /> Sign out</button>
        </div>
      </header>
      {error && <div className="pj-inline-form"><span>{error}</span><button className="pj-outline" onClick={() => setError(null)}>Dismiss</button></div>}
      <div className="pj-layout">
        <aside className="pj-sidebar">
          <button className="pj-primary pj-full" onClick={openPropertyForm}><Plus size={17} /> New property</button>
          {showPropertyForm && <div className="pj-inline-form"><input autoFocus value={propertyName} onChange={(event) => setPropertyName(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addProperty()} placeholder="Property address or name" /><button className="pj-secondary pj-full" onClick={addProperty} disabled={busy}>Create property</button></div>}
          <div className="pj-sidebar-label">Your properties</div>
          {!properties.length ? <div className="pj-empty-side"><Building2 size={20} /><span>No properties yet.</span><small>Create one to get started.</small></div> : properties.map((property) => { const locked = !unlockedIds.has(property.id); return <button className={`pj-property ${selectedId === property.id ? 'pj-property-active' : ''} ${locked ? 'hv-locked' : ''}`} key={property.id} onClick={() => setSelectedId(property.id)}><span>{property.name}{locked && <span className="hv-locked-tag">Read only</span>}</span><small>{property.entries.length} {property.entries.length === 1 ? 'entry' : 'entries'}</small></button>; })}
          <div className="pj-side-footer">Secure record<br /><span>Your data is saved to your account.</span></div>
        </aside>

        <main className="pj-main">
          {showUpgrade && <UpgradePanel tier={tier} onCheckout={startCheckout} busyPlan={busyPlan} />}
          {!selectedProperty ? <div className="pj-welcome"><div className="pj-welcome-icon"><FileText size={27} /></div><p className="pj-kicker">HomeVault / Field notes</p><h1>Keep a record of<br /><em>what makes a home.</em></h1><p className="pj-lead">Track the care, improvements, and decisions that protect the value of your property portfolio.</p><button className="pj-primary" onClick={openPropertyForm}><Plus size={17} /> Add your first property</button></div> : <>
            <div className="pj-property-head"><div><p className="pj-kicker">Selected property</p><h1>{selectedProperty.name}</h1><p className="pj-muted">{selectedProperty.entries.length} log entries · {selectedProperty.currentValue !== null ? `Baseline £${selectedProperty.currentValue.toLocaleString('en-GB')}` : 'Add your property value'}</p></div><div className="pj-actions"><button className="pj-outline" onClick={generateDossier}><Download size={16} /> Dossier</button><button className="pj-outline" onClick={printJournal}><Printer size={16} /> Print</button><button className="pj-danger" onClick={() => deleteProperty(selectedProperty.id)}><Trash2 size={16} /> Delete</button></div></div>
            {selectedLocked && <p className="hv-limit-note"><Lock size={12} /> This property is read only on your current plan. Upgrade to log new entries.</p>}
            {(() => {
              const due = (documents as (VaultDocument & { propertyId: string })[])
                .filter((d) => d.propertyId === selectedProperty.id)
                .map((d) => ({ doc: d, status: expiryStatus(d.expiryDate) }))
                .filter((x) => x.status.days !== null && x.status.days <= 60);
              if (!due.length) return null;
              return <p className="hv-expiry-banner"><strong>Documents needing attention</strong>{due.map((x) => `${x.doc.title} — ${x.status.label}`).join(' · ')}</p>;
            })()}
            <div className="pj-summary"><div><span>Total entries</span><strong>{selectedProperty.entries.length}</strong></div><div><span>Improvements</span><strong>{selectedProperty.entries.filter((entry) => entry.category === 'Improvement').length}</strong></div><div><span>Receipts attached</span><strong>{selectedProperty.entries.filter((entry) => entry.receipt).length}</strong></div><div><span>Last updated</span><strong>{selectedProperty.entries[0]?.date || '—'}</strong></div></div>

            <div className="hv-vault">
              <div className="hv-vault-head">
                <div><p className="pj-kicker">Critical assets</p><h2>The big three</h2></div>
                {!selectedLocked && <button className="pj-outline" onClick={openBigThree}>Edit</button>}
              </div>
              {showBigThree ? (
                <div className="hv-doc-form">
                  <div className="hv-doc-grid">
                    <label>EPC rating
                      <select value={bigThree.epcRating} onChange={(e) => setBigThree({ ...bigThree, epcRating: e.target.value })}>
                        <option value="">Not recorded</option>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </label>
                    <label>Boiler year installed
                      <input type="number" min="1950" max="2100" value={bigThree.boilerYear} onChange={(e) => setBigThree({ ...bigThree, boilerYear: e.target.value })} placeholder="e.g. 2018" />
                    </label>
                  </div>
                  <label>Roof age / condition
                    <input value={bigThree.roofNote} onChange={(e) => setBigThree({ ...bigThree, roofNote: e.target.value })} placeholder="e.g. Replaced 2015, good condition" />
                  </label>
                  <div className="pj-form-actions">
                    <button className="pj-outline" onClick={() => setShowBigThree(false)}>Cancel</button>
                    <button className="pj-primary" onClick={saveBigThree}>Save</button>
                  </div>
                </div>
              ) : (
                <div className="pj-summary">
                  <div><span>EPC rating</span><strong>{selectedProperty.epcRating || '—'}</strong></div>
                  <div><span>Boiler installed</span><strong>{selectedProperty.boilerYear || '—'}</strong></div>
                  <div><span>Roof</span><strong style={{ fontSize: 15 }}>{selectedProperty.roofNote || '—'}</strong></div>
                  <div><span>Capital spend</span><strong>£{selectedProperty.entries.filter((e) => e.isCapex).reduce((s, e) => s + (e.cost || 0), 0).toLocaleString('en-GB')}</strong></div>
                </div>
              )}
            </div>

            <ValueProjector
              baseline={selectedProperty.currentValue}
              items={valuationItems}
              rules={rules}
              onSaveBaseline={saveBaseline}
              onResolve={resolveEntry}
              readOnly={selectedLocked}
            />

            <div className="pj-log-head"><div><p className="pj-kicker">The record</p><h2>Maintenance journal</h2></div>{!selectedLocked && <button className="pj-primary" onClick={() => setShowEntryForm((open) => !open)}><Plus size={17} /> Log new entry</button>}</div>
            {showEntryForm && !selectedLocked && <form className="pj-entry-form" onSubmit={addEntry}>
              <div className="pj-form-grid">
                <label>Date<input type="date" value={entryForm.date} onChange={(event) => setEntryForm({ ...entryForm, date: event.target.value })} /></label>
                <label>Category<select value={entryForm.category} onChange={(event) => setEntryForm({ ...entryForm, category: event.target.value as Category })}><option>Maintenance</option><option>Repair</option><option>Improvement</option><option>Issue</option></select></label>
              </div>
              <label>Title<input required value={entryForm.title} onChange={(event) => setEntryForm({ ...entryForm, title: event.target.value })} placeholder="e.g. Boiler service, roof repair, loft conversion" /></label>
              <label>What happened? What was done?<textarea required rows={4} value={entryForm.description} onChange={(event) => setEntryForm({ ...entryForm, description: event.target.value })} placeholder="Add the useful detail..." /></label>
              <label>Improvement type (counts towards your value projection)
                <select value={entryForm.improvementType} onChange={(event) => setEntryForm({ ...entryForm, improvementType: event.target.value })}>
                  <option value="">Not applicable</option>
                  {ruleOptions.map((rule) => <option key={rule.id} value={rule.id}>{rule.label}</option>)}
                </select>
              </label>
              <div className="pj-form-grid">
                <label>Cost (£)<input type="number" min="0" step="0.01" value={entryForm.cost ?? ''} onChange={(event) => setEntryForm({ ...entryForm, cost: event.target.value ? Number(event.target.value) : null })} placeholder="Optional" /></label>
                <label className="pj-check"><input type="checkbox" checked={entryForm.receipt} onChange={(event) => setEntryForm({ ...entryForm, receipt: event.target.checked })} /> Receipt or certificate attached</label>
              </div>
              <label className="pj-check"><input type="checkbox" checked={entryForm.isCapex} onChange={(event) => setEntryForm({ ...entryForm, isCapex: event.target.checked })} /> This is an improvement (capital), not a repair</label>
              <label className="pj-upload"><Upload size={15} /> Add photo (optional)<input type="file" accept="image/*" onChange={handlePhotoUpload} /></label>
              {photoPreview && <img className="pj-photo-preview" src={photoPreview} alt="Selected property work" />}
              <div className="pj-form-actions"><button type="button" className="pj-outline" onClick={() => { setShowEntryForm(false); setPhotoFile(null); setPhotoPreview(null); }}>Cancel</button><button type="submit" className="pj-primary" disabled={busy}>{busy ? 'Saving…' : 'Save entry'}</button></div>
            </form>}
            <div className="pj-filters"><div className="pj-search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this journal..." />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}</div><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as 'All' | Category)}><option>All</option><option>Maintenance</option><option>Repair</option><option>Improvement</option><option>Issue</option></select></div>
            {!filteredEntries.length ? <div className="pj-empty-main"><FileText size={25} /><strong>No entries match your filters.</strong><span>Log the first detail worth keeping.</span></div> : <div className="pj-entries">{filteredEntries.map((entry) => { const impact = calculateImpactScore(entry); return <article className="pj-entry" key={entry.id}><div className="pj-entry-top"><div><p className="pj-kicker">{entry.date} · {entry.category}{entry.status === 'resolved' ? ' · Resolved' : ''}</p><h3>{entry.title}</h3></div><div className="pj-entry-controls"><span className={`pj-impact pj-impact-${entry.category.toLowerCase()}`}>{impact.impact}</span>{!selectedLocked && <button onClick={() => deleteEntry(entry.id)} aria-label={`Delete ${entry.title}`}><Trash2 size={15} /></button>}</div></div><p className="pj-description">{entry.description}</p>{entry.cost !== null && <p className="pj-cost">Cost: £{entry.cost.toFixed(2)}{entry.isCapex ? ' · Capital' : ''}</p>}{entry.receipt && <p className="pj-receipt">✓ Receipt attached</p>}{entry.photoPath && <EntryPhoto path={entry.photoPath} alt={`${entry.title} record`} className="pj-entry-photo" />}<div className="pj-valuation"><span>Valuation impact</span><strong>{impact.value}</strong></div></article>; })}</div>}
            <ComplianceVault
              propertyId={selectedProperty.id}
              userId={session.user.id}
              documents={(documents as (VaultDocument & { propertyId: string })[]).filter((d) => d.propertyId === selectedProperty.id)}
              onAdded={(doc) => setDocuments((c) => [{ ...doc, propertyId: selectedProperty.id } as VaultDocument, ...c])}
              onDeleted={(id) => setDocuments((c) => c.filter((d) => d.id !== id))}
              readOnly={selectedLocked}
            />
          </>}
        </main>
      </div>
    </div>
  );
}

export default App;
