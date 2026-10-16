import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, LogOut, Eye, EyeOff, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';

export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'admin' | 'student'>('admin');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if someone is already logged in from localStorage
  const existingSession = localStorage.getItem('miles_auth_user');
  const [session, setSession] = useState<{ email: string; role: string } | null>(
    existingSession ? JSON.parse(existingSession) : null
  );

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (isSignUp) {
      // Simulate Register
      setSuccessMessage('Account created successfully! You can now log in.');
      setIsSignUp(false);
      setPassword('');
    } else {
      // Simulate Login
      const userData = { email: email.trim(), role };
      localStorage.setItem('miles_auth_user', JSON.stringify(userData));
      setSession(userData);
      setEmail('');
      setPassword('');
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setSuccessMessage(`Password reset link sent to ${email}. Check your inbox!`);
    setIsForgotPassword(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('miles_auth_user');
    setSession(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-950/50 border-b border-slate-800">
          <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" /> 05. Auth & RBAC Gateway
          </h2>
          <span className="text-xs text-indigo-300 font-mono bg-indigo-950/40 px-3 py-1 rounded-lg border border-indigo-900/50">
            Secure Session
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {session ? (
            /* Logged In Success View */
            <div className="py-6 flex flex-col items-center text-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-4 text-emerald-400 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Access Granted!</h3>
              <p className="text-xs text-slate-400 mb-6">You are authenticated across miles-lab</p>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 w-full mb-6 text-left space-y-2 shadow-inner font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>User Account:</span>
                  <span className="text-white">{session.email}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Assigned Role:</span>
                  <span className="text-indigo-400 uppercase font-bold">{session.role}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Terminate Session (Logout)
              </button>
            </div>
          ) : isForgotPassword ? (
            /* Forgot Password View */
            <form onSubmit={handlePasswordReset} className="space-y-4 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white mb-1">Reset Your Password</h3>
                <p className="text-xs text-slate-400">Enter your email and we'll send you recovery instructions</p>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-center gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 text-xs uppercase tracking-wider cursor-pointer mt-2"
              >
                Send Reset Link <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => { setIsForgotPassword(false); setError(''); }}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 cursor-pointer"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            /* Login / Register Form View */
            <form onSubmit={handleAuth} className="space-y-4 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white mb-1">
                  {isSignUp ? 'Create an Account' : 'Sign In to Dashboard'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isSignUp ? 'Register to get started with miles-lab' : 'Select your role to access management panels'}
                </p>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-center gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-center gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Role Selector */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Access Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['admin', 'teacher', 'student'] as const).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`py-2 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer border ${
                        role === r
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMessage(''); }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 text-xs uppercase tracking-wider cursor-pointer mt-2"
              >
                {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {isSignUp ? 'Create Account' : 'Authenticate & Login'}
              </button>

              {/* Switch between Sign In and Sign Up */}
              <div className="pt-2 text-center text-xs text-slate-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccessMessage(''); }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline ml-1"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950/30 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-500">
          <span>JWT & LocalStorage Session</span>
          <span className="font-mono">RBAC Gateway</span>
        </div>

      </div>
    </div>
  );
}