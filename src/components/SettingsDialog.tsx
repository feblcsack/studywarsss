'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Download, Upload } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dailyGoal, setDailyGoal] = useState(60); // in minutes

  const exportData = () => {
    // Logic untuk export data
    toast({
      title: "Export Started",
      description: "Your study data is being exported...",
    });
    console.log('Exporting data...');
  };

  const importData = () => {
    // Logic untuk import data
    toast({
      title: "Import",
      description: "Please select a file to import your study data.",
    });
    console.log('Importing data...');
  };

  const deleteAllData = () => {
    // Logic untuk delete semua data
    if (confirm('Are you sure you want to delete all your study data? This action cannot be undone.')) {
      toast({
        title: "Data Deleted",
        description: "All your study data has been deleted.",
        variant: "destructive",
      });
      console.log('Deleting all data...');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preferences" className="space-y-4">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg">Study Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="daily-goal">Daily Study Goal (minutes)</Label>
                  <Input
                    id="daily-goal"
                    type="number"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(Number(e.target.value))}
                    className="bg-slate-600 border-slate-500 text-white mt-2"
                    min="1"
                    max="1440"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg">Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    onClick={exportData}
                    variant="outline"
                    className="flex-1 border-slate-500 text-white hover:bg-slate-600"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button
                    onClick={importData}
                    variant="outline"
                    className="flex-1 border-slate-500 text-white hover:bg-slate-600"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>
                
                <div className="pt-4 border-t border-slate-600">
                  <h4 className="text-red-400 font-semibold mb-2">Danger Zone</h4>
                  <Button
                    onClick={deleteAllData}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Study Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-4">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-slate-600 border-slate-500 text-slate-300 mt-2"
                  />
                </div>
                <div>
                  <Label>Account Created</Label>
                  <Input
                    value={user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                    disabled
                    className="bg-slate-600 border-slate-500 text-slate-300 mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}