import React, { useState, useEffect } from 'react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  apiBase: string;
  onAuth: (data: { email: string; name?: string }, token: string) => void;
  switchMode: () => void;
}

type SignupStage = 'collect' | 'otp';

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const AuthForm: React.FC<AuthFormProps> = ({ mode, apiBase, onAuth, switchMode }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<SignupStage>('collect');
  const [resetStage, setResetStage] = useState<'none' | 'request' | 'confirm'>('none');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(()=>{
    if (cooldown <= 0) return;
    const id = setInterval(()=> setCooldown(c => c - 1),1000);
    return ()=> clearInterval(id);
  },[cooldown]);

  function resetAll() {
    setStage('collect');
    setOtp('');
    setPassword('');
    setPassword2('');
    setInfo(null);
    setError(null);
  }

  useEffect(()=>{ resetAll(); setResetStage('none'); }, [mode]);

  function validateCollect(): boolean {
    if (!email.trim()) { setError('Email required'); return false; }
    if (!emailRegex.test(email)) { setError('Invalid email'); return false; }
    if (mode === 'signup' && !name.trim()) { setError('Name required'); return false; }
    if (mode === 'signup' && password && password.length < 6) { setError('Password min length 6'); return false; }
    if (mode === 'signup' && password && password !== password2) { setError('Passwords do not match'); return false; }
    return true;
  }

  async function handleSignupCollect(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null);
    if (!validateCollect()) return;
    try {
      setLoading(true);
      let r: Response;
      try {
        r = await fetch(`${apiBase}/auth/request-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) });
      } catch (netErr: any) {
        throw new Error('Network error contacting server');
      }
      let data: any = null;
      try { data = await r.json(); } catch {}
      if (!r.ok) {
        const msg = data?.error || `Failed (${r.status}) requesting OTP`;
        if (data?.retryAfterSeconds) setCooldown(data.retryAfterSeconds);
        throw new Error(msg);
      }
      setStage('otp');
      const rl = data?.rateLimit;
      const attemptsInfo = rl ? ` (Attempt ${rl.attemptsThisWindow}/${rl.maxPerWindow})` : '';
      setInfo(`OTP sent. Check your inbox.${attemptsInfo}`);
      if (rl?.cooldownMs) setCooldown(Math.ceil(rl.cooldownMs/1000)); else setCooldown(30);
    } catch (err: any) {
      setError(err.message || 'Failed requesting OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null);
    if (!otp.trim()) { setError('Enter the OTP'); return; }
    try {
      setLoading(true);
      const body: any = { email: email.trim(), otp: otp.trim(), name: name.trim() || undefined };
      if (password) body.password = password;
      let r: Response;
      try { r = await fetch(`${apiBase}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); } catch { throw new Error('Network error contacting server'); }
      let data: any = null; try { data = await r.json(); } catch {}
      if (!r.ok) {
        const remain = data?.remainingAttempts != null ? ` Remaining attempts: ${data.remainingAttempts}.` : '';
        throw new Error((data?.error || 'Verification failed') + remain);
      }
      onAuth({ email: data.user.email, name: data.user.name }, data.token);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null);
    if (!validateCollect()) return;
    if (!password) { setError('Password required'); return; }
    try {
      setLoading(true);
      const r = await fetch(`${apiBase}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), password }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || 'Login failed');
      onAuth({ email: data.user.email, name: data.user.name }, data.token);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null);
    if (!email.trim() || !emailRegex.test(email)) { setError('Valid email required'); return; }
    try {
      setLoading(true);
      const r = await fetch(`${apiBase}/auth/password/request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) });
      if (!r.ok) throw new Error('Request failed');
      setInfo('If the account exists, a reset token has been sent (mock: check server log).');
      setResetStage('confirm');
    } catch (err: any) {
      setError(err.message || 'Failed to request reset');
    } finally { setLoading(false); }
  }

  async function handleResetConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null);
    if (!resetToken.trim()) { setError('Token required'); return; }
    if (!password || password.length < 6) { setError('Password min length 6'); return; }
    if (password !== password2) { setError('Passwords do not match'); return; }
    try {
      setLoading(true);
      const r = await fetch(`${apiBase}/auth/password/reset`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: resetToken.trim(), password }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || 'Reset failed');
      setInfo('Password updated. You can now log in.');
      setResetStage('none');
      setPassword(''); setPassword2(''); setResetToken('');
    } catch (err: any) {
      setError(err.message || 'Failed to reset');
    } finally { setLoading(false); }
  }

  async function resendOtp() {
    if (cooldown > 0) return;
    setError(null); setInfo(null);
    try {
      setLoading(true);
      let r: Response;
      try { r = await fetch(`${apiBase}/auth/request-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) }); } catch { throw new Error('Network error'); }
      let data: any = null; try { data = await r.json(); } catch {}
      if (!r.ok) {
        if (data?.retryAfterSeconds) setCooldown(data.retryAfterSeconds);
        throw new Error(data?.error || 'Failed to resend OTP');
      }
      const rl = data?.rateLimit;
      const attemptsInfo = rl ? ` (Attempt ${rl.attemptsThisWindow}/${rl.maxPerWindow})` : '';
      setInfo('OTP resent.' + attemptsInfo);
      if (rl?.cooldownMs) setCooldown(Math.ceil(rl.cooldownMs/1000)); else setCooldown(30);
    } catch (err: any) {
      setError(err.message || 'Failed to resend');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'signup' && stage === 'otp') {
    return (
      <form className="auth-form relative overflow-hidden rounded-3xl shadow-xl bg-white/70 backdrop-blur-xl border border-white/60 px-7 py-8 animate-fadeIn" onSubmit={handleVerifyOtp}>
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{background:'radial-gradient(circle at 20% 15%, rgba(0,113,227,.20), transparent 55%),radial-gradient(circle at 85% 80%, rgba(0,113,227,.15), transparent 60%)'}} />
        <div className="relative">
          <h3 className="text-xl font-semibold tracking-tight mb-1 text-gradient-brand">Verify your email</h3>
          <p className="text-[11px] text-soft font-medium mb-5">We sent a 6‑digit code to <span className="font-semibold text-brand-text">{email}</span></p>
          {error && <div className="alert error" role="alert">{error}</div>}
          {info && <div className="mb-3 text-[11px] px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600" role="status">{info}</div>}
          <div className="field mb-4">
            <label className="flex items-center gap-1">OTP <span className="text-[10px] font-normal text-faint">(6 digits)</span></label>
            <input value={otp} onChange={e=> setOtp(e.target.value.replace(/[^0-9]/g,''))} placeholder="123456" inputMode="numeric" autoFocus className="tracking-widest text-center font-mono text-lg py-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100" maxLength={6} />
          </div>
          {password && <p className="text-[11px] text-soft mb-4">On success we’ll store your password securely.</p>}
          <button className="btn-brand w-full h-11 rounded-xl text-sm" disabled={loading} type="submit">{loading ? 'Verifying…' : 'Verify & Continue'}</button>
          <div className="flex items-center justify-between mt-4 text-[11px] font-medium">
            <button type="button" className="text-sky-600 hover:text-sky-700 disabled:opacity-40" onClick={resendOtp} disabled={cooldown>0 || loading}>{cooldown>0 ? `Resend in ${cooldown}s` : 'Resend OTP'}</button>
            <button type="button" className="text-soft hover:text-brand-text" onClick={()=> setStage('collect')}>Edit details</button>
          </div>
          <div className="mt-5 text-center">
            <button type="button" className="text-[11px] text-soft hover:text-brand-text underline" onClick={switchMode}>Have an account? Log in</button>
          </div>
        </div>
      </form>
    );
  }

  if (mode === 'login' && resetStage === 'request') {
    return (
      <form className="auth-form relative overflow-hidden rounded-3xl shadow-xl bg-white/70 backdrop-blur-xl border border-white/60 px-7 py-8 animate-fadeIn" onSubmit={handleResetRequest}>
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{background:'radial-gradient(circle at 70% 20%, rgba(0,113,227,.18), transparent 60%)'}} />
        <div className="relative">
          <h3 className="text-xl font-semibold tracking-tight mb-1">Forgot password?</h3>
          <p className="text-[11px] text-soft font-medium mb-5">Enter your email and we’ll send a reset token.</p>
          {error && <div className="alert error" role="alert">{error}</div>}
          {info && <div className="mb-3 text-[11px] px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600" role="status">{info}</div>}
          <div className="field mb-4">
            <label>Email</label>
            <input type="email" value={email} onChange={e=> setEmail(e.target.value)} placeholder="you@campus.edu" autoComplete="email" className="h-11 rounded-xl border-slate-300" />
          </div>
          <button className="btn-brand w-full h-11 rounded-xl text-sm" disabled={loading} type="submit">{loading ? 'Requesting…' : 'Send Reset Token'}</button>
          <button type="button" className="mt-4 text-[11px] text-soft hover:text-brand-text underline" onClick={()=> { setResetStage('none'); setInfo(null); setError(null); }}>Back to login</button>
        </div>
      </form>
    );
  }

  if (mode === 'login' && resetStage === 'confirm') {
    return (
      <form className="auth-form relative overflow-hidden rounded-3xl shadow-xl bg-white/70 backdrop-blur-xl border border-white/60 px-7 py-8 animate-fadeIn" onSubmit={handleResetConfirm}>
        <div className="absolute inset-0 pointer-events-none opacity-35" style={{background:'radial-gradient(circle at 30% 80%, rgba(0,113,227,.16), transparent 60%)'}} />
        <div className="relative">
          <h3 className="text-xl font-semibold tracking-tight mb-1">Set a new password</h3>
          <p className="text-[11px] text-soft font-medium mb-5">Use the reset token we sent you.</p>
          {error && <div className="alert error" role="alert">{error}</div>}
          {info && <div className="mb-3 text-[11px] px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600" role="status">{info}</div>}
          <div className="field">
            <label>Reset Token</label>
            <input value={resetToken} onChange={e=> setResetToken(e.target.value)} placeholder="token" autoComplete="one-time-code" className="h-11 rounded-xl border-slate-300" />
          </div>
          <div className="field">
            <label>New Password</label>
            <input type="password" value={password} onChange={e=> setPassword(e.target.value)} placeholder="••••••" autoComplete="new-password" className="h-11 rounded-xl border-slate-300" />
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <input type="password" value={password2} onChange={e=> setPassword2(e.target.value)} placeholder="Repeat password" autoComplete="new-password" className="h-11 rounded-xl border-slate-300" />
          </div>
          <button className="btn-brand w-full h-11 rounded-xl text-sm" disabled={loading} type="submit">{loading ? 'Updating…' : 'Update Password'}</button>
          <div className="flex gap-4 mt-4 text-[11px]">
            <button type="button" className="text-brand hover:text-brand-dark" onClick={()=> { setResetStage('request'); setInfo(null); setError(null); }}>Back</button>
            <button type="button" className="text-soft hover:text-brand-text" onClick={()=> { setResetStage('none'); setInfo(null); setError(null); }}>Cancel</button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form className="auth-form relative overflow-hidden rounded-3xl shadow-xl bg-white/70 backdrop-blur-xl border border-white/60 px-7 py-8 animate-fadeIn" onSubmit={mode==='login'?handleLogin:handleSignupCollect}>
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{background:'radial-gradient(circle at 15% 25%, rgba(0,113,227,.20), transparent 55%),radial-gradient(circle at 85% 75%, rgba(0,113,227,.12), transparent 60%)'}} />
      <div className="relative">
  <h3 className="text-2xl font-semibold tracking-tight mb-1 text-gradient-brand">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h3>
  <p className="text-[11px] text-soft font-medium mb-5">{mode==='login' ? 'Use your campus credentials to continue.' : 'Use your campus email. We’ll email you a one‑time code.'}</p>
        {error && <div className="alert error" role="alert">{error}</div>}
        {!error && !info && apiBase && (
          <div className="mb-3 text-[10px] text-faint" aria-hidden>
            Using API: {apiBase}
          </div>
        )}
        {info && <div className="mb-3 text-[11px] px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600" role="status">{info}</div>}
      {mode === 'signup' && (
        <div className="field mb-3">
          <label>Name</label>
          <input type="text" value={name} onChange={e=> setName(e.target.value)} placeholder="Your name" autoComplete="name" className="h-11 rounded-xl border-slate-300" />
        </div>
      )}
      <div className="field">
        <label>Email</label>
        <input type="email" value={email} onChange={e=> setEmail(e.target.value)} placeholder="you@campus.edu" autoComplete="email" className="h-11 rounded-xl border-slate-300" />
      </div>
      <div className="field">
        <label>{mode==='login' ? 'Password' : 'Password (optional)'}</label>
        <input type="password" value={password} onChange={e=> setPassword(e.target.value)} placeholder={mode==='login'?'••••••':'Set a password now or later'} autoComplete={mode==='login'?'current-password':'new-password'} className="h-11 rounded-xl border-slate-300" />
      </div>
      {mode==='signup' && password && (
        <div className="field">
          <label>Confirm Password</label>
          <input type="password" value={password2} onChange={e=> setPassword2(e.target.value)} placeholder="Repeat password" autoComplete="new-password" className="h-11 rounded-xl border-slate-300" />
        </div>
      )}
  <button className="btn-brand w-full mt-1 h-11 rounded-xl text-sm disabled:opacity-60" disabled={loading} type="submit">{loading ? 'Please wait…' : (mode === 'login' ? 'Log In' : 'Request OTP')}</button>
        <div className="flex flex-col gap-2 mt-5 text-[11px] font-medium">
          <button type="button" className="text-brand hover:text-brand-dark text-left" onClick={switchMode}>{mode === 'login' ? 'Need an account? Create one' : 'Have an account? Log in'}</button>
          {mode==='login' && resetStage==='none' && (
            <button type="button" className="text-soft hover:text-brand-text text-left" onClick={()=> { setResetStage('request'); setInfo(null); setError(null); }}>Forgot password?</button>
          )}
        </div>
      </div>
    </form>
  );
};
