
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [referralCode, setReferralCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');

    if (ref) {
      setReferralCode(ref.toUpperCase());
    }
  }, [searchParams]);

  async function handleRegister(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      // =====================================
      // 1. Create Supabase Auth User
      // =====================================

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authError) {
        alert(authError.message);
        setLoading(false);
        return;
      }

      const userId = authData.user?.id;

      if (!userId) {
        alert('User creation failed.');
        setLoading(false);
        return;
      }


      // =====================================
      // 2. Create User Profile
      //    + Process Referral
      // =====================================

      const {
        data: result,
        error: functionError,
      } = await supabase.rpc(
        'register_user_with_referral',
        {
          p_user_id: userId,
          p_full_name: fullName.trim(),
          p_phone: phone.trim(),
          p_email: email.trim(),
          p_referral_code:
            referralCode.trim() === ''
              ? null
              : referralCode.trim().toUpperCase(),
        }
      );


      // =====================================
      // 3. Check Function Error
      // =====================================

      if (functionError) {
        console.error(
          'Registration function error:',
          functionError
        );

        alert(functionError.message);

        setLoading(false);
        return;
      }


      // =====================================
      // 4. Check Function Result
      // =====================================

      if (!result?.success) {
        alert(
          result?.message ||
          'Registration failed.'
        );

        setLoading(false);
        return;
      }


      // =====================================
      // 5. Registration Successful
      // =====================================

      alert(
        'Account created successfully!'
      );

      router.push('/login');

    } catch (error) {

      console.error(
        'Registration error:',
        error
      );

      alert(
        'Something went wrong during registration.'
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <main className="min-h-screen flex items-center justify-center bg-[#143640] p-5">

      <form
        onSubmit={handleRegister}
        className="bg-white border-t-4 border-[#E7B548] shadow-xl rounded-xl p-8 w-full max-w-md"
      >

        <h1 className="text-3xl font-bold mb-6 text-center text-[#143640]">
          Create Account
        </h1>


        {/* Full Name */}

        <input
          className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#E7B548]"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) =>
            setFullName(e.target.value)
          }
          required
        />


        {/* Phone */}

        <input
          className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#E7B548]"
          placeholder="Phone"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          required
        />


        {/* Email */}

        <input
          className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#E7B548]"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />


        {/* Referral Code */}

        <input
          className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#E7B548]"
          placeholder="Referral Code (Optional)"
          value={referralCode}
          onChange={(e) =>
            setReferralCode(
              e.target.value.toUpperCase()
            )
          }
        />


        {/* Password */}

        <input
          className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded-lg mb-5 focus:outline-none focus:ring-2 focus:ring-[#E7B548]"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
          minLength={6}
        />


        {/* Register Button */}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E7B548] text-[#143640] font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading
            ? 'Creating Account...'
            : 'Register'}
        </button>


        {/* Login Link */}

        <p className="text-center mt-5 text-gray-600">

          Already have an account?

          <a
            href="/login"
            className="ml-2 text-[#143640] font-bold"
          >
            Login
          </a>

        </p>

      </form>

    </main>
  );
}
