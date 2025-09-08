'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import './settings.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useStudyData } from '@/hooks/useStudyData';
import { useSettings } from '@/contexts/SettingsContext'; // <-- pakai context
import {
  Trash2,
  Download,
  Upload,
  Target,
  Bell,
  Volume2,
  VolumeX,
  Timer,
  Save,
  FileText
} from 'lucide-react';
import { useState } from 'react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getAllSessions } = useStudyData();
  const { settings, saveSettings, resetSettings } = useSettings(); // <-- ambil dari context

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
      onOpenChange(false);
    }, 500);
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    saveSettings({ [key]: value });
  };

  const exportData = async () => {
    try {
      const sessions = await getAllSessions();
      const dataToExport = {
        sessions,
        settings,
        exportDate: new Date().toISOString(),
        user: user?.email
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Your study data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.settings) {
          saveSettings(data.settings);
        }

        toast({
          title: "Import Successful",
          description: "Your settings have been imported successfully.",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid file format. Please check your file and try again.",
          variant: "destructive",
        });
      }
    };

    input.click();
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default? This cannot be undone.')) {
      resetSettings();
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to default values.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-800/95 border-slate-700/50 text-white backdrop-blur-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-medium">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Study Goals */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-blue-400" />
              <h3 className="font-medium">Study Goals</h3>
            </div>

            <div className="space-y-4 pl-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-slate-300">Daily Goal (min)</Label>
                  <Input
                    type="number"
                    value={settings.dailyGoal}
                    onChange={(e) => updateSetting('dailyGoal', Number(e.target.value))}
                    className="bg-slate-700/50 border-slate-600 text-white h-8 mt-1"
                    min="15"
                    max="720"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-300">Weekly Goal (min)</Label>
                  <Input
                    type="number"
                    value={settings.weeklyGoal}
                    onChange={(e) => updateSetting('weeklyGoal', Number(e.target.value))}
                    className="bg-slate-700/50 border-slate-600 text-white h-8 mt-1"
                    min="60"
                    max="5040"
                  />
                </div>
              </div>
            </div>
          </section>

          <Separator className="bg-slate-600/50" />

          {/* Pomodoro Settings */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Timer className="h-4 w-4 text-red-400" />
              <h3 className="font-medium">Pomodoro Timer</h3>
            </div>

            <div className="space-y-4 pl-6">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm text-slate-300">Focus (min)</Label>
                  <Input
                    type="number"
                    value={settings.pomodoroLength}
                    onChange={(e) => updateSetting('pomodoroLength', Number(e.target.value))}
                    className="bg-slate-700/50 border-slate-600 text-white h-8 mt-1"
                    min="15"
                    max="60"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-300">Short Break</Label>
                  <Input
                    type="number"
                    value={settings.shortBreak}
                    onChange={(e) => updateSetting('shortBreak', Number(e.target.value))}
                    className="bg-slate-700/50 border-slate-600 text-white h-8 mt-1"
                    min="3"
                    max="15"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-300">Long Break</Label>
                  <Input
                    type="number"
                    value={settings.longBreak}
                    onChange={(e) => updateSetting('longBreak', Number(e.target.value))}
                    className="bg-slate-700/50 border-slate-600 text-white h-8 mt-1"
                    min="15"
                    max="30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-slate-300">Auto-start breaks</Label>
                <Switch
                  checked={settings.autoBreaks}
                  onCheckedChange={(checked) => updateSetting('autoBreaks', checked)}
                />
              </div>
            </div>
          </section>

          <Separator className="bg-slate-600/50" />

          {/* Notifications & Audio */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4 text-yellow-400" />
              <h3 className="font-medium">Notifications & Audio</h3>
            </div>

            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-3 w-3 text-slate-400" />
                  <Label className="text-sm text-slate-300">Desktop notifications</Label>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSetting('notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.sounds ? <Volume2 className="h-3 w-3 text-slate-400" /> : <VolumeX className="h-3 w-3 text-slate-400" />}
                  <Label className="text-sm text-slate-300">Sound alerts</Label>
                </div>
                <Switch
                  checked={settings.sounds}
                  onCheckedChange={(checked) => updateSetting('sounds', checked)}
                />
              </div>
            </div>
          </section>

          <Separator className="bg-slate-600/50" />

          {/* Data Management */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-green-400" />
              <h3 className="font-medium">Data Management</h3>
            </div>

            <div className="space-y-3 pl-6">
              <div className="flex gap-2">
                <Button
                  onClick={exportData}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50 h-8"
                >
                  <Download className="h-3 w-3 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={importData}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50 h-8"
                >
                  <Upload className="h-3 w-3 mr-2" />
                  Import
                </Button>
              </div>

              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="w-full bg-red-900/20 border-red-800/50 text-red-300 hover:bg-red-900/30 h-8"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Reset to Default
              </Button>
            </div>
          </section>

          <Separator className="bg-slate-600/50" />

          {/* Account Info */}
          <section>
            <div className="pl-6 space-y-2 text-sm text-slate-400">
              <div>Email: {user?.email}</div>
              <div>
                Joined: {user?.metadata?.creationTime ? 
                  new Date(user.metadata.creationTime).toLocaleDateString() : 
                  'Unknown'
                }
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-600/50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3 w-3 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
