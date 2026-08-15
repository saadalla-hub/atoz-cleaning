'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type ProtectedRouteProps = {
  children: React.ReactNode;
  adminOnly?: boolean;
};

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // User is not logged in
      if (!user) {
        router.replace('/login?next=/admin');
        return;
      }

      // Dashboard protection
      if (!adminOnly) {
        if (mounted) {
          setAllowed(true);
          setLoading(false);
        }

        return;
      }
      // Admin protection
      const { data: isAdmin, error: adminError } =
        await supabase.rpc('is_admin');

      if (adminError) {
        console.error('Admin check error:', adminError);
        router.replace('/dashboard');
        return;
      }

      if (!isAdmin) {
        router.replace('/dashboard');
        return;
      }

      // User is admin
      if (mounted) {
        setAllowed(true);
        setLoading(false);
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [router, adminOnly]);

  // Loading screen
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#143640]">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-[#E7B548] rounded-full animate-spin mx-auto mb-4" />

          <p className="text-lg font-semibold">
            Checking access...
          </p>
        </div>
      </main>
    );
  }

  // Do not render protected content
  // until access is confirmed
  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
