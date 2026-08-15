'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  FaCheck,
  FaClock,
  FaCoins,
  FaGift,
  FaLink,
  FaSync,
  FaSignOutAlt,
  FaTimes,
  FaUsers,
  FaUserShield,
} from 'react-icons/fa';

import { supabase } from '@/lib/supabase';


// ==========================================
// TYPES
// ==========================================

type User = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  referral_code?: string;
  green_points?: number;
  total_referrals?: number;
  created_at?: string;
};


type Referral = {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  referral_code: string;
  created_at?: string;
};


type RewardRequest = {
  id: string;
  user_id: string;
  reward_name?: string;
  reward_points: number;
  status?: string;
  created_at?: string;
};

type Booking = {
  id: string;
  user_id: string;
  service?: string | null;
  property_type?: string | null;
  area?: string | null;
  address?: string | null;
  booking_date?: string | null;
  booking_time?: string | null;
  status?: string | null;
  referral_code_used?: string | null;
  notes?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  created_at?: string | null;
};
// ==========================================
// ADMIN PAGE
// ==========================================

export default function AdminPage() {

  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const [users, setUsers] =
    useState<User[]>([]);
const [userSearch, setUserSearch] =
  useState('');

const [rewardFilter, setRewardFilter] =
  useState<
    'all' |
    'pending' |
    'approved' |
    'rejected'
  >('all');
  const [referrals, setReferrals] =
    useState<Referral[]>([]);

  const [rewardRequests, setRewardRequests] =
    useState<RewardRequest[]>([]);
const [bookings, setBookings] =
  useState<Booking[]>([]);
  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');


  // ==========================================
  // LOAD ADMIN DATA
  // ==========================================

  async function loadData() {

    setLoading(true);
    setErrorMessage('');


    try {

      // --------------------------------------
      // Check logged in user
      // --------------------------------------

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();


      if (!user) {

        router.push('/login');

        return;

      }


      // --------------------------------------
      // Check Admin Permission
      // --------------------------------------

      console.log('ADMIN DEBUG USER:', user?.id, user?.email);

        const {
          data: isAdmin,
        error: adminError,
      } = await supabase.rpc(
        'is_admin'
      );


      if (adminError) {

        console.error(
          'Admin check error:',
          adminError
        );

        setErrorMessage(
          'Could not verify admin permissions.'
        );

        return;

      }


      if (!isAdmin) {

        alert(
          'Access denied. Admins only.'
        );

        router.push('/dashboard');

        return;

      }


      // --------------------------------------
      // Load Users
      // --------------------------------------

      const {
        data: usersData,
        error: usersError,
      } = await supabase
        .from('users')
        .select('*')
        .order(
          'created_at',
          {
            ascending: false,
          }
        );


      if (usersError) {

        console.error(
          'Users error:',
          usersError
        );

        setErrorMessage(
          usersError.message
        );

        return;

      }


      // --------------------------------------
      // Load Referrals
      // --------------------------------------

      const {
        data: referralsData,
        error: referralsError,
      } = await supabase
        .from('referrals')
        .select('*')
        .order(
          'created_at',
          {
            ascending: false,
          }
        );


      if (referralsError) {

        console.error(
          'Referrals error:',
          referralsError
        );

      }


      // --------------------------------------
      // Load Reward Requests
      // --------------------------------------

      const {
        data: rewardsData,
        error: rewardsError,
      } = await supabase
        .from('reward_requests')
        .select('*')
        .order(
          'created_at',
          {
            ascending: false,
          }
        );


      if (rewardsError) {

        console.error(
          'Rewards error:',
          rewardsError
        );

      }
// --------------------------------------
// Load Bookings
// --------------------------------------

const {
  data: bookingsData,
  error: bookingsError,
} = await supabase
  .from('bookings')
  .select('*')
  .order(
    'created_at',
    {
      ascending: false,
    }
  );

if (bookingsError) {
  console.error(
    'Bookings error:',
    bookingsError
  );
}

      setUsers(
        usersData ?? []
      );

      setReferrals(
        referralsData ?? []
      );

      setRewardRequests(
        rewardsData ?? []
      );

setBookings(
  bookingsData ?? []
);
    } catch (error) {

      console.error(
        'Admin loading error:',
        error
      );

      setErrorMessage(
        'Something went wrong.'
      );

    } finally {

      setLoading(false);

    }

  }


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {

    loadData();

  }, []);


  // ==========================================
  // STATISTICS
  // ==========================================

  const pending =
    rewardRequests.filter(
      (reward) =>
        reward.status === 'pending'
    ).length;

const filteredRewardRequests =
  rewardRequests.filter(
    (reward) => {

      const rewardUser =
        users.find(
          (user) =>
            user.id ===
            reward.user_id
        );

      const search =
        userSearch
          .toLowerCase()
          .trim();

      const matchesSearch =
        !search ||
        rewardUser?.full_name
          ?.toLowerCase()
          .includes(search) ||
        rewardUser?.email
          ?.toLowerCase()
          .includes(search);

      const matchesFilter =
        rewardFilter === 'all' ||
        reward.status ===
          rewardFilter;

      return (
        matchesSearch &&
        matchesFilter
      );

    }
  );
  const totalPoints =
    users.reduce(
      (
        total,
        user
      ) =>
        total +
        (
          user.green_points ?? 0
        ),
      0
    );

// ==========================================
// UPDATE BOOKING STATUS
// ==========================================

async function updateBookingStatus(
id: string,
status:
| 'pending'
| 'confirmed'
| 'completed'
| 'cancelled'
) {
const confirmed = window.confirm(
`Change booking status to "${status}"?`
);

if (!confirmed) {
return;
}

setLoading(true);

try {
console.log(
'Updating booking:',
id,
'to status:',
status
);


const { data, error } = await supabase
  .from('bookings')
  .update({
    status: status,
  })
  .eq('id', id)
  .select();

if (error) {
  console.error(
    'Booking status update error:',
    error
  );

  alert(
    `Failed to update booking status:\n${error.message}`
  );

  return;
}

console.log(
  'Booking status updated successfully:',
  data
);


setBookings((currentBookings) =>
  currentBookings.map((booking) =>
    booking.id === id
      ? {
          ...booking,
          status,
        }
      : booking
  )
);

alert(
  `Booking status changed to "${status}".`
);



} catch (error) {
console.error(
'Booking status error:',
error
);


alert(
  'Something went wrong while updating the booking.'
);


} finally {
setLoading(false);
}
}

  // ==========================================
  // APPROVE / REJECT REWARD
  // ==========================================

  async function updateRewardStatus(
    id: string,
    status:
      | 'approved'
      | 'rejected'
  ) {

    const message =
      status === 'approved'
        ? 'Approve this reward request? 3 Green Points will be deducted.'
        : 'Reject this reward request?';


    if (
      !confirm(message)
    ) {

      return;

    }


    setLoading(true);


    try {

      // --------------------------------------
      // Get Reward
      // --------------------------------------

      const {
        data: reward,
        error: rewardError,
      } = await supabase
        .from('reward_requests')
        .select('*')
        .eq(
          'id',
          id
        )
        .single();


      if (
        rewardError ||
        !reward
      ) {

        alert(
          'Reward request not found.'
        );

        return;

      }


      // --------------------------------------
      // Prevent Duplicate Processing
      // --------------------------------------

      if (
        reward.status !==
        'pending'
      ) {

        alert(
          `This reward is already ${reward.status}.`
        );

        return;

      }


      // --------------------------------------
      // REJECT
      // --------------------------------------

      if (
        status ===
        'rejected'
      ) {

        const {
          error,
        } = await supabase
          .from(
            'reward_requests'
          )
          .update({

            status:
              'rejected',

          })
          .eq(
            'id',
            id
          )
          .eq(
            'status',
            'pending'
          );


        if (error) {

          alert(
            error.message
          );

          return;

        }


        alert(
          'Reward request rejected.'
        );


        await loadData();

        return;

      }


      // --------------------------------------
      // APPROVE
      // --------------------------------------

      const {
        data,
        error,
      } = await supabase.rpc(
        'approve_reward_request',
        {
          p_reward_id:
            id,
        }
      );


      if (error) {

        console.error(
          'Approve error:',
          error
        );

        alert(
          error.message
        );

        return;

      }


      if (
        !data?.success
      ) {

        alert(
          data?.message ||
          'Failed to approve reward.'
        );

        return;

      }


      alert(
        'Reward approved successfully!'
      );


      await loadData();


    } catch (error) {

      console.error(
        'Reward error:',
        error
      );

      alert(
        'Something went wrong.'
      );

    } finally {

      setLoading(false);

    }

  }


  // ==========================================
  // LOADING
  // ==========================================

  if (
    loading &&
    users.length === 0
  ) {

    return (

      <main className="min-h-screen flex items-center justify-center bg-[#143640]">

        <div className="text-center text-white">

          <div className="w-12 h-12 border-4 border-white/30 border-t-[#E7B548] rounded-full animate-spin mx-auto mb-4" />

          <p className="text-lg font-semibold">

            Loading Admin Dashboard...

          </p>

        </div>

      </main>

    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (
    errorMessage
  ) {

    return (

      <main className="min-h-screen flex items-center justify-center bg-[#143640] p-5">

        <div className="bg-white rounded-xl p-8 max-w-md text-center">

          <h1 className="text-2xl font-bold text-red-600 mb-4">

            Admin Error

          </h1>

          <p className="text-gray-600 mb-5">

            {errorMessage}

          </p>

          <button
            onClick={
              loadData
            }
            className="bg-[#E7B548] text-[#143640] font-bold px-5 py-3 rounded-lg"
          >

            Try Again

          </button>

        </div>

      </main>

    );

  }


  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================

  return (

    <main className="min-h-screen bg-gray-100 p-4 md:p-8 text-gray-900">


      {/* HEADER */}

<div className="relative overflow-hidden rounded-2xl bg-[#143640] p-6 md:p-8 mb-8 shadow-xl">

  {/* Decorative Background */}

  <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#E7B548]/10 rounded-full blur-3xl" />

  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />


  <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

    {/* Title */}

    <div>

      <div className="flex items-center gap-4">

        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E7B548]/15 border border-[#E7B548]/30">

          <FaUserShield className="text-[#E7B548] text-2xl" />

        </div>

        <div>

          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">

            A to Z Admin Dashboard

          </h1>

          <p className="text-white/60 text-sm md:text-base mt-1">

            Manage users, referrals, and rewards

          </p>

        </div>

      </div>

    </div>


      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-3 bg-white text-[#143640] font-bold px-6 py-3.5 rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-200 mb-3"
      >
        <FaSignOutAlt />
        Logout
      </button>

    {/* Refresh Button */}

    <button
      onClick={loadData}
      disabled={loading}
      className="group flex items-center justify-center gap-3 bg-[#E7B548] text-[#143640] font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-black/10 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >

      <FaSync
        className={`transition-transform duration-500 ${
          loading
            ? 'animate-spin'
            : 'group-hover:rotate-180'
        }`}
      />

      {loading
        ? 'Refreshing...'
        : 'Refresh'}

    </button>

  </div>

</div>
      {/* STATISTICS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">


        <StatCard
          icon={
            <FaUsers />
          }
          title="Total Users"
          value={
            users.length
          }
        />


        <StatCard
          icon={
            <FaGift />
          }
          title="Reward Requests"
          value={
            rewardRequests.length
          }
        />


        <StatCard
          icon={
            <FaClock />
          }
          title="Pending Rewards"
          value={
            pending
          }
        />


        <StatCard
          icon={
            <FaCoins />
          }
          title="Total Green Points"
          value={
            totalPoints
          }
        />


      </div>


      {/* USERS */}

<section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">

  {/* Section Header */}

  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-gray-100">

    <div className="flex items-center gap-4">

      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#143640]/5">

        <FaUsers className="text-[#143640] text-xl" />

      </div>

      <div>

        <h2 className="text-xl md:text-2xl font-bold text-[#143640]">

          Users

        </h2>

        <p className="text-sm text-gray-500 mt-1">

          Manage and monitor registered users

        </p>

      </div>

    </div>


    <div className="bg-[#143640]/5 text-[#143640] px-4 py-2 rounded-lg text-sm font-semibold">

      {users.length} Total Users

    </div>

  </div>


  {/* Table */}

  <div className="overflow-x-auto">

    <table className="w-full min-w-[900px]">

      <thead>

        <tr className="bg-gray-50 border-b border-gray-100">

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            User

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Referral Code

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Points

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Referrals

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Created

          </th>

        </tr>

      </thead>


      <tbody className="divide-y divide-gray-100">

        {users.map(

          (

            user

          ) => (

            <tr

              key={

                user.id

              }

              className="group hover:bg-gray-50/80 transition-colors duration-200"

            >

              {/* User */}

              <td className="px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#143640] text-[#E7B548] font-bold">

                    {(

                      user.full_name ||

                      user.email ||

                      'U'

                    )

                      .charAt(0)

                      .toUpperCase()}

                  </div>

                  <div>

                    <p className="font-bold text-gray-900">

                      {user.full_name ||

                        'Unnamed User'}

                    </p>

                    <p className="text-sm text-gray-500">

                      {user.email ||

                        '-'}

                    </p>

                  </div>

                </div>

              </td>


              {/* Referral Code */}

              <td className="px-6 py-5">

                <span className="inline-flex items-center bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg font-mono text-sm text-[#143640]">

                  {user.referral_code ||

                    '-'}

                </span>

              </td>


              {/* Points */}

              <td className="px-6 py-5">

                <span className="inline-flex items-center gap-2 font-bold text-[#143640]">

                  <FaCoins className="text-[#E7B548]" />

                  {user.green_points ??

                    0}

                </span>

              </td>


              {/* Referrals */}

              <td className="px-6 py-5">

                <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1.5 rounded-lg bg-[#143640]/5 text-[#143640] font-bold">

                  {user.total_referrals ??

                    0}

                </span>

              </td>


              {/* Created */}

              <td className="px-6 py-5 text-sm text-gray-500">

                {user.created_at

                  ? new Date(

                      user.created_at

                    ).toLocaleDateString()

                  : '-'}

              </td>

            </tr>

          )

        )}

      </tbody>

    </table>

  </div>

</section>
      {/* REFERRALS */}

<section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">

  {/* Section Header */}

  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-gray-100">

    <div className="flex items-center gap-4">

      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#143640]/5">

        <FaLink className="text-[#143640] text-xl" />

      </div>

      <div>

        <h2 className="text-xl md:text-2xl font-bold text-[#143640]">

          Referral History

        </h2>

        <p className="text-sm text-gray-500 mt-1">

          Track referral relationships between users

        </p>

      </div>

    </div>


    <div className="bg-[#143640]/5 text-[#143640] px-4 py-2 rounded-lg text-sm font-semibold">

      {referrals.length} Total Referrals

    </div>

  </div>


  {/* Table */}

  <div className="overflow-x-auto">

    <table className="w-full min-w-[900px]">

      <thead>

        <tr className="bg-gray-50 border-b border-gray-100">

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Referrer

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Referred User

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Referral Code

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Date

          </th>

        </tr>

      </thead>


      <tbody className="divide-y divide-gray-100">

        {referrals.map(

          (

            referral

          ) => {

            const referrer =

              users.find(

                (user) =>

                  user.id ===

                  referral.referrer_id

              );


            const referredUser =

              users.find(

                (user) =>

                  user.id ===

                  referral.referred_user_id

              );


            return (

              <tr

                key={

                  referral.id

                }

                className="hover:bg-gray-50/80 transition-colors duration-200"

              >

                {/* Referrer */}

                <td className="px-6 py-5">

                  <div className="flex items-center gap-3">

                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#143640] text-[#E7B548] font-bold">

                      {(

                        referrer?.full_name ||

                        referrer?.email ||

                        'U'

                      )

                        .charAt(0)

                        .toUpperCase()}

                    </div>

                    <div>

                      <p className="font-bold text-gray-900">

                        {referrer?.full_name ||

                          'Unknown User'}

                      </p>

                      <p className="text-sm text-gray-500">

                        {referrer?.email ||

                          '-'}

                      </p>

                    </div>

                  </div>

                </td>


                {/* Referred User */}

                <td className="px-6 py-5">

                  <div className="flex items-center gap-3">

                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E7B548]/20 text-[#143640] font-bold">

                      {(

                        referredUser?.full_name ||

                        referredUser?.email ||

                        'U'

                      )

                        .charAt(0)

                        .toUpperCase()}

                    </div>

                    <div>

                      <p className="font-bold text-gray-900">

                        {referredUser?.full_name ||

                          'Unknown User'}

                      </p>

                      <p className="text-sm text-gray-500">

                        {referredUser?.email ||

                          '-'}

                      </p>

                    </div>

                  </div>

                </td>


                {/* Referral Code */}

                <td className="px-6 py-5">

                  <span className="inline-flex items-center bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg font-mono text-sm text-[#143640]">

                    {referral.referral_code}

                  </span>

                </td>


                {/* Date */}

                <td className="px-6 py-5 text-sm text-gray-500">

                  {referral.created_at

                    ? new Date(

                        referral.created_at

                      ).toLocaleDateString()

                    : '-'}

                </td>

              </tr>

            );

          }

        )}

      </tbody>

    </table>

  </div>

</section>

{/* BOOKINGS */}

<section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">

  {/* Section Header */}

  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-gray-100">

    <div className="flex items-center gap-4">

      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#143640]/5">

        <FaClock className="text-[#143640] text-xl" />

      </div>

      <div>

        <h2 className="text-xl md:text-2xl font-bold text-[#143640]">

          Bookings

        </h2>

        <p className="text-sm text-gray-500 mt-1">

          Manage and monitor customer bookings

        </p>

      </div>

    </div>

    <div className="bg-[#143640]/5 text-[#143640] px-4 py-2 rounded-lg text-sm font-semibold">

      {bookings.length} Total Bookings

    </div>

  </div>


  {/* Table */}

  <div className="overflow-x-auto">

    <table className="w-full min-w-[1500px]">

      <thead>

        <tr className="bg-gray-50 border-b border-gray-100">

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Customer

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Phone

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Service

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Property

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Area

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Address

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Date

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Time

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Referral

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Status

          </th>

        </tr>

      </thead>


      <tbody className="divide-y divide-gray-100">

        {bookings.map(

          (booking) => (

            <tr

              key={booking.id}

              className="group hover:bg-gray-50/80 transition-colors duration-200"

            >

              {/* Customer */}

              <td className="px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#143640] text-[#E7B548] font-bold">

                    {(

                      booking.customer_name ||

                      'U'

                    )

                      .charAt(0)

                      .toUpperCase()}

                  </div>

                  <div>

                    <p className="font-bold text-gray-900">

                      {booking.customer_name ||

                        'Unknown Customer'}

                    </p>

                    <p className="text-xs text-gray-400">

                      ID: {booking.user_id}

                    </p>

                  </div>

                </div>

              </td>


              {/* Phone */}

              <td className="px-6 py-5 text-sm text-gray-700">

                {booking.customer_phone ||

                  '-'}

              </td>


              {/* Service */}

              <td className="px-6 py-5">

                <span className="font-semibold text-[#143640]">

                  {booking.service ||

                    '-'}

                </span>

              </td>


              {/* Property */}

              <td className="px-6 py-5 text-sm text-gray-700">

                {booking.property_type ||

                  '-'}

              </td>


              {/* Area */}

              <td className="px-6 py-5 text-sm text-gray-700">

                {booking.area ||

                  '-'}

              </td>


              {/* Address */}

              <td className="px-6 py-5 text-sm text-gray-700 max-w-[250px]">

                <div className="truncate max-w-[250px]">

                  {booking.address ||

                    '-'}

                </div>

              </td>


              {/* Date */}

              <td className="px-6 py-5 text-sm text-gray-500 whitespace-nowrap">

                {booking.booking_date ||

                  '-'}

              </td>


              {/* Time */}

              <td className="px-6 py-5 text-sm text-gray-500 whitespace-nowrap">

                {booking.booking_time ||

                  '-'}

              </td>


              {/* Referral */}

              <td className="px-6 py-5">

                <span className="inline-flex items-center bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg font-mono text-sm text-[#143640]">

                  {booking.referral_code_used ||

                    '-'}

                </span>

              </td>


             {/* Status */}

<td className="px-6 py-5">

  <div className="flex flex-col gap-3">

    {/* Current Status */}

    <span
      className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-semibold ${
        booking.status === 'confirmed'
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : booking.status === 'completed'
          ? 'bg-green-50 text-green-700 border border-green-200'
          : booking.status === 'cancelled'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
      }`}
    >
      {booking.status || 'pending'}
    </span>

    {/* Status Buttons */}

    <div className="flex flex-wrap gap-2">

      <button
        onClick={() =>
          updateBookingStatus(
            booking.id,
            'confirmed'
          )
        }
        disabled={loading}
        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
      >
        Confirm
      </button>

      <button
        onClick={() =>
          updateBookingStatus(
            booking.id,
            'completed'
          )
        }
        disabled={loading}
        className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50"
      >
        Complete
      </button>

      
  <button
    onClick={() =>
      updateBookingStatus(
        booking.id,
        'cancelled'
      )
    }
    disabled={loading}
    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition disabled:opacity-50"
  >
    Cancel
  </button>

  <button
    onClick={() =>
      updateBookingStatus(
        booking.id,
        'pending'
      )
    }
    disabled={loading}
    className="px-3 py-1.5 rounded-lg bg-yellow-500 text-white text-xs font-semibold hover:bg-yellow-600 transition disabled:opacity-50"
  >
    Pending
  </button>

</div>


  </div>

</td>

        </tr>
      )
    )}
  </tbody>
</table>

  </div>
</section>



{/* REWARDS */}

<section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
  {/* Section Header */}

  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-gray-100">

    <div className="flex items-center gap-4">

      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#143640]/5">

        <FaGift className="text-[#143640] text-xl" />

      </div>

      <div>

        <h2 className="text-xl md:text-2xl font-bold text-[#143640]">

          Reward Requests

        </h2>

        <p className="text-sm text-gray-500 mt-1">

          Review and manage user reward requests

        </p>

      </div>

    </div>


    <div className="flex items-center gap-3">

      <div className="bg-yellow-50 text-yellow-700 border border-yellow-100 px-4 py-2 rounded-lg text-sm font-semibold">

        {pending} Pending

      </div>

      <div className="bg-[#143640]/5 text-[#143640] px-4 py-2 rounded-lg text-sm font-semibold">

        {rewardRequests.length} Total

      </div>

    </div>

  </div>


  {/* Table */}

  <div className="overflow-x-auto">

    <table className="w-full min-w-[1100px]">

      <thead>

        <tr className="bg-gray-50 border-b border-gray-100">

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            User

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Reward

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Points

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Status

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Date

          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

            Actions

          </th>

        </tr>

      </thead>


      <tbody className="divide-y divide-gray-100">

        {rewardRequests.map(

          (

            reward

          ) => {

            const rewardUser =

              users.find(

                (user) =>

                  user.id ===

                  reward.user_id

              );


            return (

              <tr

                key={

                  reward.id

                }

                className="group hover:bg-gray-50/80 transition-colors duration-200"

              >

                {/* User */}

                <td className="px-6 py-5">

                  <div className="flex items-center gap-3">

                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#143640] text-[#E7B548] font-bold">

                      {(

                        rewardUser?.full_name ||

                        rewardUser?.email ||

                        'U'

                      )

                        .charAt(0)

                        .toUpperCase()}

                    </div>

                    <div>

                      <p className="font-bold text-gray-900">

                        {rewardUser?.full_name ||

                          'Unknown User'}

                      </p>

                      <p className="text-sm text-gray-500">

                        {rewardUser?.email ||

                          '-'}

                      </p>

                    </div>

                  </div>

                </td>


                {/* Reward */}

                <td className="px-6 py-5">

                  <div className="flex items-center gap-3">

                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#E7B548]/15">

                      <FaGift className="text-[#E7B548]" />

                    </div>

                    <span className="font-bold text-[#143640]">

                      {reward.reward_name ||

                        '-'}

                    </span>

                  </div>

                </td>


                {/* Points */}

                <td className="px-6 py-5">

                  <span className="inline-flex items-center gap-2 font-bold text-[#143640]">

                    <FaCoins className="text-[#E7B548]" />

                    {reward.reward_points ??

                      0}

                  </span>

                </td>


                {/* Status */}

                <td className="px-6 py-5">

                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                      reward.status ===
                      'approved'

                        ? 'bg-green-100 text-green-700'

                        : reward.status ===
                          'rejected'

                        ? 'bg-red-100 text-red-700'

                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >

                    {reward.status ===
                      'approved' &&

                      'âœ“ '}

                    {reward.status ===
                      'rejected' &&

                      'âœ• '}

                    {reward.status ===
                      'pending' &&

                      'â— '}

                    {reward.status}

                  </span>

                </td>


                {/* Date */}

                <td className="px-6 py-5 text-sm text-gray-500">

                  {reward.created_at

                    ? new Date(

                        reward.created_at

                      ).toLocaleDateString()

                    : '-'}

                </td>


                {/* Actions */}

                <td className="px-6 py-5">

                  {reward.status ===
                  'pending' ? (

                    <div className="flex items-center gap-2">

                      <button
                        onClick={() =>
                          updateRewardStatus(
                            reward.id,
                            'approved'
                          )
                        }
                        disabled={
                          loading
                        }
                        className="group/approve flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >

                        <FaCheck className="group-hover/approve:scale-110 transition-transform" />

                        Approve

                      </button>


                      <button
                        onClick={() =>
                          updateRewardStatus(
                            reward.id,
                            'rejected'
                          )
                        }
                        disabled={
                          loading
                        }
                        className="group/reject flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >

                        <FaTimes className="group-hover/reject:scale-110 transition-transform" />

                        Reject

                      </button>

                    </div>

                  ) : (

                    <span className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium">

                      Processed

                    </span>

                  )}

                </td>

              </tr>

            );

          }

        )}

      </tbody>

    </table>

  </div>

</section>


      {/* LOADING INDICATOR */}

      {loading && (

        <div className="fixed bottom-5 right-5 bg-[#143640] text-white px-5 py-3 rounded-lg shadow">

          Updating...

        </div>

      )}


    </main>

  );

}


// ==========================================
// STAT CARD
// ==========================================

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
}) {

  return (

    <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

      {/* Decorative Glow */}

      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#E7B548]/10 rounded-full blur-2xl group-hover:bg-[#E7B548]/20 transition-all duration-300" />


      <div className="relative p-6">

        {/* Icon */}

        <div className="flex items-center justify-between mb-5">

          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#143640]/5 text-[#143640] group-hover:bg-[#143640] group-hover:text-[#E7B548] transition-all duration-300">

            <span className="text-xl">

              {icon}

            </span>

          </div>

        </div>


        {/* Value */}

        <h3 className="text-3xl md:text-4xl font-extrabold text-[#143640] tracking-tight">

          {value.toLocaleString()}

        </h3>


        {/* Title */}

        <p className="text-gray-500 font-medium mt-2">

          {title}

        </p>


        {/* Bottom Line */}

        <div className="mt-5 h-1 w-12 rounded-full bg-[#E7B548] group-hover:w-20 transition-all duration-300" />

      </div>

    </div>

  );

}




