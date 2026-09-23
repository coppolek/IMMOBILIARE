import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Home, 
  Mail, 
  ShieldAlert, 
  Info, 
  ArrowUpRight, 
  Trash2, 
  BellRing,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { AppNotification, UserProfile } from '../types';
import { markNotificationAsRead, deleteAppNotification, requestBrowserNotificationPermission } from '../services/subscriberService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  user: UserProfile | null;
  onSelectListing?: (listingId: string) => void;
  isIt?: boolean;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  user,
  onSelectListing,
  isIt = true,
}) => {
  const [filter, setFilter] = useState<'all' | 'new_listing' | 'newsletter' | 'scam_alert'>('all');
  const [browserPushEnabled, setBrowserPushEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Local storage read check
  const getIsRead = (notif: AppNotification): boolean => {
    if (user && notif.readBy && notif.readBy.includes(user.uid)) return true;
    try {
      const readSet: string[] = JSON.parse(localStorage.getItem('milan_read_notifications') || '[]');
      return readSet.includes(notif.id);
    } catch {
      return false;
    }
  };

  const unreadCount = notifications.filter(n => !getIsRead(n)).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      await markNotificationAsRead(n.id, user?.uid);
    }
    // Force re-render via localStorage update
    try {
      const allIds = notifications.map(n => n.id);
      localStorage.setItem('milan_read_notifications', JSON.stringify(allIds));
    } catch {}
    setPushStatusMessage(isIt ? 'Tutte le notifiche segnate come lette!' : 'All notifications marked as read!');
    setTimeout(() => setPushStatusMessage(null), 3000);
  };

  const handleSingleRead = async (notif: AppNotification) => {
    await markNotificationAsRead(notif.id, user?.uid);
  };

  const handleEnableBrowserPush = async () => {
    const granted = await requestBrowserNotificationPermission();
    setBrowserPushEnabled(granted);
    if (granted) {
      setPushStatusMessage(isIt ? 'Notifiche browser abilitate con successo!' : 'Browser notifications enabled!');
    } else {
      setPushStatusMessage(isIt ? 'Autorizzazione non concessa o bloccata dal browser.' : 'Notification permission was denied.');
    }
    setTimeout(() => setPushStatusMessage(null), 4000);
  };

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'new_listing':
        return <Home className="w-4 h-4 text-amber-600" />;
      case 'newsletter':
        return <Mail className="w-4 h-4 text-purple-600" />;
      case 'scam_alert':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'urgent':
        return <BellRing className="w-4 h-4 text-orange-600" />;
      default:
        return <Info className="w-4 h-4 text-sky-600" />;
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(isIt ? 'it-IT' : 'en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif flex items-center gap-2">
                <span>{isIt ? 'Centro Notifiche' : 'Notification Center'}</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-xs font-bold">
                    {unreadCount} {isIt ? 'nuove' : 'new'}
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-300">
                {isIt ? 'Avvisi su nuovi alloggi, newsletter e comunicazioni' : 'Housing alerts, newsletters and announcements'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Push Banner */}
        <div className="p-3 bg-amber-50 border-b border-amber-200/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <BellRing className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-stone-700 font-medium truncate">
              {browserPushEnabled
                ? (isIt ? 'Notifiche browser attive: riceverai subito i nuovi annunci.' : 'Browser notifications enabled.')
                : (isIt ? 'Attiva gli avvisi sul tuo dispositivo per non perdere le stanze appena pubblicate.' : 'Enable instant browser alerts.')}
            </span>
          </div>

          {!browserPushEnabled && (
            <button
              onClick={handleEnableBrowserPush}
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors shadow-xs"
            >
              {isIt ? 'Abilita Notifiche' : 'Enable'}
            </button>
          )}
        </div>

        {pushStatusMessage && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border-b border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pushStatusMessage}</span>
          </div>
        )}

        {/* Toolbar & Filters */}
        <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'all' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              {isIt ? 'Tutte' : 'All'} ({notifications.length})
            </button>

            <button
              onClick={() => setFilter('new_listing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'new_listing' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              {isIt ? 'Alloggi' : 'Listings'}
            </button>

            <button
              onClick={() => setFilter('newsletter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'newsletter' ? 'bg-purple-700 text-white' : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              Newsletter
            </button>

            <button
              onClick={() => setFilter('scam_alert')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'scam_alert' ? 'bg-rose-600 text-white' : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              {isIt ? 'Sicurezza' : 'Safety'}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg hover:bg-stone-200/60 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{isIt ? 'Segna tutte lette' : 'Mark all read'}</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y divide-stone-100">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              <Bell className="w-10 h-10 mx-auto text-stone-300 mb-2 stroke-1" />
              <p className="font-semibold text-stone-600 text-sm">
                {isIt ? 'Nessuna notifica presente' : 'No notifications yet'}
              </p>
              <p className="text-stone-400 mt-1">
                {isIt ? 'Riceverai qui gli aggiornamenti su nuovi alloggi e comunicazioni dello staff.' : 'You will receive updates about new housing options and announcements here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isRead = getIsRead(notif);
              return (
                <div
                  key={notif.id}
                  className={`pt-2.5 first:pt-0 p-3 rounded-2xl transition-all ${
                    isRead ? 'bg-white hover:bg-stone-50' : 'bg-amber-50/60 border border-amber-200/80 shadow-xs'
                  }`}
                  onClick={() => handleSingleRead(notif)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isRead ? 'bg-stone-100' : 'bg-amber-100 border border-amber-300/60'
                    }`}>
                      {getNotifIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${
                          isRead ? 'text-stone-800' : 'text-stone-950 font-extrabold'
                        }`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {notif.listingId && onSelectListing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSingleRead(notif);
                                onClose();
                                onSelectListing(notif.listingId!);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs transition-colors"
                            >
                              <span>{isIt ? 'Apri Alloggio' : 'View Listing'}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}

                          {notif.link && !notif.listingId && (
                            <a
                              href={notif.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:underline"
                            >
                              <span>{isIt ? 'Dettagli link' : 'Open link'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {notif.authorName && (
                            <span className="text-[10px] text-stone-400">
                              • da {notif.authorName}
                            </span>
                          )}
                        </div>

                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-[11px] text-stone-500">
          {isIt ? 'Le notifiche vengono sincronizzate in tempo reale con Firebase Firestore' : 'Notifications are synced in realtime with Firebase Firestore'}
        </div>
      </div>
    </div>
  );
};
