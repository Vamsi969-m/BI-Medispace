import { useState } from 'react';
import { Bell, Shield, Palette, Globe, Save } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, PageHeader } from '@/components/ui';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const { showToast } = useApp();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [autoUpdates, setAutoUpdates] = useState(true);

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={cn('relative w-11 h-6 rounded-full transition-colors', enabled ? 'bg-brand-600' : 'bg-ink-200')}
    >
      <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', enabled && 'translate-x-5')} />
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences"
        action={<button onClick={() => showToast('Settings saved successfully')} className="btn-primary"><Save className="w-4 h-4" /> Save Changes</button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-ink-900">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-800">Email Notifications</p>
                <p className="text-xs text-ink-500">Receive updates via email</p>
              </div>
              <Toggle enabled={notifEmail} onChange={() => setNotifEmail(!notifEmail)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-800">Push Notifications</p>
                <p className="text-xs text-ink-500">Browser push alerts</p>
              </div>
              <Toggle enabled={notifPush} onChange={() => setNotifPush(!notifPush)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-800">SMS Notifications</p>
                <p className="text-xs text-ink-500">Text message alerts</p>
              </div>
              <Toggle enabled={notifSms} onChange={() => setNotifSms(!notifSms)} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-ink-900">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-800">Two-Factor Authentication</p>
                <p className="text-xs text-ink-500">Extra security layer</p>
              </div>
              <Toggle enabled={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-800">Auto Security Updates</p>
                <p className="text-xs text-ink-500">Automatic security patches</p>
              </div>
              <Toggle enabled={autoUpdates} onChange={() => setAutoUpdates(!autoUpdates)} />
            </div>
            <button onClick={() => showToast('Password change link sent to email', 'info')} className="w-full btn-secondary mt-2">
              Change Password
            </button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-ink-900">Display Preferences</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Theme</label>
              <select className="input cursor-pointer" defaultValue="light">
                <option value="light">Light (Default)</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
            <div>
              <label className="label">Language</label>
              <select className="input cursor-pointer" defaultValue="en">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-ink-900">Regional Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Time Zone</label>
              <select className="input cursor-pointer" defaultValue="pst">
                <option value="pst">Pacific (PST)</option>
                <option value="mst">Mountain (MST)</option>
                <option value="cst">Central (CST)</option>
                <option value="est">Eastern (EST)</option>
              </select>
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input cursor-pointer" defaultValue="inr">
                <option value="inr">INR (₹)</option>
                <option value="eur">EUR (€)</option>
                <option value="gbp">GBP (£)</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
