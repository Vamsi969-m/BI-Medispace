import { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Phone,
  Stethoscope,
  UserPlus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { registerUser } from '@/services/authService';

interface RegisterProps {
  onRegister?: (user: unknown) => void;
  onLogin?: () => void;
}

export function Register({
  onRegister,
  onLogin,
}: RegisterProps) {

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const data = await registerUser({
        fullName,
        email,
        password,
        phone,
        specialization,
      });

      // Save JWT
      localStorage.setItem('bi_token', data.token);

      // Save user
      localStorage.setItem(
        'bi_user',
        JSON.stringify(data.user)
      );

      onRegister?.(data.user);

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 text-white mb-4">
            <UserPlus className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold text-ink-900">
            Create Doctor Account
          </h1>

          <p className="text-sm text-ink-500 mt-2">
            Register to access the BI healthcare platform
          </p>

        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-6">

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="label">
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. John Smith"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@example.com"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="label">
                Phone Number
              </label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label className="label">
                Medical Specialization
              </label>

              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />

                <input
                  type="text"
                  value={specialization}
                  onChange={(e) =>
                    setSpecialization(e.target.value)
                  }
                  placeholder="Cardiology"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="input pl-10 pr-10"
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 mt-2"
            >
              <UserPlus className="w-4 h-4" />

              {loading
                ? 'Creating Account...'
                : 'Create Account'}
            </button>

          </form>

          {/* Login */}
          <div className="text-center mt-6 pt-5 border-t border-ink-100">

            <p className="text-sm text-ink-500">
              Already have an account?
            </p>

            <button
              onClick={onLogin}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 mt-1"
            >
              Sign In
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}