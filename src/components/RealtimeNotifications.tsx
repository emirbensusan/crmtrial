import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Clock, User, DollarSign } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'urgent';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

export const RealtimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      generateRandomNotification();
    }, 30000); // Every 30 seconds

    // Initial notifications
    generateInitialNotifications();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const generateInitialNotifications = () => {
    const initialNotifications: Notification[] = [
      {
        id: '1',
        type: 'urgent',
        title: 'Geciken Takip',
        message: 'TechCorp Solutions ile 16 gün önce yapılan son aktivite. Acil takip gerekli.',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        read: false,
        actionUrl: '/leads',
        actionText: 'Potansiyeli Görüntüle'
      },
      {
        id: '2',
        type: 'success',
        title: 'Anlaşma Kazanıldı',
        message: 'Global Industries anlaşması başarıyla tamamlandı. ₺45,000 gelir eklendi.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        actionUrl: '/deals',
        actionText: 'Anlaşmayı Görüntüle'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Sözleşme Süresi Doluyor',
        message: 'Enterprise Corp sözleşmesi 7 gün içinde sona eriyor. Yenileme gerekli.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: true,
        actionUrl: '/customers',
        actionText: 'Müşteriyi Görüntüle'
      },
      {
        id: '4',
        type: 'info',
        title: 'Yeni Potansiyel',
        message: 'Innovation Labs web sitesi üzerinden yeni potansiyel müşteri kaydı.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        actionUrl: '/leads',
        actionText: 'Potansiyeli İncele'
      }
    ];

    setNotifications(initialNotifications);
  };

  const generateRandomNotification = () => {
    const notificationTypes = [
      {
        type: 'success' as const,
        titles: ['Anlaşma Tamamlandı', 'Ödeme Alındı', 'Müşteri Onayı'],
        messages: [
          'Yeni anlaşma başarıyla imzalandı.',
          'Bekleyen ödeme hesaba geçti.',
          'Müşteri teklifimizi onayladı.'
        ]
      },
      {
        type: 'warning' as const,
        titles: ['Takip Gerekli', 'Sözleşme Uyarısı', 'Ödeme Gecikmesi'],
        messages: [
          'Müşteri ile son iletişimden 10 gün geçti.',
          'Sözleşme yenileme tarihi yaklaşıyor.',
          'Bekleyen ödeme vadesi geçti.'
        ]
      },
      {
        type: 'info' as const,
        titles: ['Yeni Aktivite', 'Sistem Güncellemesi', 'Rapor Hazır'],
        messages: [
          'Takım arkadaşınız yeni aktivite ekledi.',
          'CRM sistemi güncellendi.',
          'Aylık performans raporu hazırlandı.'
        ]
      },
      {
        type: 'urgent' as const,
        titles: ['Acil Takip', 'Kritik Anlaşma', 'Müşteri Şikayeti'],
        messages: [
          'Yüksek değerli potansiyel kaybedilme riski.',
          'Büyük anlaşma için son gün.',
          'Müşteri destek talebi bekliyor.'
        ]
      }
    ];

    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const randomTitle = randomType.titles[Math.floor(Math.random() * randomType.titles.length)];
    const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)];

    const newNotification: Notification = {
      id: Date.now().toString(),
      type: randomType.type,
      title: randomTitle,
      message: randomMessage,
      timestamp: new Date(),
      read: false,
      actionUrl: '/dashboard',
      actionText: 'Görüntüle'
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep last 20
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`;
    return `${Math.floor(diffInMinutes / 1440)} gün önce`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bildirimler</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Tümünü Okundu İşaretle
                </button>
              )}
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Henüz bildirim yok</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          {notification.actionUrl && (
                            <button
                              onClick={() => {
                                markAsRead(notification.id);
                                // Navigate to actionUrl
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {notification.actionText}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
                Tüm Bildirimleri Görüntüle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};