import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { contactService } from '@/services/cms.service';
import { ContactLead } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';

// ── Status config ─────────────────────────────────────────────────
const STATUSES = ['new', 'contacted', 'negotiating', 'won', 'lost'] as const;
type LeadStatus = typeof STATUSES[number];

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; dot: string; bg: string }> = {
  new:         { label: 'New',         color: 'text-blue-400',   dot: 'bg-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30' },
  contacted:   { label: 'Contacted',   color: 'text-yellow-400', dot: 'bg-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  negotiating: { label: 'Negotiating', color: 'text-purple-400', dot: 'bg-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  won:         { label: 'Won',         color: 'text-green-400',  dot: 'bg-green-400',  bg: 'bg-green-500/10 border-green-500/30' },
  lost:        { label: 'Lost',        color: 'text-red-400',    dot: 'bg-red-500',    bg: 'bg-red-500/10 border-red-500/30' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as LeadStatus] ?? { label: status, color: 'text-gray-400', dot: 'bg-gray-500', bg: 'bg-gray-700/30 border-gray-600/30' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Lead detail modal ─────────────────────────────────────────────
function LeadDetail({ lead, onClose }: { lead: ContactLead; onClose: () => void }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await contactService.updateStatus(lead.id, status, notes);
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead-stats'] });
      qc.invalidateQueries({ queryKey: ['notif-lead-stats'] });
      toast.success('Lead updated');
      onClose();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold">
              {lead.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{lead.name}</p>
              <p className="text-xs text-gray-500">{lead.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {lead.phone && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                <a href={`tel:${lead.phone}`} className="text-sm text-white hover:text-primary transition-colors">{lead.phone}</a>
              </div>
            )}
            {lead.company && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Company</p>
                <p className="text-sm text-white">{lead.company}</p>
              </div>
            )}
            {lead.service && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Interested In</p>
                <p className="text-sm text-white">{lead.service}</p>
              </div>
            )}
            {lead.budget && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Budget</p>
                <p className="text-sm text-white">{lead.budget}</p>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Message</p>
            <p className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">{lead.message}</p>
          </div>

          <p className="text-xs text-gray-600">Submitted {new Date(lead.submittedAt).toLocaleString()}</p>

          {/* Status selector */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Pipeline Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => {
                const cfg = STATUS_CONFIG[s];
                const active = status === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                      active ? `${cfg.bg} ${cfg.color} scale-105` : 'border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${active ? cfg.dot : 'bg-gray-600'}`} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Internal Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input"
              rows={3}
              placeholder="Add follow-up notes, next steps, etc."
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function Leads() {
  const qc = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);
  useEffect(() => { document.title = 'Leads · Connect Digitals'; }, []);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', { search, status: statusFilter, page }],
    queryFn: async () => {
      const res = await contactService.getAll({
        search, status: statusFilter || undefined,
        page, limit: 20, sortBy: 'submittedAt', sortOrder: 'desc',
      });
      return res.data;
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['lead-stats'],
    queryFn: async () => { const res = await contactService.getStats(); return res.data.data; },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead-stats'] });
      toast.success('Lead deleted');
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  const leads: ContactLead[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={pagination ? `${pagination.total} lead${pagination.total !== 1 ? 's' : ''}` : ''}
        viewUrl="https://web.bereketfikre.et/#contact"
      />

      {/* Pipeline stats — horizontal scroll on mobile */}
      {statsData && (
        <div className="flex sm:grid sm:grid-cols-5 gap-3 mb-6 overflow-x-auto pb-1 sm:pb-0">
          {STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const count = (statsData as any)[s] ?? 0;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                className={`card text-center py-3 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer shrink-0 min-w-[100px] sm:min-w-0 ${
                  statusFilter === s ? `border ${cfg.bg}` : ''
                }`}
              >
                <p className={`text-2xl font-bold tabular-nums ${cfg.color}`}>{count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{cfg.label}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input max-w-xs"
          placeholder="Search name, email, company…"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input max-w-[160px]"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-gray-500 text-sm">Loading…</div>
      ) : leads.length === 0 ? (
        <EmptyState variant="leads" title="No Leads Yet" description="Leads will appear here when someone submits your contact form." />
      ) : (
        <>
          <div className="grid gap-2">
            {leads.map((lead) => (
              <div key={lead.id} className="card flex flex-col sm:flex-row sm:items-center gap-3 hover:border-gray-700 transition-colors">
                {/* Top row on mobile */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-white">{lead.name}</p>
                      <StatusBadge status={lead.status} />
                      {lead.status === 'new' && (
                        <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">New</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lead.email}{lead.company ? ` · ${lead.company}` : ''}
                    </p>
                    {lead.service && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        Interested in: <span className="text-gray-400">{lead.service}</span>
                        {lead.budget && <span className="text-gray-600"> · {lead.budget}</span>}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <p className="text-xs text-gray-600 hidden sm:block">{new Date(lead.submittedAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-600 sm:hidden">{new Date(lead.submittedAt).toLocaleDateString()}</p>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setSelectedLead(lead)} className="btn-ghost text-xs px-3 py-1.5">View</button>
                    <button onClick={() => setDeleteId(lead.id)} className="btn-danger text-xs px-3 py-1.5">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-3 py-1.5 text-xs">← Prev</button>
              <span className="text-sm text-gray-400">{page} / {pagination.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-ghost px-3 py-1.5 text-xs">Next →</button>
            </div>
          )}
        </>
      )}

      {selectedLead && <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />}

      <ConfirmDialog
        isOpen={!!deleteId}
        message="Delete this lead? This cannot be undone."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
