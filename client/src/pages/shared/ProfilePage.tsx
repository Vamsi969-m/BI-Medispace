import { useEffect, useState } from 'react';
import { Briefcase, Edit, Loader2, Mail, MapPin, Phone, Save, Shield, Stethoscope, User, X } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { getCurrentUser, updateCurrentUser } from '@/services/authService';
import { Card, PageHeader, StatCard } from '@/components/ui';

type ProfileUser = {
  id: string;
  fullName: string;
  email: string;
  role: 'DOCTOR' | 'REPRESENTATIVE' | 'ADMIN';
  phone?: string;
  specialization?: string;
  avatar?: string;
  organizationId?: string | null;
  isActive?: boolean;
};

const roleLabels: Record<ProfileUser['role'], string> = {
  DOCTOR: 'Doctor / HCP',
  REPRESENTATIVE: 'BI Representative',
  ADMIN: 'Administrator',
};

export function ProfilePage() {
  const { user, token, role, showToast } = useApp();
  const [profile, setProfile] = useState<ProfileUser | null>(user);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialization, setSpecialization] = useState(user?.specialization || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser(token);
        const currentUser = data.user as ProfileUser;
        setProfile(currentUser);
        setName(currentUser.fullName || '');
        setEmail(currentUser.email || '');
        setPhone(currentUser.phone || '');
        setSpecialization(currentUser.specialization || '');
        setAvatar(currentUser.avatar || '');
        localStorage.setItem('bi_user', JSON.stringify(currentUser));
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [token, showToast]);

  const handleSave = async () => {
    if (!token || !profile) return;
    if (!name.trim() || !email.trim()) {
      showToast('Full name and email are required', 'error');
      return;
    }

    try {
      setSaving(true);
      const data = await updateCurrentUser(token, {
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        specialization: specialization.trim(),
        avatar: avatar.trim(),
      });
      const updatedUser = data.user as ProfileUser;
      setProfile(updatedUser);
      localStorage.setItem('bi_user', JSON.stringify(updatedUser));
      setEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    setName(profile.fullName || '');
    setEmail(profile.email || '');
    setPhone(profile.phone || '');
    setSpecialization(profile.specialization || '');
    setAvatar(profile.avatar || '');
    setEditing(false);
  };

  if (loading) {
    return <Card className="flex min-h-[260px] items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading profile...</Card>;
  }

  if (!profile) {
    return <Card className="p-8 text-center text-ink-500">Profile data is unavailable. Please log in again.</Card>;
  }

  const displayRole = roleLabels[profile.role] || role;
  const avatarUrl = profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=0f766e&color=fff`;
  const RoleIcon = profile.role === 'DOCTOR' ? Stethoscope : profile.role === 'REPRESENTATIVE' ? Briefcase : Shield;

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Manage your account information"
        action={editing ? <div className="flex gap-2"><button className="btn-primary" onClick={() => void handleSave()} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button><button className="btn-secondary" onClick={handleCancel} disabled={saving}><X className="h-4 w-4" /> Cancel</button></div> : <button className="btn-secondary" onClick={() => setEditing(true)}><Edit className="h-4 w-4" /> Edit Profile</button>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <Card className="p-5 text-center">
            <img src={avatarUrl} alt={profile.fullName} className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-brand-50" />
            <h2 className="mt-3 text-lg font-bold text-ink-900">{profile.fullName}</h2>
            <p className="text-sm text-ink-500">{profile.specialization || displayRole}</p>
            <span className="mt-2 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{displayRole}</span>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Shield} label="Account" value={profile.isActive === false ? 'Inactive' : 'Active'} color="green" />
            <StatCard icon={RoleIcon} label="Role" value={role.toUpperCase()} color="teal" />
          </div>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <Card className="p-5">
            <h3 className="mb-4 font-semibold text-ink-900">Account Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProfileField label="Full Name" icon={User} editing={editing} value={name} onChange={setName} />
              <ProfileField label="Email" icon={Mail} editing={editing} value={email} onChange={setEmail} type="email" />
              <ProfileField label="Phone" icon={Phone} editing={editing} value={phone} onChange={setPhone} type="tel" />
              <ProfileField label="Specialization" icon={Stethoscope} editing={editing} value={specialization} onChange={setSpecialization} />
              <ProfileField label="Avatar URL" icon={User} editing={editing} value={avatar} onChange={setAvatar} type="url" />
              <div><label className="label">Organization</label><p className="flex items-center gap-2 py-2.5 text-sm text-ink-700"><MapPin className="h-4 w-4 text-ink-400" />{profile.organizationId || 'Not assigned'}</p></div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 font-semibold text-ink-900">Access & Account Status</h3>
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-ink-700"><RoleIcon className="h-4 w-4 text-brand-600" /><span className="text-ink-500">Role:</span> {displayRole}</div>
              <div className="flex items-center gap-2 text-ink-700"><Shield className="h-4 w-4 text-green-600" /><span className="text-ink-500">Status:</span> {profile.isActive === false ? 'Inactive' : 'Active'}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, icon: Icon, editing, value, onChange, type = 'text' }: { label: string; icon: typeof User; editing: boolean; value: string; onChange: (value: string) => void; type?: string }) {
  return <div><label className="label">{label}</label>{editing ? <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="input" /> : <p className="flex items-center gap-2 py-2.5 text-sm text-ink-700"><Icon className="h-4 w-4 text-ink-400" />{value || 'Not provided'}</p>}</div>;
}
