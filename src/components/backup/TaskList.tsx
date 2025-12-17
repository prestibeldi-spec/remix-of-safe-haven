import { BackupTask } from '@/types/backup';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Play, 
  Pause, 
  Trash2, 
  FolderSync, 
  Clock, 
  HardDrive,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface TaskListProps {
  tasks: BackupTask[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  onToggleTask: (id: string, enabled: boolean) => void;
  onRunTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const typeLabels = {
  full: 'Complète',
  incremental: 'Incrémentielle',
  differential: 'Différentielle'
};

const frequencyLabels = {
  manual: 'Manuel',
  hourly: 'Horaire',
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel'
};

export function TaskList({ 
  tasks, 
  selectedTaskId, 
  onSelectTask, 
  onToggleTask, 
  onRunTask, 
  onDeleteTask 
}: TaskListProps) {
  const getStatusIcon = (status: BackupTask['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <div
          key={task.id}
          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
            selectedTaskId === task.id 
              ? 'border-primary bg-accent' 
              : 'border-border hover:bg-accent/50'
          }`}
          onClick={() => onSelectTask(task.id)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FolderSync className="h-4 w-4 text-primary shrink-0" />
                <h3 className="font-medium truncate">{task.name}</h3>
                {getStatusIcon(task.status)}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {typeLabels[task.type]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {frequencyLabels[task.schedule.frequency]}
                </Badge>
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {task.destinations.length}
                </Badge>
              </div>

              {task.lastRun && (
                <p className="text-xs text-muted-foreground mt-2">
                  Dernière: {new Date(task.lastRun).toLocaleString('fr-FR')}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2" onClick={e => e.stopPropagation()}>
              <Switch
                checked={task.enabled}
                onCheckedChange={(checked) => onToggleTask(task.id, checked)}
              />
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => onRunTask(task.id)}
                  disabled={task.status === 'running'}
                >
                  {task.status === 'running' ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDeleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FolderSync className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Aucune tâche de sauvegarde</p>
          <p className="text-sm">Créez votre première tâche pour commencer</p>
        </div>
      )}
    </div>
  );
}
