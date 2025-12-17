import { BackupTask, BackupLogEntry } from '@/types/backup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  HardDrive,
  FolderSync,
  Clock
} from 'lucide-react';

interface StatsViewProps {
  tasks: BackupTask[];
  logs: BackupLogEntry[];
}

export function StatsView({ tasks, logs }: StatsViewProps) {
  // Stats calculations
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(t => t.enabled).length;
  const successLogs = logs.filter(l => l.status === 'success').length;
  const errorLogs = logs.filter(l => l.status === 'error').length;
  const warningLogs = logs.filter(l => l.status === 'warning').length;

  // Pie chart data for task types
  const typeData = [
    { name: 'Complète', value: tasks.filter(t => t.type === 'full').length, color: 'hsl(var(--primary))' },
    { name: 'Incrémentielle', value: tasks.filter(t => t.type === 'incremental').length, color: 'hsl(210, 70%, 50%)' },
    { name: 'Différentielle', value: tasks.filter(t => t.type === 'differential').length, color: 'hsl(280, 70%, 50%)' },
  ].filter(d => d.value > 0);

  // Status distribution
  const statusData = [
    { name: 'Succès', value: successLogs, color: 'hsl(142, 70%, 45%)' },
    { name: 'Avertissements', value: warningLogs, color: 'hsl(45, 90%, 50%)' },
    { name: 'Erreurs', value: errorLogs, color: 'hsl(var(--destructive))' },
  ].filter(d => d.value > 0);

  // Simulated weekly activity data
  const weeklyData = [
    { jour: 'Lun', sauvegardes: 4, taille: 12 },
    { jour: 'Mar', sauvegardes: 3, taille: 8 },
    { jour: 'Mer', sauvegardes: 5, taille: 15 },
    { jour: 'Jeu', sauvegardes: 2, taille: 6 },
    { jour: 'Ven', sauvegardes: 4, taille: 11 },
    { jour: 'Sam', sauvegardes: 1, taille: 3 },
    { jour: 'Dim', sauvegardes: 2, taille: 20 },
  ];

  // Destination types count
  const destCounts = tasks.reduce((acc, task) => {
    task.destinations.forEach(d => {
      acc[d.type] = (acc[d.type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const destData = [
    { name: 'Local', count: destCounts['local'] || 0 },
    { name: 'Réseau', count: destCounts['network'] || 0 },
    { name: 'FTP', count: destCounts['ftp'] || 0 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Tableau de bord</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderSync className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTasks}</p>
                <p className="text-xs text-muted-foreground">Tâches totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{successLogs}</p>
                <p className="text-xs text-muted-foreground">Succès</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{warningLogs}</p>
                <p className="text-xs text-muted-foreground">Avertissements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{errorLogs}</p>
                <p className="text-xs text-muted-foreground">Erreurs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Activité hebdomadaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="jour" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="sauvegardes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Storage Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Tendance stockage (GB)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="jour" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="taille" 
                    stroke="hsl(210, 70%, 50%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(210, 70%, 50%)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Task Types */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Types de sauvegarde</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[150px]">
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {typeData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Résultats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[150px]">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Destinations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={destData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="name" type="category" width={60} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
