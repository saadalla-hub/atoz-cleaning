import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A to Z App | Coming Soon",
  description:
    "The A to Z Cleaning Services mobile app is coming soon.",
};

export default function AppComingSoonPage() {
  return (
    <main className="min-h-screen bg-[#143640] px-5 py-10 text-white sm:px-8">
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <div className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0F2B34] px-6 py-10 text-center shadow-2xl sm:px-12 sm:py-14">

          {/* Gold glow */}
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#E7B548]/10 blur-3xl" />

          {/* Logo */}
          <div className="relative mx-auto mb-7 flex justify-center">
            <Image
              src="/images/logo/atoz-logo-new.png"
              alt="A to Z Cleaning Services"
              width={300}
              height={150}
              className="h-auto w-[220px] object-contain sm:w-[280px]"
              priority
            />
          </div>

          {/* English */}
          <section>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#E7B548]">
              Mobile Application
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Our App Is
              <span className="block text-[#E7B548]">
                Coming Soon
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
              A smarter and easier way to book and manage your cleaning
              services is coming soon.
            </p>
          </section>

          {/* Divider */}
          <div className="mx-auto my-8 flex max-w-xl items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-sm text-[#E7B548]">✦</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Arabic */}
          <section
            dir="rtl"
            style={{ fontFamily: "Arial, Tahoma, sans-serif" }}
          >
            <p className="text-sm font-bold text-[#E7B548]">
              تطبيق الهاتف المحمول
            </p>

            <h2 className="mt-4 text-3xl font-extrabold leading-relaxed sm:text-4xl">
              تطبيقنا{" "}
              <span className="text-[#E7B548]">
                قريباً
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
              طريقة أسهل وأذكى لحجز وإدارة خدمات التنظيف ستكون متاحة قريباً.
            </p>
          </section>

          {/* Store Buttons */}
          <div className="mx-auto mt-9 grid max-w-xl gap-4 sm:grid-cols-2">

            {/* Google Play */}
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3.5 2.8 13.9 13 3.5 23.2c-.3-.4-.5-.9-.5-1.5V4.3c0-.6.2-1.1.5-1.5Z" />
                  <path d="m15 11.9 2.8-1.6 3.1 1.8c.5.3.5 1 0 1.3l-3.1 1.8-2.8-1.6.9-.9-.9-.8Z" />
                  <path d="m4.3 2.5 11.7 6.7-2.1 2.1L4.3 2.5Z" />
                  <path d="m4.3 21.5 9.6-8.8 2.1 2.1-11.7 6.7Z" />
                </svg>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/45">
                  Coming Soon On
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  Google Play
                </p>

                <p
                  className="mt-0.5 text-xs font-semibold text-[#E7B548]"
                  dir="rtl"
                  style={{ fontFamily: "Arial, Tahoma, sans-serif" }}
                >
                  متوفر قريباً
                </p>
              </div>
            </div>

            {/* App Store */}
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.09.8 1.2-.24 2.35-.93 3.63-.84 1.54.13 2.7.74 3.46 1.83-3.18 1.9-2.43 6.08.49 7.24-.58 1.53-1.33 3.04-2.67 3.94ZM12.03 7.25C11.88 4.97 13.73 3.1 15.88 2.92c.3 2.63-2.38 4.61-3.85 4.33Z" />
                </svg>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/45">
                  Coming Soon On
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  App Store
                </p>

                <p
                  className="mt-0.5 text-xs font-semibold text-[#E7B548]"
                  dir="rtl"
                  style={{ fontFamily: "Arial, Tahoma, sans-serif" }}
                >
                  متوفر قريباً
                </p>
              </div>
            </div>

          </div>

          {/* Website Booking Message */}
          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-[#E7B548]/20 bg-[#E7B548]/[0.06] px-5 py-5">

            <p className="text-sm font-semibold leading-6 text-white/80">
              Can’t wait for the app? You can still book your cleaning
              service today through our website.
            </p>

            <p
              className="mt-3 text-sm font-semibold leading-7 text-white/80"
              dir="rtl"
              style={{ fontFamily: "Arial, Tahoma, sans-serif" }}
            >
              لا تريد الانتظار حتى إطلاق التطبيق؟ يمكنك حجز خدمة التنظيف الآن
              عبر موقعنا الإلكتروني.
            </p>

          </div>

          {/* Create Account */}
          <div className="mt-9">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#E7B548] px-8 py-3.5 font-bold text-[#0F2B34] transition hover:bg-[#D4A63A]"
            >
              Create Account
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}