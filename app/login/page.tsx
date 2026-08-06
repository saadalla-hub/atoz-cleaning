'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const [loading, setLoading] = useState(false);
const [forgotPassword, setForgotPassword] = useState(false);
const [resetPassword, setResetPassword] = useState(false);

const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

const [message, setMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');

useEffect(() => {
  const handleRecovery = async () => {
    const hash = window.location.hash;

    if (hash.includes('type=recovery')) {
      setResetPassword(true);
      setForgotPassword(false);
      setMessage('');
      setErrorMessage('');
    }
  };

  handleRecovery();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      setResetPassword(true);
      setForgotPassword(false);
      setMessage('');
      setErrorMessage('');
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

async function handleLogin(e: React.FormEvent) {
e.preventDefault();


setLoading(true);
setMessage('');
setErrorMessage('');

const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  setErrorMessage(error.message);
  setLoading(false);
  return;
}

router.push('/dashboard');


}

async function handleForgotPassword(e: React.FormEvent) {
e.preventDefault();


setLoading(true);
setMessage('');
setErrorMessage('');

const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});

if (error) {
  setErrorMessage(error.message);
  setLoading(false);
  return;
}

setMessage(
  'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.'
);

setLoading(false);

}

async function handleUpdatePassword(e: React.FormEvent) {
e.preventDefault();

setMessage('');
setErrorMessage('');

if (newPassword.length < 6) {
  setErrorMessage(
    'يجب أن تكون كلمة المرور 6 أحرف على الأقل.'
  );
  return;
}

if (newPassword !== confirmPassword) {
  setErrorMessage(
    'كلمتا المرور غير متطابقتين.'
  );
  return;
}

setLoading(true);

const { error } = await supabase.auth.updateUser({
  password: newPassword,
});

if (error) {
  setErrorMessage(error.message);
  setLoading(false);
  return;
}

setMessage('تم تغيير كلمة المرور بنجاح.');

setNewPassword('');
setConfirmPassword('');
setLoading(false);

setTimeout(() => {
  setResetPassword(false);
  setMessage('');
  setErrorMessage('');

  window.history.replaceState(
    {},
    document.title,
    '/login'
  );
}, 2500);


}

// =========================================
// RESET PASSWORD
// =========================================

if (resetPassword) {
return ( <main className="min-h-screen flex items-center justify-center bg-[#143640] p-5"> <form
       onSubmit={handleUpdatePassword}
       className="bg-white border-t-4 border-[#E7B548] shadow-xl rounded-xl p-8 w-full max-w-md"
     > <h1 className="text-3xl font-bold mb-3 text-center text-[#143640]">
Reset Password </h1>

```
      <p className="text-center text-gray-500 mb-6">
        Enter your new password below.
      </p>

      {message && (
        <div className="mb-4 rounded-lg bg-green-100 text-green-700 p-3 text-sm text-center font-medium">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-100 text-red-700 p-3 text-sm text-center">
          {errorMessage}
        </div>
      )}

      <input
        className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#E7B548]"
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <input
        className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded-lg mb-5 focus:outline-none focus:ring-2 focus:ring-[#E7B548]"
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E7B548] text-[#143640] font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  </main>
);


}

// =========================================
// FORGOT PASSWORD
// =========================================

if (forgotPassword) {
return ( <main className="min-h-screen flex items-center justify-center bg-[#143640] p-5"> <form
       onSubmit={handleForgotPassword}
       className="bg-white border-t-4 border-[#E7B548] shadow-xl rounded-xl p-8 w-full max-w-md"
     > <h1 className="text-3xl font-bold mb-3 text-center text-[#143640]">
Forgot Password? </h1>

```
      <p className="text-center text-gray-500 mb-6">
        Enter your email address and we will send you a password reset link.
      </p>

      {message && (
        <div className="mb-4 rounded-lg bg-green-100 text-green-700 p-3 text-sm text-center font-medium">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-100 text-red-700 p-3 text-sm text-center">
          {errorMessage}
        </div>
      )}

      <input
        className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded-lg mb-5 focus:outline-none focus:ring-2 focus:ring-[#E7B548]"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E7B548] text-[#143640] font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <button
        type="button"
        onClick={() => {
          setForgotPassword(false);
          setMessage('');
          setErrorMessage('');
        }}
        className="w-full mt-3 text-[#143640] font-semibold hover:underline"
      >
        Back to Login
      </button>
    </form>
  </main>
);


}

// =========================================
// LOGIN
// =========================================

return ( <main className="min-h-screen flex items-center justify-center bg-[#143640] p-5"> <form
     onSubmit={handleLogin}
     className="bg-white border-t-4 border-[#E7B548] shadow-xl rounded-xl p-8 w-full max-w-md"
   > <h1 className="text-3xl font-bold mb-6 text-center text-[#143640]">
Welcome Back </h1>

```
    {message && (
      <div className="mb-4 rounded-lg bg-green-100 text-green-700 p-3 text-sm text-center font-medium">
        {message}
      </div>
    )}

    {errorMessage && (
      <div className="mb-4 rounded-lg bg-red-100 text-red-700 p-3 text-sm text-center">
        {errorMessage}
      </div>
    )}

    <input
      className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#E7B548]"
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />

    <input
      className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-[#E7B548]"
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    <div className="text-right mb-5">
      <button
        type="button"
        onClick={() => {
          setForgotPassword(true);
          setMessage('');
          setErrorMessage('');
        }}
        className="text-sm text-[#143640] font-semibold hover:text-[#E7B548] transition"
      >
        Forgot Password?
      </button>
    </div>

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-[#E7B548] text-[#143640] font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
    >
      {loading ? 'Logging in...' : 'Login'}
    </button>

    <p className="text-center mt-5 text-gray-600">
      Don't have an account?

      <a
        href="/register"
        className="ml-2 text-[#143640] font-bold"
      >
        Register
      </a>
    </p>
  </form>
</main>

);
}
