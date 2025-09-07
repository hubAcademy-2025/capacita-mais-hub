import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const { currentUser, notifications, markNotificationsAsRead } = useAppStore();
  
  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    if (currentUser) {
      markNotificationsAsRead(currentUser.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📢';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-floating z-50 animate-scale-in">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-card-foreground">Notificações</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-80">
        <div className="p-2">
          {userNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-1">
              {userNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={cn(
                      "p-3 rounded-lg transition-colors",
                      notification.isRead
                        ? "bg-transparent hover:bg-muted/50"
                        : "bg-primary-light/20 hover:bg-primary-light/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-card-foreground">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                  {index < userNotifications.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {unreadCount > 0 && (
        <div className="p-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="w-full"
          >
            Marcar todas como lidas
          </Button>
        </div>
      )}
    </div>
  );
};