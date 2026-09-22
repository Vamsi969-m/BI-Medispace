import { useState } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '@/services/authService';

interface LoginProps {
  onLogin?: (user: unknown) => void;
  onRegister?: () => void;
}

export function Login({ onLogin, onRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      // Save JWT token
      localStorage.setItem('bi_token', data.token);

      // Save user information
      localStorage.setItem('bi_user', JSON.stringify(data.user));

      onLogin?.(data.user);

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 text-white mb-4">
            <LogIn className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold text-ink-900">
            Welcome Back
          </h1>

          <p className="text-sm text-ink-500 mt-2">
            Sign in to your BI account
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-6">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

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
                  placeholder="Enter your password"
                  className="input pl-10 pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              <LogIn className="w-4 h-4" />

              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          {/* Register */}
          <div className="text-center mt-6 pt-5 border-t border-ink-100">
            <p className="text-sm text-ink-500">
              Don't have an account?
            </p>

            <button
              onClick={onRegister}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 mt-1"
            >
              Create a Doctor Account
            </button>
          </div>

        </div>

        <p className="text-center text-xs text-ink-400 mt-6">
          BI Healthcare Platform
        </p>

      </div>
    </div>
  );
}