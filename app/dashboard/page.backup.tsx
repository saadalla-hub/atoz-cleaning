
'use client';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  FaCoins,
  FaUsers,
  FaGift,
  FaTicketAlt,
  FaCopy,
  FaCheck,
  FaSignOutAlt,
  FaArrowLeft,
} from 'react-icons/fa';

type UserProfile = {
  full_name: string | null;
  referral_code: string;
  green_points: number;
  total_referrals: number;
};

type RewardRequest = {
  id: string;
  reward_name: string;
  reward_points: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rewardRequests, setRewardRequests] = useState<RewardRequest[]>([]);
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
console.log('CURRENT AUTH USER:', user);
console.log('CURRENT AUTH USER ID:', user?.id);
console.log('CURRENT AUTH USER EMAIL:', user?.email);
    if (!user) {
      setLoading(false);
      router.push('/login');
      return;
    }

    // Load user profile
   const {
  data: profileData,
  error: profileError,
} = await supabase
  .from('users')
  .select(`
    id,
    full_name,
    referral_code,
    green_points,
    total_referrals
  `)
  .eq('id', user.id)
  .maybeSingle();

if (profileError) {
  console.error('PROFILE ERROR:', profileError);

  alert(
    'Could not load your profile.\n\n' +
    JSON.stringify(profileError)
  );

  setLoading(false);
  return;
}

if (!profileData) {
  console.error('No profile found for Auth user:', user.id);

  alert(
    'Your account exists, but your user profile was not found. Please contact support.'
  );

  setLoading(false);
  return;
}

setProfile(profileData);

    if (profileError) {
      console.error('Profile error:', profileError);
      setLoading(false);
      return;
    }

    setProfile(profileData);

    // Load reward requests
    const {
      data: rewardsData,
      error: rewardsError,
    } = await supabase
      .from('reward_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (rewardsError) {
      console.error('Rewards error:', rewardsError);
    } else {
      setRewardRequests(rewardsData ?? []);
    }

    setLoading(false);
  }

  async function requestReward() {
    if (!profile) return;

    if (profile.green_points < 3) {
      alert('You need at least 3 Green Points.');
      return;
    }

    const pendingRequest = rewardRequests.find(
      (reward) =>
        reward.reward_name === 'Free Deep Cleaning' &&
        reward.status === 'pending'
    );

    if (pendingRequest) {
      alert('You already have a pending reward request.');
      return;
    }

    setRequesting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRequesting(false);
      router.push('/login');
      return;
    }

    const { error } = await supabase
      .from('reward_requests')
      .insert({
        user_id: user.id,
        reward_name: 'Free Deep Cleaning',
        reward_points: 3,
        status: 'pending',
      });

    if (error) {
      alert(error.message);
      setRequesting(false);
      return;
    }

    alert('Reward request sent successfully!');

    await loadDashboard();

    setRequesting(false);
  }

  async function copyReferralCode() {
    if (!profile?.referral_code) return;

    await navigator.clipboard.writeText(profile.referral_code);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }
async function copyReferralLink() {
  if (!profile?.referral_code) return;

  const link = `${window.location.origin}/register?ref=${profile.referral_code}`;

  await navigator.clipboard.writeText(link);

  alert('Referral link copied!');
}
function shareOnWhatsApp() {
  if (!profile?.referral_code) return;

  const link = `${window.location.origin}/register?ref=${profile.referral_code}`;

  const message = `Hi! 👋

Join A to Z Cleaning Services using my referral link and start earning rewards.

${link}`;

  window.open(
    `https://wa.me/?text=${encodeURIComponent(message)}`,
    '_blank'
  );
}
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.push('/login');
  }

  const approvedRewards = rewardRequests.filter(
    (reward) => reward.status === 'approved'
  );

  const pendingRewards = rewardRequests.filter(
    (reward) => reward.status === 'pending'
  );

  const latestReward = rewardRequests[0];

  // Progress toward next reward
  const pointsProgress = Math.min(
    (profile?.green_points ?? 0) / 3 * 100,
    100
  );

  if (loading || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#143640]">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-[#E7B548] rounded-full animate-spin mx-auto mb-4" />

          <p className="text-lg font-semibold">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

 return (
  <ProtectedRoute>
    <main className="min-h-screen bg-gray-100">

      {/* Header */}

      <header className="bg-[#143640] text-white shadow-lg">

        <div className="max-w-6xl mx-auto px-5 py-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>
              <p className="text-[#E7B548] font-semibold text-sm uppercase tracking-wider">
                A to Z Cleaning Services
              </p>

              <h1 className="text-2xl md:text-3xl font-bold mt-1">
                Welcome, {profile.full_name || 'User'} 👋
              </h1>

              <p className="text-white/70 mt-1">
                Manage your Green Points and rewards.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-lg transition"
              >
                <FaArrowLeft />
                Back to Website
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2.5 rounded-lg transition"
              >
                <FaSignOutAlt />
                Logout
              </button>

            </div>

          </div>

        </div>

      </header>


      {/* Dashboard Content */}

      <div className="max-w-6xl mx-auto px-5 py-8">


        {/* Statistics */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">


          <DashboardCard
            icon={<FaCoins />}
            title="Green Points"
            value={profile.green_points}
            description="Available points"
          />


          <DashboardCard
            icon={<FaUsers />}
            title="Referrals"
            value={profile.total_referrals}
            description="Successful referrals"
          />


          <DashboardCard
            icon={<FaTicketAlt />}
            title="Referral Code"
            value={profile.referral_code}
            description="Share with friends"
            smallValue
          />


          <DashboardCard
            icon={<FaGift />}
            title="Rewards"
            value={approvedRewards.length}
            description="Approved rewards"
          />


        </div>


        {/* Green Points Progress */}

        <section className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h2 className="text-xl font-bold text-[#143640]">
                Green Points Progress
              </h2>

              <p className="text-gray-500 mt-1">
                You need 3 Green Points to request a Free Deep Cleaning reward.
              </p>

            </div>

            <div className="text-right">

              <span className="text-2xl font-bold text-[#143640]">
                {profile.green_points}
              </span>

              <span className="text-gray-500">
                {' '} / 3 Points
              </span>

            </div>

          </div>


          <div className="mt-5 h-3 bg-gray-200 rounded-full overflow-hidden">

            <div
              className="h-full bg-[#E7B548] rounded-full transition-all duration-700"
              style={{
                width: `${pointsProgress}%`,
              }}
            />

          </div>


          {profile.green_points >= 3 ? (

            <p className="mt-3 text-green-600 font-semibold">
              ✓ You have enough points to request a reward!
            </p>

          ) : (

            <p className="mt-3 text-gray-500">
              You need {3 - profile.green_points} more point
              {3 - profile.green_points !== 1 ? 's' : ''} to unlock your reward.
            </p>

          )}

        </section>


        {/* Referral Code */}

        <section className="mt-6 bg-[#143640] rounded-2xl shadow-lg p-6 text-white">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <div className="flex items-center gap-2">

                <FaTicketAlt className="text-[#E7B548]" />

                <h2 className="text-xl font-bold">
                  Your Referral Code
                </h2>

              </div>

              <p className="text-white/70 mt-2">
                Share your code and earn Green Points when friends join A to Z.
              </p>

            </div>


            <div className="flex items-center gap-3">

              <div className="bg-white text-[#143640] font-bold text-lg px-5 py-3 rounded-lg tracking-wider">
                {profile.referral_code}
              </div>

              <button
                onClick={copyReferralCode}
                className="flex items-center gap-2 bg-[#E7B548] text-[#143640] font-bold px-4 py-3 rounded-lg hover:opacity-90 transition"
              >
                {copied ? <FaCheck /> : <FaCopy />}

                {copied ? 'Copied' : 'Copy'}
              </button>
<button
  onClick={copyReferralLink}
  className="flex items-center gap-2 bg-white text-[#143640] font-bold px-4 py-3 rounded-lg hover:bg-gray-100 transition"
>
  🔗 Copy Link
</button>
<button
  onClick={shareOnWhatsApp}
  className="flex items-center gap-2 bg-green-600 text-white font-bold px-4 py-3 rounded-lg hover:bg-green-700 transition"
>
  📱 Share on WhatsApp
</button>
            </div>

          </div>

        </section>


        {/* Rewards Center */}

        <section className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-[#143640] text-[#E7B548] flex items-center justify-center text-xl">
              <FaGift />
            </div>

            <div>

              <h2 className="text-2xl font-bold text-[#143640]">
                Rewards Center
              </h2>

              <p className="text-gray-500">
                Use your Green Points to request cleaning rewards.
              </p>

            </div>

          </div>


          {/* Current Reward Status */}

          {latestReward && (

            <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-5">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>

                  <p className="text-sm text-gray-500">
                    Latest Reward Request
                  </p>

                  <h3 className="text-lg font-bold text-[#143640] mt-1">
                    {latestReward.reward_name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {latestReward.reward_points} Green Points •{' '}
                    {new Date(
                      latestReward.created_at
                    ).toLocaleDateString()}
                  </p>

                </div>


                <StatusBadge status={latestReward.status} />

              </div>

            </div>

          )}


          {/* Request Button */}

          <div className="mt-6">

            <button
              onClick={requestReward}
              disabled={
                requesting ||
                profile.green_points < 3 ||
                latestReward?.status === 'pending'
              }
              className="bg-[#E7B548] text-[#143640] font-bold px-7 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {requesting
                ? 'Sending...'
                : latestReward?.status === 'pending'
                ? 'Request Pending'
                : profile.green_points < 3
                ? 'Not Enough Points'
                : 'Request Free Deep Cleaning'}
            </button>

          </div>

        </section>


        {/* Reward History */}

        <section className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-2xl font-bold text-[#143640]">
                Reward History
              </h2>

              <p className="text-gray-500 mt-1">
                Track all your reward requests.
              </p>

            </div>

            <div className="bg-[#143640] text-white px-4 py-2 rounded-lg text-sm">
              {rewardRequests.length} Request
              {rewardRequests.length !== 1 ? 's' : ''}
            </div>

          </div>


          {rewardRequests.length === 0 ? (

            <div className="text-center py-10">

              <FaGift className="mx-auto text-4xl text-gray-300" />

              <p className="text-gray-500 mt-3">
                You have not requested any rewards yet.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {rewardRequests.map((reward) => (

                <div
                  key={reward.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition"
                >

                  <div className="flex items-center gap-4">

                    <div className="w-11 h-11 rounded-lg bg-[#143640] text-[#E7B548] flex items-center justify-center">
                      <FaGift />
                    </div>

                    <div>

                      <p className="font-bold text-[#143640]">
                        {reward.reward_name}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {reward.reward_points} Green Points
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(
                          reward.created_at
                        ).toLocaleDateString()}
                      </p>

                    </div>

                  </div>


                  <StatusBadge status={reward.status} />

                </div>

              ))}

            </div>

          )}

        </section>


        {/* Quick Summary */}

        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-lg bg-[#143640] text-[#E7B548] flex items-center justify-center">
                <FaGift />
              </div>

              <div>

                <p className="text-gray-500 text-sm">
                  Pending Requests
                </p>

                <p className="text-2xl font-bold text-[#143640]">
                  {pendingRewards.length}
                </p>

              </div>

            </div>

          </div>


          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-lg bg-[#143640] text-[#E7B548] flex items-center justify-center">
                <FaCheck />
              </div>

              <div>

                <p className="text-gray-500 text-sm">
                  Completed Rewards
                </p>

                <p className="text-2xl font-bold text-[#143640]">
                  {approvedRewards.length}
                </p>

              </div>

            </div>

          </div>

        </section>


      </div>

    </main>
  </ProtectedRoute>
  );
}


function DashboardCard({
  icon,
  title,
  value,
  description,
  smallValue = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
  smallValue?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">

      <div className="flex items-center justify-between">

        <div className="text-3xl text-[#143640]">
          {icon}
        </div>

        <div className="w-2 h-2 rounded-full bg-[#E7B548]" />

      </div>

      <h3
        className={`font-bold mt-4 text-[#143640] ${
          smallValue
            ? 'text-xl break-all'
            : 'text-3xl'
        }`}
      >
        {value}
      </h3>

      <p className="font-semibold text-gray-700 mt-1">
        {title}
      </p>

      <p className="text-sm text-gray-400 mt-1">
        {description}
      </p>

    </div>
  );
}


function StatusBadge({
  status,
}: {
  status: 'pending' | 'approved' | 'rejected';
}) {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-bold">
        🟡 Pending
      </span>
    );
  }

  if (status === 'approved') {
    return (
      <span className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
        🟢 Approved
      </span>
    );
  }

  return (
    <span className="inline-flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold">
      🔴 Rejected
    </span>
  );
}

