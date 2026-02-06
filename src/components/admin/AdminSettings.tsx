import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings, Save, RefreshCw } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface PlatformSettings {
  zero_fee_period_active: boolean;
  zero_fee_end_date: string | null;
  private_holder_limit: number;
  verified_dealer_limit: number;
  private_holder_commission: number;
  verified_dealer_commission: number;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  zero_fee_period_active: true,
  zero_fee_end_date: null,
  private_holder_limit: 3,
  verified_dealer_limit: 25,
  private_holder_commission: 3.5,
  verified_dealer_commission: 2.5,
};

export function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', [
          'zero_fee_period_active',
          'zero_fee_end_date',
          'private_holder_limit',
          'verified_dealer_limit',
          'private_holder_commission',
          'verified_dealer_commission',
        ]);

      if (error) throw error;

      if (data && data.length > 0) {
        const settingsObj = { ...DEFAULT_SETTINGS };
        data.forEach((row) => {
          const key = row.key as keyof PlatformSettings;
          if (key in settingsObj) {
            (settingsObj as Record<string, unknown>)[key] = row.value;
          }
        });
        setSettings(settingsObj);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Settings table might be empty, use defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSetting = async (key: string, value: Json) => {
    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('admin_settings')
          .update({ value })
          .eq('key', key);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('admin_settings')
          .insert([{ key, value }]);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
      throw error;
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting('zero_fee_period_active', settings.zero_fee_period_active),
        saveSetting('zero_fee_end_date', settings.zero_fee_end_date),
        saveSetting('private_holder_limit', settings.private_holder_limit),
        saveSetting('verified_dealer_limit', settings.verified_dealer_limit),
        saveSetting('private_holder_commission', settings.private_holder_commission),
        saveSetting('verified_dealer_commission', settings.verified_dealer_commission),
      ]);

      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="font-serif text-xl font-medium">Platform Settings</h2>
      </div>

      {/* Zero-Fee Period */}
      <div className="border border-border p-6 space-y-6">
        <div>
          <h3 className="font-medium mb-1">90-Day Zero-Fee Launch Period</h3>
          <p className="text-sm text-muted-foreground">
            When active, all sellers are exempt from commission fees
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="zero-fee-toggle">Zero-Fee Period Active</Label>
          <Switch
            id="zero-fee-toggle"
            checked={settings.zero_fee_period_active}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, zero_fee_period_active: checked })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zero-fee-end-date">End Date (Optional)</Label>
          <Input
            id="zero-fee-end-date"
            type="date"
            value={settings.zero_fee_end_date || ''}
            onChange={(e) =>
              setSettings({ ...settings, zero_fee_end_date: e.target.value || null })
            }
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for indefinite period
          </p>
        </div>
      </div>

      {/* Listing Limits */}
      <div className="border border-border p-6 space-y-6">
        <div>
          <h3 className="font-medium mb-1">Listing Limits</h3>
          <p className="text-sm text-muted-foreground">
            Maximum active listings per seller tier
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="private-holder-limit">Private Holder Limit</Label>
            <Input
              id="private-holder-limit"
              type="number"
              min={1}
              max={100}
              value={settings.private_holder_limit}
              onChange={(e) =>
                setSettings({ ...settings, private_holder_limit: parseInt(e.target.value) || 3 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="verified-dealer-limit">Verified Dealer Limit</Label>
            <Input
              id="verified-dealer-limit"
              type="number"
              min={1}
              max={1000}
              value={settings.verified_dealer_limit}
              onChange={(e) =>
                setSettings({ ...settings, verified_dealer_limit: parseInt(e.target.value) || 25 })
              }
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Certified Exchange Partners have unlimited listings
        </p>
      </div>

      {/* Commission Rates */}
      <div className="border border-border p-6 space-y-6">
        <div>
          <h3 className="font-medium mb-1">Commission Rates</h3>
          <p className="text-sm text-muted-foreground">
            Percentage deducted from completed sales (when zero-fee period is inactive)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="private-holder-commission">Private Holder (%)</Label>
            <Input
              id="private-holder-commission"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={settings.private_holder_commission}
              onChange={(e) =>
                setSettings({ ...settings, private_holder_commission: parseFloat(e.target.value) || 3.5 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="verified-dealer-commission">Verified Dealer (%)</Label>
            <Input
              id="verified-dealer-commission"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={settings.verified_dealer_commission}
              onChange={(e) =>
                setSettings({ ...settings, verified_dealer_commission: parseFloat(e.target.value) || 2.5 })
              }
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Certified Exchange Partners pay 0% commission
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings} 
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/80"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
