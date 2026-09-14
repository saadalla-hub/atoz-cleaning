'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
const router = useRouter();

const [isArabic, setIsArabic] = useState(false);

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
  const savedLanguage = localStorage.getItem('language');
  setIsArabic(savedLanguage === 'ar');
}, []);

function toggleLanguage() {
  const nextLanguage = isArabic ? 'en' : 'ar';
  localStorage.setItem('language', nextLanguage);
  setIsArabic(nextLanguage === 'ar');
}

const t = isArabic
  ? {
      welcomeBack: 'مرحباً بعودتك',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      forgotPassword: 'Forgot Password?',
      login: 'تسجيل الدخول',
      loggingIn: 'جارٍ تسجيل الدخول...',
      noAccount: "Don't have an account?",
      register: 'إنشاء حساب',

      resetPassword: 'إعادة تعيين كلمة المرور',
      newPassword: 'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور الجديدة',
      updatePassword: 'تحديث كلمة المرور',
      updating: 'جارٍ التحديث...',
      enterNewPassword: 'أدخل كلمة المرور الجديدة أدناه.',

      forgotTitle: 'نسيت كلمة المرور؟',
      forgotDescription:
        'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.',
      sendResetLink: 'إرسال رابط إعادة التعيين',
      sending: 'جارٍ الإرسال...',
      backToLogin: 'العودة إلى تسجيل الدخول',

      resetSent:
        'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
      passwordMinimum:
        'يجب أن تكون كلمة المرور 6 أحرف على الأقل.',
      passwordMismatch:
        'كلمتا المرور غير متطابقتين.',
      passwordUpdated:
        'تم تغيير كلمة المرور بنجاح.',
    }
  : {
      welcomeBack: 'Welcome Back',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      login: 'Login',
      loggingIn: 'Logging in...',
      noAccount: "Don't have an account?",
      register: 'Register',

      resetPassword: 'Reset Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      updatePassword: 'Update Password',
      updating: 'Updating...',
      enterNewPassword:
        '{t.enterNewPassword}',

      forgotTitle: 'نسيت كلمة المرور؟',
      forgotDescription:
        '{t.forgotDescription}',
      sendResetLink: 'Send Reset Link',
      sending: 'Sending...',
      backToLogin: 'Back to Login',

      resetSent:
        'A password reset link has been sent to your email.',
      passwordMinimum:
        'Password must be at least 6 characters.',
      passwordMismatch:
        'Passwords do not match.',
      passwordUpdated:
        'Password updated successfully.',
    };

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

const {
  data: loginData,
  error,
} = await supabase.auth.signInWithPassword({
  email,
  password,
});

console.log('LOGIN RESULT:', {
  userId: loginData?.user?.id,
  email: loginData?.user?.email,
  hasSession: !!loginData?.session,
  accessToken: !!loginData?.session?.access_token,
});

if (error) {
  console.error('LOGIN ERROR:', error);
  setErrorMessage(error.message);
  setLoading(false);
  return;
}

const {
  data: {
    session: verifiedSession,
  },
} = await supabase.auth.getSession();

console.log('LOGIN VERIFIED SESSION:', {
  userId: verifiedSession?.user?.id,
  email: verifiedSession?.user?.email,
  hasSession: !!verifiedSession,
});

      const nextPath = new URLSearchParams(window.location.search).get('next');

      if (nextPath) {
        router.push(nextPath);
        return;
      }

      const { data: isAdmin, error: adminError } =
        await supabase.rpc('is_admin');

      if (!adminError && isAdmin) {
        router.push('/admin');
        return;
      }

      router.push('/home');

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

setMessage(t.passwordUpdated);

setLoading(false);

}

async function handleUpdatePassword(e: React.FormEvent) {
e.preventDefault();

setMessage('');
setErrorMessage('');

if (newPassword.length < 6) {
  setErrorMessage(t.passwordMinimum);
  return;
}

if (newPassword !== confirmPassword) {
  setErrorMessage(t.passwordMismatch);
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

setMessage(t.passwordUpdated);

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
return (
  <main className="min-h-screen flex items-center justify-center bg-[#143640] p-5 relative">

    <button
      type="button"
      onClick={toggleLanguage}
      className="absolute top-5 right-5 z-20 bg-[#E7B548] text-[#143640] font-extrabold px-4 py-2 rounded-xl hover:brightness-95 transition"
    >
      {isArabic ? "EN" : "عربي"}
    </button>

    <form
       onSubmit={handleUpdatePassword}
       className="bg-white border-t-4 border-[#E7B548] shadow-xl rounded-xl p-8 w-full max-w-md"
     > <h1 className="text-3xl font-bold mb-3 text-center text-[#143640]">
{t.resetPassword} </h1>

```
      <p className="text-center text-gray-500 mb-6">
        {t.enterNewPassword}
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
        placeholder={t.newPassword}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <input
        className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded-lg mb-5 focus:outline-none focus:ring-2 focus:ring-[#E7B548]"
        type="password"
        placeholder={t.confirmPassword}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E7B548] text-[#143640] font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? t.updating : t.updatePassword}
      </button>
    </form>
  </main>
);


}

// =========================================
// FORGOT PASSWORD
// =========================================

if (forgotPassword) {
return (
  <main className="min-h-screen flex items-center justify-center bg-[#143640] p-5 relative">

    <button
      type="button"
      onClick={toggleLanguage}
      className="absolute top-5 right-5 z-20 bg-[#E7B548] text-[#143640] font-extrabold px-4 py-2 rounded-xl hover:brightness-95 transition"
    >
      {isArabic ? "EN" : "عربي"}
    </button>

    <form
       onSubmit={handleForgotPassword}
       className="bg-white border-t-4 border-[#E7B548] shadow-xl rounded-xl p-8 w-full max-w-md"
     > <h1 className="text-3xl font-bold mb-3 text-center text-[#143640]">
{t.forgotTitle} </h1>

```
      <p className="text-center text-gray-500 mb-6">
        {t.forgotDescription}
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
        placeholder={t.email}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E7B548] text-[#143640] font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? t.sending : t.sendResetLink}
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

return (
  <main className="min-h-screen flex items-center justify-center bg-[#143640] p-5 relative">

    <button
      type="button"
      onClick={toggleLanguage}
      className="absolute top-5 right-5 z-20 bg-[#E7B548] text-[#143640] font-extrabold px-4 py-2 rounded-xl hover:brightness-95 transition"
    >
      {isArabic ? "EN" : "عربي"}
    </button>

    <form
     onSubmit={handleLogin}
     className="bg-white border-t-4 border-[#E7B548] shadow-xl rounded-xl p-8 w-full max-w-md"
   > <h1 className="text-3xl font-bold mb-6 text-center text-[#143640]">
{t.welcomeBack} </h1>

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
      placeholder={t.email}
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />

    <input
      className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-[#E7B548]"
      type="password"
      placeholder={t.password}
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
        {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
      </button>
    </div>

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-[#E7B548] text-[#143640] font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
    >
      {loading ? t.loggingIn : t.login}
    </button>

    <p className="text-center mt-5 text-gray-600">
      {isArabic ? 'ليس لديك حساب؟' : "Don't have an account?"}

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









