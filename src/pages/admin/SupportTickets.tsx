import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiMail,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCheckCircle,
  FiRefreshCw,
  FiInbox,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getSupportTickets, resolveTicket } from '../../services/adminService';

type TicketStatus = 'open' | 'resolved';
type FilterTab = 'all' | TicketStatus;

interface Ticket {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
}

/* ─────────────────── skeleton ─────────────────── */
function TicketSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
      </div>
      <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

/* ─────────────────── main ─────────────────── */
export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSupportTickets();
      setTickets(data.tickets || data || []);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleResolve = async (ticketId: string) => {
    setResolvingId(ticketId);
    try {
      await resolveTicket(ticketId);
      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId ? { ...t, status: 'resolved' as const } : t
        )
      );
      toast.success('Ticket marked as resolved');
    } catch {
      toast.error('Failed to resolve ticket');
    } finally {
      setResolvingId(null);
    }
  };

  const openCount = useMemo(
    () => tickets.filter((t) => t.status === 'open').length,
    [tickets]
  );
  const resolvedCount = useMemo(
    () => tickets.filter((t) => t.status === 'resolved').length,
    [tickets]
  );

  const filteredTickets = useMemo(() => {
    const filtered =
      activeTab === 'all'
        ? tickets
        : tickets.filter((t) => t.status === activeTab);

    // Sort: open tickets first, then by date descending
    return [...filtered].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'open' ? -1 : 1;
      }
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [tickets, activeTab]);

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: tickets.length },
    { key: 'open', label: 'Open', count: openCount },
    { key: 'resolved', label: 'Resolved', count: resolvedCount },
  ];

  if (loading) return <TicketSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Support Tickets
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={fetchTickets}
          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Refresh tickets"
        >
          <FiRefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl">
              <FiClock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{openCount}</p>
              <p className="text-sm text-amber-600 font-medium">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-xl">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">
                {resolvedCount}
              </p>
              <p className="text-sm text-green-600 font-medium">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs tabular-nums ${
                activeTab === tab.key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiInbox className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">
            {activeTab === 'all'
              ? 'No support tickets yet'
              : `No ${activeTab} tickets`}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {activeTab === 'open'
              ? 'All caught up! No open tickets.'
              : activeTab === 'resolved'
              ? 'No resolved tickets to show.'
              : 'Tickets from the contact form will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket._id}
              className={`bg-white rounded-xl border overflow-hidden transition-shadow ${
                expandedId === ticket._id
                  ? 'border-indigo-200 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Header — always visible */}
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === ticket._id ? null : ticket._id
                  )
                }
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      ticket.status === 'open'
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-green-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {ticket.subject}
                    </p>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {ticket.name} · {ticket.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 ml-3">
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'open'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {ticket.status === 'open' ? 'Open' : 'Resolved'}
                  </span>
                  {expandedId === ticket._id ? (
                    <FiChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <FiChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {expandedId === ticket._id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {ticket.message}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Received:{' '}
                      {new Date(ticket.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {ticket.status === 'open' && (
                      <button
                        onClick={() => handleResolve(ticket._id)}
                        disabled={resolvingId === ticket._id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <FiCheck className="w-4 h-4" />
                        {resolvingId === ticket._id
                          ? 'Resolving...'
                          : 'Mark Resolved'}
                      </button>
                    )}
                    <a
                      href={`mailto:${ticket.email}?subject=Re: ${encodeURIComponent(
                        ticket.subject
                      )}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      <FiMail className="w-4 h-4" />
                      Reply via Email
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}