import { useState, useEffect } from 'react';
import { BackupTask, BackupType, ScheduleFrequency, BackupDestination } from '@/types/backup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  FolderOpen, 
  Server, 
  Globe,
  Save,
  X
} from 'lucide-react';

interface TaskEditorProps {
  task: BackupTask | null;
  onSave: (task: Partial<BackupTask>) => void;
  onCancel: () => void;
  isNew?: boolean;
}

const defaultTask: Omit<BackupTask, 'id' | 'status'> = {
  name: '',
  enabled: true,
  type: 'incremental',
  sources: [],
  destinations: [],
  schedule: { frequency: 'daily', time: '02:00' },
  includeSubfolders: true,
  useVSS: false,
  compression: true,
  encryption: false,
  excludePatterns: [],
  verifyCRC: true,
  createVersionedBackups: true
};

export function TaskEditor({ task, onSave, onCancel, isNew }: TaskEditorProps) {
  const [formData, setFormData] = useState<Omit<BackupTask, 'id' | 'status'>>(
    task ? { ...task } : { ...defaultTask }
  );
  const [newSource, setNewSource] = useState('');
  const [newExclude, setNewExclude] = useState('');
  const [showNameError, setShowNameError] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({ ...task });
    } else {
      setFormData({ ...defaultTask });
    }
    setShowNameError(false);
  }, [task]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      setShowNameError(true);
      return;
    }
    onSave(formData);
  };

  const addSource = () => {
    if (newSource.trim()) {
      setFormData(prev => ({
        ...prev,
        sources: [...prev.sources, newSource.trim()]
      }));
      setNewSource('');
    }
  };

  const removeSource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index)
    }));
  };

  const addDestination = (type: 'local' | 'network' | 'ftp') => {
    const newDest: BackupDestination = {
      id: Date.now().toString(),
      type,
      path: '',
      ...(type === 'ftp' && { host: '', port: 21, username: '', passive: true })
    };
    setFormData(prev => ({
      ...prev,
      destinations: [...prev.destinations, newDest]
    }));
  };

  const updateDestination = (id: string, updates: Partial<BackupDestination>) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.map(d => 
        d.id === id ? { ...d, ...updates } : d
      )
    }));
  };

  const removeDestination = (id: string) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.filter(d => d.id !== id)
    }));
  };

  const addExclude = () => {
    if (newExclude.trim()) {
      setFormData(prev => ({
        ...prev,
        excludePatterns: [...prev.excludePatterns, newExclude.trim()]
      }));
      setNewExclude('');
    }
  };

  const removeExclude = (index: number) => {
    setFormData(prev => ({
      ...prev,
      excludePatterns: prev.excludePatterns.filter((_, i) => i !== index)
    }));
  };

  const destIcon = (type: string) => {
    switch (type) {
      case 'local': return <FolderOpen className="h-4 w-4" />;
      case 'network': return <Server className="h-4 w-4" />;
      case 'ftp': return <Globe className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {isNew ? 'Nouvelle tâche' : 'Modifier la tâche'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Annuler
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Enregistrer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="schedule">Planification</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la tâche <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (e.target.value.trim()) setShowNameError(false);
              }}
              placeholder="Ma sauvegarde"
              className={showNameError && !formData.name.trim() ? 'border-destructive' : ''}
              autoFocus={isNew}
            />
            {showNameError && !formData.name.trim() && (
              <p className="text-xs text-destructive">Le nom de la tâche est obligatoire</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type de sauvegarde</Label>
            <Select
              value={formData.type}
              onValueChange={(value: BackupType) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Complète</SelectItem>
                <SelectItem value="incremental">Incrémentielle</SelectItem>
                <SelectItem value="differential">Différentielle</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.type === 'full' && 'Copie tous les fichiers à chaque exécution'}
              {formData.type === 'incremental' && 'Copie uniquement les fichiers modifiés depuis la dernière sauvegarde'}
              {formData.type === 'differential' && 'Copie les fichiers modifiés depuis la dernière sauvegarde complète'}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Tâche activée</Label>
              <p className="text-xs text-muted-foreground">
                Exécuter selon la planification
              </p>
            </div>
            <Switch
              checked={formData.enabled}
              onCheckedChange={checked => setFormData(prev => ({ ...prev, enabled: checked }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Dossiers et fichiers sources</Label>
            <div className="flex gap-2">
              <Input
                value={newSource}
                onChange={e => setNewSource(e.target.value)}
                placeholder="C:\Users\Documents"
                onKeyDown={e => e.key === 'Enter' && addSource()}
              />
              <Button onClick={addSource} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {formData.sources.map((source, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm truncate">{source}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => removeSource(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {formData.sources.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune source ajoutée
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Inclure les sous-dossiers</Label>
              <p className="text-xs text-muted-foreground">
                Sauvegarder récursivement
              </p>
            </div>
            <Switch
              checked={formData.includeSubfolders}
              onCheckedChange={checked => setFormData(prev => ({ ...prev, includeSubfolders: checked }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => addDestination('local')}>
              <FolderOpen className="h-4 w-4 mr-1" />
              Local
            </Button>
            <Button variant="outline" size="sm" onClick={() => addDestination('network')}>
              <Server className="h-4 w-4 mr-1" />
              Réseau
            </Button>
            <Button variant="outline" size="sm" onClick={() => addDestination('ftp')}>
              <Globe className="h-4 w-4 mr-1" />
              FTP
            </Button>
          </div>

          <div className="space-y-3">
            {formData.destinations.map(dest => (
              <Card key={dest.id}>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {destIcon(dest.type)}
                      {dest.type === 'local' && 'Dossier local'}
                      {dest.type === 'network' && 'Partage réseau'}
                      {dest.type === 'ftp' && 'Serveur FTP'}
                    </CardTitle>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => removeDestination(dest.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="py-3 px-4 pt-0 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Chemin</Label>
                    <Input
                      value={dest.path}
                      onChange={e => updateDestination(dest.id, { path: e.target.value })}
                      placeholder={
                        dest.type === 'local' ? 'D:\\Backups' :
                        dest.type === 'network' ? '\\\\NAS\\Backups' :
                        '/backup'
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  {dest.type === 'ftp' && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Hôte</Label>
                          <Input
                            value={dest.host || ''}
                            onChange={e => updateDestination(dest.id, { host: e.target.value })}
                            placeholder="192.168.1.100"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Port</Label>
                          <Input
                            type="number"
                            value={dest.port || 21}
                            onChange={e => updateDestination(dest.id, { port: parseInt(e.target.value) })}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Utilisateur</Label>
                          <Input
                            value={dest.username || ''}
                            onChange={e => updateDestination(dest.id, { username: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Mot de passe</Label>
                          <Input
                            type="password"
                            value={dest.password || ''}
                            onChange={e => updateDestination(dest.id, { password: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={dest.passive ?? true}
                          onCheckedChange={checked => updateDestination(dest.id, { passive: checked })}
                        />
                        <Label className="text-xs">Mode passif</Label>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
            {formData.destinations.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune destination configurée
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Fréquence</Label>
            <Select
              value={formData.schedule.frequency}
              onValueChange={(value: ScheduleFrequency) => 
                setFormData(prev => ({ 
                  ...prev, 
                  schedule: { ...prev.schedule, frequency: value } 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manuel</SelectItem>
                <SelectItem value="hourly">Toutes les heures</SelectItem>
                <SelectItem value="daily">Quotidien</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="monthly">Mensuel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.schedule.frequency !== 'manual' && (
            <div className="space-y-2">
              <Label>Heure d'exécution</Label>
              <Input
                type="time"
                value={formData.schedule.time || '02:00'}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, time: e.target.value }
                }))}
              />
            </div>
          )}

          {formData.schedule.frequency === 'weekly' && (
            <div className="space-y-2">
              <Label>Jours de la semaine</Label>
              <div className="flex flex-wrap gap-2">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, index) => (
                  <Badge
                    key={day}
                    variant={formData.schedule.days?.includes(index) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const days = formData.schedule.days || [];
                      const newDays = days.includes(index)
                        ? days.filter(d => d !== index)
                        : [...days, index];
                      setFormData(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, days: newDays }
                      }));
                    }}
                  >
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {formData.schedule.frequency === 'monthly' && (
            <div className="space-y-2">
              <Label>Jour du mois</Label>
              <Select
                value={String(formData.schedule.dayOfMonth || 1)}
                onValueChange={value => setFormData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, dayOfMonth: parseInt(value) }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={String(day)}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </TabsContent>

        <TabsContent value="options" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Compression</Label>
                <p className="text-xs text-muted-foreground">Compresser les fichiers (ZIP)</p>
              </div>
              <Switch
                checked={formData.compression}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, compression: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Chiffrement</Label>
                <p className="text-xs text-muted-foreground">Protéger par mot de passe</p>
              </div>
              <Switch
                checked={formData.encryption}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, encryption: checked }))}
              />
            </div>

            {formData.encryption && (
              <div className="space-y-2 pl-4 border-l-2">
                <Label>Méthode de chiffrement</Label>
                <Select
                  value={formData.encryptionMethod || 'aes256'}
                  onValueChange={(value: 'aes128' | 'aes256') => 
                    setFormData(prev => ({ ...prev, encryptionMethod: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aes128">AES 128-bit</SelectItem>
                    <SelectItem value="aes256">AES 256-bit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Volume Shadow Copy (VSS)</Label>
                <p className="text-xs text-muted-foreground">Copier les fichiers verrouillés</p>
              </div>
              <Switch
                checked={formData.useVSS}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, useVSS: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Vérification CRC</Label>
                <p className="text-xs text-muted-foreground">Vérifier l'intégrité des données</p>
              </div>
              <Switch
                checked={formData.verifyCRC}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, verifyCRC: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Versions horodatées</Label>
                <p className="text-xs text-muted-foreground">Créer un dossier par sauvegarde</p>
              </div>
              <Switch
                checked={formData.createVersionedBackups}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, createVersionedBackups: checked }))}
              />
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <Label>Exclusions</Label>
            <div className="flex gap-2">
              <Input
                value={newExclude}
                onChange={e => setNewExclude(e.target.value)}
                placeholder="*.tmp, *.log"
                onKeyDown={e => e.key === 'Enter' && addExclude()}
              />
              <Button onClick={addExclude} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.excludePatterns.map((pattern, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {pattern}
                  <button
                    onClick={() => removeExclude(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
