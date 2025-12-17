export type BackupType = 'full' | 'incremental' | 'differential';

export type ScheduleFrequency = 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';

export type DestinationType = 'local' | 'network' | 'ftp';

export interface BackupDestination {
  id: string;
  type: DestinationType;
  path: string;
  // FTP specific
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  passive?: boolean;
}

export interface BackupSchedule {
  frequency: ScheduleFrequency;
  time?: string;
  days?: number[];
  dayOfMonth?: number;
}

export interface BackupTask {
  id: string;
  name: string;
  enabled: boolean;
  type: BackupType;
  sources: string[];
  destinations: BackupDestination[];
  schedule: BackupSchedule;
  includeSubfolders: boolean;
  useVSS: boolean;
  compression: boolean;
  encryption: boolean;
  encryptionMethod?: 'aes128' | 'aes256';
  excludePatterns: string[];
  verifyCRC: boolean;
  createVersionedBackups: boolean;
  lastRun?: string;
  nextRun?: string;
  status: 'idle' | 'running' | 'success' | 'error';
}

export interface BackupLogEntry {
  id: string;
  taskId: string;
  taskName: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  filesProcessed?: number;
  size?: string;
  duration?: string;
}
