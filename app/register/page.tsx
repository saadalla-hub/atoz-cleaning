'use client';

import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [referralCode, setReferralCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const ref = searchParams.get('ref');

    if (ref) {
      setReferralCode(ref.toUpperCase());
    }
  }, [searchParams]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage('');

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
        setErrorMessage(authError.message);
        setLoading(false);
        return;
      }

      const userId = authData.user?.id;

      if (!userId) {
        setErrorMessage('User creation failed.');
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

      if (functionError) {
        console.error(
          'Registration function error:',
          functionError
        );

        setErrorMessage(functionError.message);
        setLoading(false);
        return;
      }

      if (!result?.success) {
        setErrorMessage(
          result?.message ||
          'Registration failed.'
        );

        setLoading(false);
        return;
      }

      // =====================================
      // 3. Registration Successful
      // =====================================

      alert('Account created successfully!');

      router.push('/login');

    } catch (error) {
      console.error(
        'Registration error:',
        error
      );

      setErrorMessage(
        'Something went wrong during registration.'
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#143640] text-white relative overflow-hidden">

      {/* Decorative background glow */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#E7B548]/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#E7B548]/10 blur-3xl" />

      </div>


      {/* Main Content */}

      <div className="relative min-h-screen flex items-center justify-center px-5 py-10">

        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">


          {/* LEFT — Welcome */}

          <div className="hidden lg:flex flex-col items-center justify-center text-center px-8">

            {/* Logo */}

            <motion.div
              animate={{
                scale: [1, 1.035, 0.995, 1.02, 1],
              }}
              transition={{
                duration: 2.1,
                repeat: Infinity,
                repeatDelay: 1.1,
                ease: 'easeInOut',
              }}
              className="relative w-80 h-48 flex items-center justify-center"
            >

              <Image
                src="/images/logo/atoz-logo-new.png"
                alt="A to Z Cleaning Services"
                width={260}
                height={130}
                className="object-contain relative z-10"
                priority
              />

              {/* Orbit stars */}

              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 5.2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0"
              >

                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[#E7B548] text-2xl">
                  ✦
                </span>

                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[#E7B548] text-2xl">
                  ✦
                </span>

                <span className="absolute bottom-2 left-3 text-[#E7B548] text-2xl">
                  ✦
                </span>

              </motion.div>

            </motion.div>


            <h1 className="text-4xl font-extrabold mt-5">
              Welcome to A to Z
            </h1>

            <p className="text-[#C7D0D2] text-lg mt-3">
              Professional Cleaning Services
            </p>

            <p className="text-[#C7D0D2] text-lg">
              in Madinaty & El Shorouk
            </p>

            <p className="text-[#8A9A9E] text-sm mt-8">
              Clean. Professional. From A to Z.
            </p>

          </div>


          {/* RIGHT — Create Account */}

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="w-full"
          >

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

              {/* Gold top line */}

              <div className="h-1.5 bg-[#E7B548]" />


              <div className="p-7 sm:p-9">


                {/* Mobile Logo */}

                <div className="lg:hidden flex justify-center mb-6">

                  <Image
                    src="/images/logo/atoz-logo-new.png"
                    alt="A to Z Cleaning Services"
                    width={210}
                    height={105}
                    className="object-contain"
                    priority
                  />

                </div>


                <div className="text-center mb-7">

                  <h2 className="text-3xl font-extrabold text-[#143640]">
                    Create Account
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Join A to Z Cleaning Services
                  </p>

                </div>


                {/* Error */}

                {errorMessage && (

                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>

                )}


                <form
                  onSubmit={handleRegister}
                  className="space-y-4"
                >


                  {/* Full Name */}

                  <div>

                    <label className="block text-sm font-semibold text-[#143640] mb-1.5">
                      Full Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) =>
                        setFullName(e.target.value)
                      }
                      required
                      autoComplete="name"
                      className="w-full border border-gray-300 bg-gray-50 text-gray-900 px-4 py-3.5 rounded-xl outline-none transition focus:border-[#E7B548] focus:ring-2 focus:ring-[#E7B548]/20"
                    />

                  </div>


                  {/* Phone */}

                  <div>

                    <label className="block text-sm font-semibold text-[#143640] mb-1.5">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      required
                      autoComplete="tel"
                      className="w-full border border-gray-300 bg-gray-50 text-gray-900 px-4 py-3.5 rounded-xl outline-none transition focus:border-[#E7B548] focus:ring-2 focus:ring-[#E7B548]/20"
                    />

                  </div>


                  {/* Email */}

                  <div>

                    <label className="block text-sm font-semibold text-[#143640] mb-1.5">
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                      autoComplete="email"
                      className="w-full border border-gray-300 bg-gray-50 text-gray-900 px-4 py-3.5 rounded-xl outline-none transition focus:border-[#E7B548] focus:ring-2 focus:ring-[#E7B548]/20"
                    />

                  </div>


                  {/* Referral Code */}

                  <div>

                    <label className="block text-sm font-semibold text-[#143640] mb-1.5">

                      Referral Code

                      <span className="text-gray-400 font-normal ml-1">
                        (Optional)
                      </span>

                    </label>

                    <input
                      type="text"
                      placeholder="Enter referral code"
                      value={referralCode}
                      onChange={(e) =>
                        setReferralCode(
                          e.target.value.toUpperCase()
                        )
                      }
                      className="w-full border border-gray-300 bg-gray-50 text-gray-900 px-4 py-3.5 rounded-xl outline-none transition focus:border-[#E7B548] focus:ring-2 focus:ring-[#E7B548]/20 tracking-wider font-semibold"
                    />

                  </div>


                  {/* Password */}

                  <div>

                    <label className="block text-sm font-semibold text-[#143640] mb-1.5">
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full border border-gray-300 bg-gray-50 text-gray-900 px-4 py-3.5 rounded-xl outline-none transition focus:border-[#E7B548] focus:ring-2 focus:ring-[#E7B548]/20"
                    />

                    <p className="text-xs text-gray-400 mt-1.5">
                      Minimum 6 characters
                    </p>

                  </div>


                  {/* Create Button */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#E7B548] text-[#143640] font-extrabold py-3.5 rounded-xl hover:brightness-95 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >

                    {loading
                      ? 'Creating Account...'
                      : 'Create Account'}

                  </button>

                </form>


                {/* Login */}

                <p className="text-center text-gray-500 mt-6">

                  Already have an account?

                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="ml-2 text-[#143640] font-extrabold hover:text-[#E7B548] transition"
                  >
                    Sign In
                  </button>

                </p>


                {/* Back */}

                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-full text-center text-sm text-gray-400 hover:text-[#143640] transition mt-5"
                >
                  ← Back to Website
                </button>


              </div>

            </div>

          </motion.div>

        </div>

      </div>

    </main>
  );
}


export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#143640] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-white/20 border-t-[#E7B548] rounded-full animate-spin" />
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
