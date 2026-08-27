import { useEffect, useState } from 'react';
import { FileCheck2, Plus, Upload, Trash2, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export type VaultDocument = {
  id: string;
  title: string;
  docType: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  storagePath: string;
};

const DOC_TYPES = [
  'Gas Safe certificate',
  'EICR (electrical)',
  'FENSA certificate',
  'Boiler warranty',
  'Building control completion',
  'Architect drawings',
  'Insurance policy',
  'Other',
];

export function expiryStatus(expiry: string | null) {
  if (!expiry) return { label: 'No expiry', className: 'hv-doc-none', days: null as number | null };
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: 'Expired', className: 'hv-doc-expired', days };
  if (days <= 60) return { label: `${days} days left`, className: 'hv-doc-soon', days };
  return { label: 'Valid', className: 'hv-doc-valid', days };
}

const emptyForm = () => ({ title: '', docType: DOC_TYPES[0], issueDate: '', expiryDate: '' });

export default function ComplianceVault({
  propertyId,
  userId,
  documents,
  onAdded,
  onDeleted,
  readOnly,
}: {
  propertyId: string;
  userId: string;
  documents: VaultDocument[];
  onAdded: (doc: VaultDocument) => void;
  onDeleted: (id: string) => void;
  readOnly: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) { setError('Choose a file to upload.'); return; }
    if (!form.title.trim()) { setError('Give the document a title.'); return; }
    setBusy(true);
    setError(null);

    const extension = file.name.split('.').pop() || 'pdf';
    const path = `${userId}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file);
    if (uploadError) { setError(uploadError.message); setBusy(false); return; }

    const { data, error: insertError } = await supabase.from('documents').insert({
      property_id: propertyId,
      user_id: userId,
      title: form.title.trim(),
      doc_type: form.docType,
      issue_date: form.issueDate || null,
      expiry_date: form.expiryDate || null,
      storage_path: path,
    }).select('id, title, doc_type, issue_date, expiry_date, storage_path').single();

    setBusy(false);
    if (insertError || !data) {
      await supabase.storage.from('documents').remove([path]);
      setError(insertError?.message ?? 'Could not save document.');
      return;
    }

    onAdded({
      id: data.id,
      title: data.title,
      docType: data.doc_type,
      issueDate: data.issue_date,
      expiryDate: data.expiry_date,
      storagePath: data.storage_path,
    });
    setForm(emptyForm());
    setFile(null);
    setShowForm(false);
  };

  const remove = async (doc: VaultDocument) => {
    if (!window.confirm(`Delete "${doc.title}"?`)) return;
    const { error: deleteError } = await supabase.from('documents').delete().eq('id', doc.id);
    if (deleteError) { setError(deleteError.message); return; }
    await supabase.storage.from('documents').remove([doc.storagePath]);
    onDeleted(doc.id);
  };

  const open = async (doc: VaultDocument) => {
    const { data, error: urlError } = await supabase.storage.from('documents').createSignedUrl(doc.storagePath, 300);
    if (urlError || !data) { setError('Could not open document.'); return; }
    window.open(data.signedUrl, '_blank');
  };

  return (
    <div className="hv-vault">
      <div className="hv-vault-head">
        <div>
          <p className="pj-kicker">The evidence</p>
          <h2>Compliance vault</h2>
        </div>
        {!readOnly && (
          <button className="pj-primary" onClick={() => setShowForm((o) => !o)}>
            <Plus size={17} /> Add document
          </button>
        )}
      </div>

      {error && <p className="hv-limit-note">{error}</p>}

      {showForm && !readOnly && (
        <form className="hv-doc-form" onSubmit={save}>
          <label>Title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Gas Safe certificate 2026" />
          </label>
          <div className="hv-doc-grid">
            <label>Document type
              <select value={form.docType} onChange={(e) => setForm({ ...form, docType: e.target.value })}>
                {DOC_TYPES.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label>Issue date
              <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
            </label>
          </div>
          <label>Expiry date (optional)
            <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          </label>
          <label className="hv-doc-upload">
            <Upload size={15} /> Choose file (PDF or image)
            <input type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          {file && <p className="hv-doc-filename">{file.name}</p>}
          <div className="pj-form-actions">
            <button type="button" className="pj-outline" onClick={() => { setShowForm(false); setFile(null); setError(null); }}>Cancel</button>
            <button type="submit" className="pj-primary" disabled={busy}>{busy ? 'Uploading…' : 'Save document'}</button>
          </div>
        </form>
      )}

      {!documents.length ? (
        <div className="hv-doc-empty">
          <FileCheck2 size={25} />
          <strong>No documents stored yet.</strong>
          <span>Certificates and warranties are what turn a diary into proof.</span>
        </div>
      ) : (
        <div className="hv-docs">
          {documents.map((doc) => {
            const status = expiryStatus(doc.expiryDate);
            return (
              <div className="hv-doc" key={doc.id}>
                <div className="hv-doc-icon"><FileCheck2 size={16} /></div>
                <div className="hv-doc-main">
                  <strong>{doc.title}</strong>
                  <span>{doc.docType || 'Document'}{doc.issueDate ? ` · Issued ${doc.issueDate}` : ''}{doc.expiryDate ? ` · Expires ${doc.expiryDate}` : ''}</span>
                </div>
                <span className={`hv-doc-status ${status.className}`}>{status.label}</span>
                <div className="hv-doc-actions">
                  <button onClick={() => open(doc)}><Download size={14} /> Open</button>
                  {!readOnly && <button onClick={() => remove(doc)}><Trash2 size={14} /></button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
