import { useState } from 'react';
import { BackupTask, BackupLogEntry } from '@/types/backup';

const initialTasks: BackupTask[] = [
  {
    id: '1',
    name: 'Documents quotidiens',
    enabled: true,
    type: 'incremental',
    sources: ['C:\\Users\\Documents', 'C:\\Users\\Desktop'],
    destinations: [{ id: 'd1', type: 'local', path: 'D:\\Backups\\Documents' }],
    schedule: { frequency: 'daily', time: '02:00' },
    includeSubfolders: true,
    useVSS: true,
    compression: true,
    encryption: false,
    excludePatterns: ['*.tmp', '*.log'],
    verifyCRC: true,
    createVersionedBackups: true,
    lastRun: '2024-01-15T02:00:00',
    nextRun: '2024-01-16T02:00:00',
    status: 'success'
  },
  {
    id: '2',
    name: 'Base de données',
    enabled: true,
    type: 'full',
    sources: ['C:\\Database\\Data'],
    destinations: [
      { id: 'd2', type: 'network', path: '\\\\NAS\\Backups\\DB' },
      { id: 'd3', type: 'ftp', path: '/backup/db', host: '192.168.1.100', port: 21, username: 'backup', passive: true }
    ],
    schedule: { frequency: 'weekly', time: '03:00', days: [0] },
    includeSubfolders: true,
    useVSS: true,
    compression: true,
    encryption: true,
    encryptionMethod: 'aes256',
    excludePatterns: [],
    verifyCRC: true,
    createVersionedBackups: true,
    lastRun: '2024-01-14T03:00:00',
    nextRun: '2024-01-21T03:00:00',
    status: 'success'
  },
  {
    id: '3',
    name: 'Photos et vidéos',
    enabled: false,
    type: 'differential',
    sources: ['D:\\Media\\Photos', 'D:\\Media\\Videos'],
    destinations: [{ id: 'd4', type: 'local', path: 'E:\\Backups\\Media' }],
    schedule: { frequency: 'monthly', time: '04:00', dayOfMonth: 1 },
    includeSubfolders: true,
    useVSS: false,
    compression: false,
    encryption: false,
    excludePatterns: ['*.avi', 'Thumbs.db'],
    verifyCRC: false,
    createVersionedBackups: false,
    status: 'idle'
  }
];

const initialLogs: BackupLogEntry[] = [
  {
    id: 'l1',
    taskId: '1',
    taskName: 'Documents quotidiens',
    timestamp: '2024-01-15T02:15:32',
    status: 'success',
    message: 'Sauvegarde terminée avec succès',
    filesProcessed: 1247,
    size: '2.3 GB',
    duration: '15m 32s'
  },
  {
    id: 'l2',
    taskId: '2',
    taskName: 'Base de données',
    timestamp: '2024-01-14T03:45:12',
    status: 'success',
    message: 'Sauvegarde complète terminée',
    filesProcessed: 89,
    size: '15.7 GB',
    duration: '45m 12s'
  },
  {
    id: 'l3',
    taskId: '1',
    taskName: 'Documents quotidiens',
    timestamp: '2024-01-14T02:12:45',
    status: 'warning',
    message: '3 fichiers ignorés (en cours d\'utilisation)',
    filesProcessed: 1244,
    size: '2.1 GB',
    duration: '12m 45s'
  },
  {
    id: 'l4',
    taskId: '3',
    taskName: 'Photos et vidéos',
    timestamp: '2024-01-01T04:30:00',
    status: 'error',
    message: 'Erreur: Espace disque insuffisant sur la destination',
    filesProcessed: 5420,
    size: '45.2 GB',
    duration: '30m 00s'
  }
];

export function useBackupTasks() {
  const [tasks, setTasks] = useState<BackupTask[]>(initialTasks);
  const [logs, setLogs] = useState<BackupLogEntry[]>(initialLogs);

  const addTask = (task: Omit<BackupTask, 'id' | 'status'>) => {
    const newTask: BackupTask = {
      ...task,
      id: Date.now().toString(),
      status: 'idle'
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<BackupTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const runTask = (id: string) => {
    updateTask(id, { status: 'running' });
    // Simulate backup
    setTimeout(() => {
      updateTask(id, { 
        status: 'success', 
        lastRun: new Date().toISOString() 
      });
      const task = tasks.find(t => t.id === id);
      if (task) {
        const newLog: BackupLogEntry = {
          id: Date.now().toString(),
          taskId: id,
          taskName: task.name,
          timestamp: new Date().toISOString(),
          status: 'success',
          message: 'Sauvegarde terminée avec succès',
          filesProcessed: Math.floor(Math.random() * 1000) + 100,
          size: `${(Math.random() * 10).toFixed(1)} GB`,
          duration: `${Math.floor(Math.random() * 30)}m ${Math.floor(Math.random() * 60)}s`
        };
        setLogs(prev => [newLog, ...prev]);
      }
    }, 3000);
  };

  return { tasks, logs, addTask, updateTask, deleteTask, runTask };
}
