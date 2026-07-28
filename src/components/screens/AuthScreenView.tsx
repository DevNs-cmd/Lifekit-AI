import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowLeft, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthScreenViewProps {
  onLoginSuccess: () => void;
  initialMode?: 'login' | 'signup' | 'forgot-password';
}

export const AuthScreenView: React.FC<AuthScreenViewProps> = ({
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(initialMode);

  // Form State
  const [email, setEmail] = useState('aditya.k@lifekit.ai');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Aditya Kumar');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot-password') {
      setResetSent(true);
      return;
    }
    // Simulate login / signup
    onLoginSuccess();
  };

  return (
    <div className="p-5 min-h-full flex flex-col justify-between text-slate-900 select-none bg-slate-50">
      <div>
        {/* Brand Header */}
        <div className="text-center mt-2 mb-8">
          <div className="inline-flex p-3 bg-violet-100 rounded-2xl border border-violet-200 mb-3 shadow-md shadow-violet-100">
            <Sparkles className="w-6 h-6 text-[#7C3AED]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">LifeKit</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">AI Execution Marketplace for Human Goals</p>
        </div>

        {/* Auth Navigation Tabs */}
        <div className="bg-slate-200/70 p-1 rounded-xl border border-slate-200 flex mb-6 text-xs font-bold">
          <button
            onClick={() => {
              setMode('login');
              setResetSent(false);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'login' ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setResetSent(false);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'signup' ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Mode Title */}
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Get Started Free'}
            {mode === 'forgot-password' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login' && 'Enter your credentials to access your active missions'}
            {mode === 'signup' && 'Deconstruct your goals into AI-driven tactical checklists'}
            {mode === 'forgot-password' && 'We will send secure instructions to recover access'}
          </p>
        </div>

        {/* FORGOT PASSWORD FORM / CONFIRMATION */}
        {mode === 'forgot-password' ? (
          resetSent ? (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-sm text-slate-900">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instructions have been sent to <span className="text-slate-900 font-semibold">{email}</span>. Check your inbox to set a new password.
              </p>
              <button
                onClick={() => {
                  setMode('login');
                  setResetSent(false);
                }}
                className="w-full mt-2 bg-[#7C3AED] hover:bg-[#4C0FBD] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7C3AED] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aditya.k@lifekit.ai"
                    className="w-full bg-white border border-slate-200 focus:border-[#7C3AED] text-slate-900 text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#7C3AED] hover:bg-[#4C0FBD] text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all mt-2"
              >
                Send Recovery Instructions
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-900 py-2 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            </form>
          )
        ) : (
          /* LOGIN OR SIGNUP FORM */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#7C3AED] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aditya Kumar"
                    className="w-full bg-white border border-slate-200 focus:border-[#7C3AED] text-slate-900 text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7C3AED] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aditya.k@lifekit.ai"
                  className="w-full bg-white border border-slate-200 focus:border-[#7C3AED] text-slate-900 text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-500">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-[11px] font-bold text-[#7C3AED] hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7C3AED] absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 focus:border-[#7C3AED] text-slate-900 text-xs rounded-xl pl-10 pr-10 py-3 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="accent-[#7C3AED] mt-0.5 rounded cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-500 leading-tight cursor-pointer">
                  I agree to the LifeKit AI Terms of Service and Execution Privacy Policy.
                </label>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#7C3AED] hover:bg-[#4C0FBD] text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all mt-4"
            >
              <span>{mode === 'login' ? 'Sign In to LifeKit' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Footer Demo Quick Sign In */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-center">
        <button
          onClick={onLoginSuccess}
          className="text-[11px] text-slate-500 hover:text-[#7C3AED] font-semibold underline underline-offset-4"
        >
          Skip Authentication (Bypass to Goal Dashboard)
        </button>
      </div>
    </div>
  );
};
