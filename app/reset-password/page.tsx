
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setErrorMessage(
          'The password reset link is invalid or has expired. Please request a new reset link.'
        );
      }

      setCheckingSession(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setErrorMessage('');
        setCheckingSession(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleUpdatePassword(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setMessage('');
    setErrorMessage('');

    if (newPassword.length < 6) {
      setErrorMessage(
        'Password must be at least 6 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        'Passwords do not match.'
      );
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    if (error) {
      console.error(
        'Update password error:',
        error
      );

      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      'تم تغيير كلمة المرور بنجاح.'
    );

    setNewPassword('');
    setConfirmPassword('');

    setLoading(false);

    setTimeout(async () => {
      await supabase.auth.signOut();
      router.push('/login');
    }, 2500);
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#143640] p-5">
        <div className="text-white text-lg font-semibold">
          Checking reset link...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#143640] p-5">

      <form
        onSubmit={handleUpdatePassword}
        className="bg-white border-t-4 border-[#E7B548] shadow-xl rounded-xl p-8 w-full max-w-md"
      >

        <h1 className="text-3xl font-bold mb-3 text-center text-[#143640]">
          Reset Password
        </h1>

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

        {!errorMessage && (
          <>
            <input
              className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#E7B548]"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              required
            />

            <input
              className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded-lg mb-5 focus:outline-none focus:ring-2 focus:ring-[#E7B548]"
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E7B548] text-[#143640] font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading
                ? 'Updating...'
                : 'Update Password'}
            </button>
          </>
        )}

        {errorMessage && (
          <button
            type="button"
            onClick={() =>
              router.push('/login')
            }
            className="w-full mt-4 text-[#143640] font-semibold hover:underline"
          >
            Back to Login
          </button>
        )}

      </form>

    </main>
  );
}
