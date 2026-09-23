import React, { useState } from 'react';
import { 
  Users, 
  Mail, 
  Bell, 
  Send, 
  Search, 
  Download, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Eye, 
  Copy, 
  Sparkles, 
  Filter,
  ShieldAlert,
  Home,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { Subscriber, AppNotification, Newsletter, UserProfile, Listing } from '../types';
import { 
  addOrUpdateSubscriber, 
  toggleSubscriberStatus, 
  deleteSubscriber, 
  updateUserRoleInAdmin,
  deleteUserFromAdmin,
  sendAppNotification, 
  deleteAppNotification, 
  createAndSendNewsletter, 
  deleteNewsletter,
  generateEmailHtml 
} from '../services/subscriberService';

interface AdminSubscribersPanelProps {
  subscribers: Subscriber[];
  users: UserProfile[];
  notifications: AppNotification[];
  newsletters: Newsletter[];
  listings: Listing[];
  adminUser: UserProfile | null;
  isIt?: boolean;
  onNotification?: (msg: string) => void;
  onRefresh?: () => void;
  onSelectListing?: (id: string) => void;
}

export const AdminSubscribersPanel: React.FC<AdminSubscribersPanelProps> = ({
  subscribers,
  users,
  notifications,
  newsletters,
  listings,
  adminUser,
  isIt = true,
  onNotification,
  onRefresh,
  onSelectListing,
}) => {
  const [subTab, setSubTab] = useState<'subscribers' | 'notifications' | 'newsletters'>('subscribers');

  // Subscribers state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubRole, setNewSubRole] = useState<'student' | 'worker' | 'landlord'>('student');
  const [newSubZone, setNewSubZone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // In-App Notification Composer state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<AppNotification['type']>('new_listing');
  const [notifAudience, setNotifAudience] = useState<AppNotification['targetAudience']>('all');
  const [notifSelectedListingId, setNotifSelectedListingId] = useState<string>('');
  const [notifLink, setNotifLink] = useState('');

  // Newsletter Composer state
  const [nlSubject, setNlSubject] = useState('');
  const [nlPreheader, setNlPreheader] = useState('');
  const [nlContent, setNlContent] = useState('');
  const [nlAudience, setNlAudience] = useState<Newsletter['targetAudience']>('all');
  const [nlSelectedListingIds, setNlSelectedListingIds] = useState<string[]>([]);
  const [previewNewsletterHtml, setPreviewNewsletterHtml] = useState<string | null>(null);

  // ----------------------------------------------------
  // SUBSCRIBERS LOGIC
  // ----------------------------------------------------

  const filteredSubscribers = subscribers.filter(s => {
    const matchesSearch = 
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.preferredZones || []).some(z => z.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddManualSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail.trim() || !newSubEmail.includes('@')) {
      alert(isIt ? 'Inserisci un indirizzo email valido.' : 'Invalid email');
      return;
    }
    setIsProcessing(true);
    try {
      await addOrUpdateSubscriber({
        email: newSubEmail.trim(),
        name: newSubName.trim() || undefined,
        role: newSubRole,
        preferredZones: newSubZone ? [newSubZone.trim()] : undefined,
        source: 'manual_admin',
      });
      setShowAddSubscriberModal(false);
      setNewSubEmail('');
      setNewSubName('');
      setNewSubZone('');
      if (onNotification) onNotification(isIt ? 'Iscritto aggiunto con successo!' : 'Subscriber added!');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async (s: Subscriber) => {
    try {
      await toggleSubscriberStatus(s.id, !s.active);
      if (onNotification) onNotification(isIt ? `Stato aggiornato per ${s.email}` : 'Status updated');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSub = async (s: Subscriber) => {
    if (!window.confirm(isIt ? `Rimuovere definitivamente ${s.email}?` : `Delete ${s.email}?`)) return;
    try {
      await deleteSubscriber(s.id);
      if (onNotification) onNotification(isIt ? 'Iscritto eliminato' : 'Deleted');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Email', 'Nome', 'Ruolo', 'Stato', 'Data Iscrizione', 'Zone Preferite', 'Budget Max'];
    const rows = subscribers.map(s => [
      `"${s.email}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${s.role || 'student'}"`,
      s.active ? 'Attivo' : 'Disiscritto',
      `"${s.subscribedAt || ''}"`,
      `"${(s.preferredZones || []).join('; ')}"`,
      s.maxBudget || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `iscritti_affitti_milano_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (onNotification) onNotification(isIt ? 'File CSV esportato con successo!' : 'CSV exported!');
  };

  // ----------------------------------------------------
  // IN-APP NOTIFICATION SENDING
  // ----------------------------------------------------

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      alert(isIt ? 'Inserisci sia il titolo che il messaggio.' : 'Please enter title and message.');
      return;
    }

    setIsProcessing(true);
    try {
      await sendAppNotification({
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        type: notifType,
        targetAudience: notifAudience,
        listingId: notifSelectedListingId || undefined,
        link: notifLink.trim() || undefined,
        authorName: adminUser?.displayName || 'Staff Amministrazione',
      });

      setNotifTitle('');
      setNotifMessage('');
      setNotifSelectedListingId('');
      setNotifLink('');
      if (onNotification) {
        onNotification(isIt ? 'Notifica In-App trasmessa con successo a tutti i client!' : 'In-app notification sent!');
      }
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteNotif = async (id: string) => {
    if (!window.confirm(isIt ? 'Eliminare questa notifica?' : 'Delete notification?')) return;
    try {
      await deleteAppNotification(id);
      if (onNotification) onNotification(isIt ? 'Notifica rimossa' : 'Deleted');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ----------------------------------------------------
  // NEWSLETTER SENDING & PREVIEW
  // ----------------------------------------------------

  const handleToggleNlListing = (id: string) => {
    if (nlSelectedListingIds.includes(id)) {
      setNlSelectedListingIds(nlSelectedListingIds.filter(x => x !== id));
    } else {
      if (nlSelectedListingIds.length >= 4) {
        alert(isIt ? 'Puoi selezionare al massimo 4 alloggi in evidenza per newsletter.' : 'Max 4 listings allowed in preview.');
        return;
      }
      setNlSelectedListingIds([...nlSelectedListingIds, id]);
    }
  };

  const handlePreviewNewsletter = () => {
    if (!nlSubject.trim() || !nlContent.trim()) {
      alert(isIt ? 'Inserisci prima oggetto e corpo della newsletter.' : 'Fill subject and content first.');
      return;
    }

    const mockNl: Newsletter = {
      id: 'preview-temp',
      subject: nlSubject.trim(),
      previewText: nlPreheader.trim(),
      content: nlContent.trim(),
      featuredListingIds: nlSelectedListingIds,
      targetAudience: nlAudience,
      sentAt: new Date().toISOString(),
      sentBy: adminUser?.email || 'admin',
      recipientCount: subscribers.filter(s => s.active).length,
      status: 'draft',
    };

    const html = generateEmailHtml(mockNl, listings);
    setPreviewNewsletterHtml(html);
  };

  const handleSendNewsletter = async () => {
    if (!nlSubject.trim() || !nlContent.trim()) {
      alert(isIt ? 'Compila oggetto e contenuto.' : 'Fill in subject and content');
      return;
    }

    const recipientCount = subscribers.filter(s => s.active).length;
    if (!window.confirm(isIt 
      ? `Vuoi pubblicare e trasmettere la newsletter a ${recipientCount} iscritti attivi?` 
      : `Publish and send newsletter to ${recipientCount} subscribers?`
    )) {
      return;
    }

    setIsProcessing(true);
    try {
      await createAndSendNewsletter({
        subject: nlSubject.trim(),
        previewText: nlPreheader.trim() || undefined,
        content: nlContent.trim(),
        featuredListingIds: nlSelectedListingIds,
        targetAudience: nlAudience,
        sentBy: adminUser?.email || 'admin@affittimilano.it',
        recipientCount,
      });

      setNlSubject('');
      setNlPreheader('');
      setNlContent('');
      setNlSelectedListingIds([]);
      setPreviewNewsletterHtml(null);
      if (onNotification) {
        onNotification(isIt ? `Newsletter pubblicata con successo a ${recipientCount} iscritti!` : 'Newsletter published!');
      }
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteNl = async (id: string) => {
    if (!window.confirm(isIt ? 'Eliminare questa newsletter dall\'archivio?' : 'Delete this newsletter?')) return;
    try {
      await deleteNewsletter(id);
      if (onNotification) onNotification(isIt ? 'Newsletter eliminata' : 'Deleted');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const activeSubscribersCount = subscribers.filter(s => s.active).length;

  return (
    <div className="space-y-6">
      {/* Top Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-semibold">{isIt ? 'Iscritti Newsletter' : 'Subscribers'}</span>
            <Mail className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-serif">
            {subscribers.length}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {activeSubscribersCount} {isIt ? 'attivi' : 'active'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-semibold">{isIt ? 'Utenti Registrati' : 'Users Registered'}</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-serif">
            {users.length || 1}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">
            {isIt ? 'account cloud Firebase' : 'cloud user accounts'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-semibold">{isIt ? 'Notifiche In-App' : 'In-App Alerts'}</span>
            <Bell className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-serif">
            {notifications.length}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">
            {isIt ? 'trasmesse ai dispositivi' : 'dispatched to devices'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-semibold">{isIt ? 'Newsletter Pubblicate' : 'Newsletters'}</span>
            <Send className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 font-serif">
            {newsletters.length}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">
            {isIt ? 'edizioni trasmesse' : 'dispatched editions'}
          </div>
        </div>
      </div>

      {/* Sub-Tabs switcher */}
      <div className="bg-stone-100 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setSubTab('subscribers')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === 'subscribers' 
              ? 'bg-white text-stone-900 shadow-xs' 
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
          }`}
        >
          <Users className="w-4 h-4 text-amber-600" />
          <span>{isIt ? 'Gestione Iscritti & Utenti' : 'Subscribers & Users'} ({subscribers.length})</span>
        </button>

        <button
          onClick={() => setSubTab('notifications')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === 'notifications' 
              ? 'bg-white text-stone-900 shadow-xs' 
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
          }`}
        >
          <Bell className="w-4 h-4 text-purple-600" />
          <span>{isIt ? 'Invia Notifiche In-App' : 'Broadcast In-App Alerts'} ({notifications.length})</span>
        </button>

        <button
          onClick={() => setSubTab('newsletters')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            subTab === 'newsletters' 
              ? 'bg-white text-stone-900 shadow-xs' 
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
          }`}
        >
          <Mail className="w-4 h-4 text-emerald-600" />
          <span>{isIt ? 'Componi & Invia Newsletter' : 'Compose Newsletter'} ({newsletters.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: SUBSCRIBERS & USERS LIST */}
      {subTab === 'subscribers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder={isIt ? 'Cerca per email, nome o zona...' : 'Search email, name or zone...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold focus:outline-hidden focus:border-amber-500"
              >
                <option value="all">{isIt ? 'Tutti i Ruoli' : 'All Roles'}</option>
                <option value="student">{isIt ? 'Studenti' : 'Students'}</option>
                <option value="worker">{isIt ? 'Lavoratori' : 'Workers'}</option>
                <option value="landlord">{isIt ? 'Proprietari' : 'Landlords'}</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddSubscriberModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{isIt ? 'Aggiungi Iscritto' : 'Add Subscriber'}</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors flex items-center gap-1.5 border border-stone-200"
              >
                <Download className="w-4 h-4 text-stone-600" />
                <span>{isIt ? 'Esporta CSV' : 'Export CSV'}</span>
              </button>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
                    <th className="p-3.5">Email & Nome</th>
                    <th className="p-3.5">Ruolo</th>
                    <th className="p-3.5">Zone & Budget</th>
                    <th className="p-3.5">Iscrizione</th>
                    <th className="p-3.5">Stato</th>
                    <th className="p-3.5 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400">
                        {isIt ? 'Nessun iscritto trovato.' : 'No subscribers found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map(sub => (
                      <tr key={sub.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-stone-900">{sub.email}</div>
                          {sub.name && (
                            <div className="text-[11px] text-stone-500">{sub.name}</div>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            sub.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : sub.role === 'landlord'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {sub.role || 'student'}
                          </span>
                        </td>

                        <td className="p-3.5">
                          {sub.preferredZones && sub.preferredZones.length > 0 ? (
                            <div className="text-[11px] text-stone-700 font-medium">
                              {sub.preferredZones.join(', ')}
                            </div>
                          ) : (
                            <span className="text-stone-400 text-[11px]">Tutta Milano</span>
                          )}
                          {sub.maxBudget && (
                            <div className="text-[10px] text-amber-700 font-bold">
                              Budget max: €{sub.maxBudget}
                            </div>
                          )}
                        </td>

                        <td className="p-3.5 text-stone-500 text-[11px]">
                          {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('it-IT') : '-'}
                        </td>

                        <td className="p-3.5">
                          <button
                            onClick={() => handleToggleStatus(sub)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                              sub.active 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                            }`}
                          >
                            {sub.active ? '● Attivo' : '○ Inattivo'}
                          </button>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteSub(sub)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Elimina iscritto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: IN-APP NOTIFICATIONS BROADCAST */}
      {subTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 cols: Notification Form */}
          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={handleSendNotification} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-600" />
                  <span>{isIt ? 'Trasmetti Notifica In-App a Tutti i Dispositivi' : 'Broadcast In-App Notification'}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isIt 
                    ? 'La notifica apparirà istantaneamente nella campanella di tutti gli utenti e nel browser se abilitato.' 
                    : 'Dispatches instant notification to all active devices and browser alert.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isIt ? 'Titolo Notifica *' : 'Notification Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="es. ⚡ Nuove stanze singole a Lambrate / Città Studi"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isIt ? 'Testo del Messaggio *' : 'Message Body *'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="es. Sono stati caricati 3 nuovi alloggi verificati vicino al Politecnico con canone trasparente da 580€."
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium focus:outline-hidden focus:border-amber-500 focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isIt ? 'Tipologia / Icona' : 'Category / Type'}
                  </label>
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="new_listing">🏠 {isIt ? 'Nuovo Alloggio' : 'New Listing'}</option>
                    <option value="newsletter">📬 {isIt ? 'Newsletter & Aggiornamenti' : 'Newsletter'}</option>
                    <option value="scam_alert">🛡️ {isIt ? 'Sicurezza & Anti-Truffa' : 'Scam Alert'}</option>
                    <option value="system">ℹ️ {isIt ? 'Avviso Amministrazione' : 'System Notice'}</option>
                    <option value="urgent">🚨 {isIt ? 'Avviso Urgente' : 'Urgent'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isIt ? 'Destinatari (Target)' : 'Audience'}
                  </label>
                  <select
                    value={notifAudience}
                    onChange={(e) => setNotifAudience(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="all">👥 {isIt ? 'Tutti gli Utenti & Visitatori' : 'All Users'}</option>
                    <option value="students">🎓 {isIt ? 'Solo Studenti' : 'Students Only'}</option>
                    <option value="workers">💼 {isIt ? 'Solo Lavoratori' : 'Workers Only'}</option>
                    <option value="landlords">🔑 {isIt ? 'Solo Proprietari' : 'Landlords Only'}</option>
                    <option value="subscribers">📬 {isIt ? 'Solo Iscritti Newsletter' : 'Newsletter Subscribers Only'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isIt ? 'Collega ad Annuncio Esistente (Opzionale)' : 'Link to Existing Listing (Optional)'}
                  </label>
                  <select
                    value={notifSelectedListingId}
                    onChange={(e) => setNotifSelectedListingId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="">{isIt ? '-- Nessun alloggio collegato --' : '-- No listing attached --'}</option>
                    {listings.slice(0, 30).map(l => (
                      <option key={l.id} value={l.id}>
                        {l.title.slice(0, 40)}... (€{l.price} - {l.zone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isIt ? 'Oppure Link Esterno URL (Opzionale)' : 'Or External URL Link (Optional)'}
                  </label>
                  <input
                    type="url"
                    value={notifLink}
                    onChange={(e) => setNotifLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{isProcessing ? 'Trasmissione in corso...' : 'Trasmetti Notifica In-App Subito'}</span>
              </button>
            </form>
          </div>

          {/* Right col: History of sent notifications */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-3">
                {isIt ? 'Notifiche Attive nel Database' : 'Active In-App Notifications'} ({notifications.length})
              </h4>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 text-xs space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-stone-900 line-clamp-1">{n.title}</span>
                      <button
                        onClick={() => handleDeleteNotif(n.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Elimina notifica"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-600 line-clamp-2">{n.message}</p>
                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-200/60">
                      <span className="capitalize">{n.type} • {n.targetAudience}</span>
                      <span>{new Date(n.createdAt).toLocaleDateString('it-IT')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: NEWSLETTER COMPOSER & ARCHIVE */}
      {subTab === 'newsletters' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 cols: Newsletter Builder */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>{isIt ? 'Componi Nuova Edizione Newsletter' : 'Compose Newsletter Edition'}</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {isIt 
                      ? `Verrà inviata e pubblicata per ${activeSubscribersCount} iscritti attivi.` 
                      : `Will be sent to ${activeSubscribersCount} active subscribers.`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNlSubject('Novità Alloggi Milano: Stanze Verificate & Guida per Fuorisede');
                    setNlPreheader('Scopri le nuove disponibilità con canone regolare a Bovisa, Lambrate e Porta Romana.');
                    setNlContent(`Gentili studenti e coinquilini,
eccoci con la selezione aggiornata degli alloggi disponibili questa settimana a Milano.
Abbiamo verificato personalmente la congruità dei canoni di locazione e la presenza dei requisiti per il contratto transitorio studenti.

Ricordati di richiedere sempre il codice fiscale del proprietario prima di versare caparre e usa il nostro strumento anti-truffa.`);
                    if (listings.length >= 2) {
                      setNlSelectedListingIds([listings[0].id, listings[1].id]);
                    }
                  }}
                  className="text-xs font-bold text-emerald-700 hover:underline bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
                >
                  Carica Bozza Esempio
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isIt ? 'Oggetto Email (Subject) *' : 'Email Subject *'}
                </label>
                <input
                  type="text"
                  required
                  value={nlSubject}
                  onChange={(e) => setNlSubject(e.target.value)}
                  placeholder="es. Affitti Milano #15: Nuovi alloggi a Lambrate e consigli contratto"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isIt ? 'Testo Anteprima (Preheader)' : 'Preheader Text'}
                </label>
                <input
                  type="text"
                  value={nlPreheader}
                  onChange={(e) => setNlPreheader(e.target.value)}
                  placeholder="es. Le migliori stanze singole selezionate vicino alle università"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isIt ? 'Contenuto Principale della Newsletter *' : 'Main Newsletter Content *'}
                </label>
                <textarea
                  required
                  rows={6}
                  value={nlContent}
                  onChange={(e) => setNlContent(e.target.value)}
                  placeholder="Scrivi qui il messaggio per la community..."
                  className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium focus:outline-hidden focus:border-amber-500 focus:bg-white resize-none leading-relaxed"
                />
              </div>

              {/* Featured Listings Picker */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {isIt ? 'Includi Alloggi in Evidenza nel corpo della Newsletter (Max 4):' : 'Include Featured Listings (Max 4):'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
                  {listings.slice(0, 16).map(listing => {
                    const isSelected = nlSelectedListingIds.includes(listing.id);
                    return (
                      <div
                        key={listing.id}
                        onClick={() => handleToggleNlListing(listing.id)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                          isSelected 
                            ? 'bg-amber-100/70 border-amber-400 font-bold' 
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-stone-900">{listing.title}</div>
                          <div className="text-[10px] text-stone-500">€{listing.price} • {listing.zone}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePreviewNewsletter}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-stone-200"
                >
                  <Eye className="w-4 h-4 text-stone-700" />
                  <span>{isIt ? 'Anteprima Email HTML' : 'Preview HTML Email'}</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSendNewsletter}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isProcessing 
                      ? 'Pubblicazione in corso...' 
                      : `Invia Newsletter a ${activeSubscribersCount} Iscritti`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right col: Newsletters Archive */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-3">
                {isIt ? 'Archivio Newsletter Inviate' : 'Sent Newsletters Archive'} ({newsletters.length})
              </h4>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {newsletters.length === 0 ? (
                  <p className="text-xs text-stone-400 py-6 text-center">
                    {isIt ? 'Nessuna newsletter inviata finora.' : 'No sent newsletters yet.'}
                  </p>
                ) : (
                  newsletters.map(nl => (
                    <div key={nl.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 text-xs space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-stone-900 line-clamp-1">{nl.subject}</span>
                        <button
                          onClick={() => handleDeleteNl(nl.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          title="Elimina dall'archivio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-stone-600 line-clamp-2">
                        {nl.content.replace(/<[^>]*>?/gm, '')}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-200/60">
                        <span className="font-semibold text-emerald-700">
                          {nl.recipientCount} {isIt ? 'destinatari' : 'recipients'}
                        </span>
                        <span>{new Date(nl.sentAt).toLocaleDateString('it-IT')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HTML EMAIL PREVIEW MODAL */}
      {previewNewsletterHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm font-serif">Anteprima Template Email (Client-Ready HTML)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewNewsletterHtml);
                    alert(isIt ? 'Codice HTML copiato negli appunti!' : 'HTML copied to clipboard!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copia HTML</span>
                </button>
                <button
                  onClick={() => setPreviewNewsletterHtml(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-stone-100">
              <div 
                className="bg-white rounded-xl shadow-xs overflow-hidden max-w-xl mx-auto border border-stone-200"
                dangerouslySetInnerHTML={{ __html: previewNewsletterHtml }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ADD SUBSCRIBER MODAL */}
      {showAddSubscriberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-900/60 backdrop-blur-xs">
          <form onSubmit={handleAddManualSubscriber} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">Aggiungi Iscritto Manualmente</h3>
              <button type="button" onClick={() => setShowAddSubscriberModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={newSubEmail}
                onChange={(e) => setNewSubEmail(e.target.value)}
                placeholder="nome@dominio.it"
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Nome</label>
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="Mario Rossi"
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Ruolo</label>
                <select
                  value={newSubRole}
                  onChange={(e) => setNewSubRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500"
                >
                  <option value="student">Studente</option>
                  <option value="worker">Lavoratore</option>
                  <option value="landlord">Proprietario</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Zona di interesse</label>
                <input
                  type="text"
                  value={newSubZone}
                  onChange={(e) => setNewSubZone(e.target.value)}
                  placeholder="Città Studi"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddSubscriberModal(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
              >
                Salva Iscritto
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
