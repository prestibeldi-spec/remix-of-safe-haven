import { BackupLogEntry } from '@/types/backup';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  FileStack,
  HardDrive,
  Timer
} from 'lucide-react';

interface LogViewerProps {
  logs: BackupLogEntry[];
}

export function LogViewer({ logs }: LogViewerProps) {
  const getStatusIcon = (status: BackupLogEntry['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: BackupLogEntry['status']) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary'
    };
    const labels: Record<string, string> = {
      success: 'Succès',
      error: 'Erreur',
      warning: 'Avertissement'
    };
    return (
      <Badge variant={variants[status]} className="text-xs">
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Historique des sauvegardes</h2>
      
      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-4">
          {logs.map(log => (
            <div
              key={log.id}
              className={`p-4 rounded-lg border ${
                log.status === 'error' 
                  ? 'border-destructive/50 bg-destructive/5' 
                  : log.status === 'warning'
                  ? 'border-yellow-500/50 bg-yellow-500/5'
                  : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(log.status)}
                  <span className="font-medium">{log.taskName}</span>
                </div>
                {getStatusBadge(log.status)}
              </div>
              
              <p className={`text-sm mb-3 ${
                log.status === 'error' ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {log.message}
              </p>
              
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(log.timestamp).toLocaleString('fr-FR')}
                </div>
                {log.filesProcessed && (
                  <div className="flex items-center gap-1">
                    <FileStack className="h-3 w-3" />
                    {log.filesProcessed.toLocaleString()} fichiers
                  </div>
                )}
                {log.size && (
                  <div className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {log.size}
                  </div>
                )}
                {log.duration && (
                  <div className="flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    {log.duration}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {logs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun historique</p>
              <p className="text-sm">Les journaux apparaîtront ici après l'exécution des tâches</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
