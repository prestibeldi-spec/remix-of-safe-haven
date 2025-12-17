import { useState } from 'react';
import { useBackupTasks } from '@/hooks/useBackupTasks';
import { TaskList } from '@/components/backup/TaskList';
import { TaskEditor } from '@/components/backup/TaskEditor';
import { LogViewer } from '@/components/backup/LogViewer';
import { StatsView } from '@/components/backup/StatsView';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  FolderSync, 
  History,
  Settings,
  Play,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { tasks, logs, addTask, updateTask, deleteTask, runTask } = useBackupTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  const handleCreateNew = () => {
    setSelectedTaskId(null);
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleSelectTask = (id: string) => {
    setSelectedTaskId(id);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSave = (taskData: any) => {
    if (isCreating) {
      addTask(taskData);
      toast({
        title: 'Tâche créée',
        description: `La tâche "${taskData.name}" a été créée avec succès.`
      });
    } else if (selectedTaskId) {
      updateTask(selectedTaskId, taskData);
      toast({
        title: 'Tâche modifiée',
        description: `La tâche "${taskData.name}" a été mise à jour.`
      });
    }
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleToggleTask = (id: string, enabled: boolean) => {
    updateTask(id, { enabled });
  };

  const handleRunTask = (id: string) => {
    runTask(id);
    const task = tasks.find(t => t.id === id);
    toast({
      title: 'Sauvegarde lancée',
      description: `Exécution de "${task?.name}" en cours...`
    });
  };

  const handleDeleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    deleteTask(id);
    if (selectedTaskId === id) {
      setSelectedTaskId(null);
      setIsEditing(false);
    }
    toast({
      title: 'Tâche supprimée',
      description: `La tâche "${task?.name}" a été supprimée.`,
      variant: 'destructive'
    });
  };

  const handleRunAll = () => {
    const enabledTasks = tasks.filter(t => t.enabled && t.status !== 'running');
    enabledTasks.forEach(t => runTask(t.id));
    toast({
      title: 'Sauvegardes lancées',
      description: `${enabledTasks.length} tâche(s) en cours d'exécution.`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <FolderSync className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Backup Manager</h1>
                <p className="text-sm text-muted-foreground">
                  Gestionnaire de sauvegardes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleRunAll}>
                <Play className="h-4 w-4 mr-1" />
                Tout exécuter
              </Button>
              <Button size="sm" onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-1" />
                Nouvelle tâche
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Task List */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Tâches ({tasks.length})
                </h2>
              </div>
              <TaskList
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={handleSelectTask}
                onToggleTask={handleToggleTask}
                onRunTask={handleRunTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          </div>

          {/* Right Panel - Editor/Logs */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border p-4 min-h-[500px]">
              {isEditing || isCreating ? (
                <TaskEditor
                  task={isCreating ? null : selectedTask}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isNew={isCreating}
                />
              ) : (
                <Tabs defaultValue="stats" className="h-full">
                  <TabsList>
                    <TabsTrigger value="stats" className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      Statistiques
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="flex items-center gap-1">
                      <History className="h-4 w-4" />
                      Historique
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="stats" className="mt-4">
                    <StatsView tasks={tasks} logs={logs} />
                  </TabsContent>
                  <TabsContent value="logs" className="mt-4">
                    <LogViewer logs={logs} />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
