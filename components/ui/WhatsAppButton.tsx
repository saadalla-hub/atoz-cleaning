"use client";

export default function WhatsAppButton() {
  const phone = "201000000000"; // غيّر الرقم لاحقًا

  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full bg-[#25D366] shadow-2xl hover:scale-110 transition-transform duration-300"
      aria-label="Chat on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-8 h-8 fill-white"
      >
        <path d="M16 .4C7.4.4.4 7.3.4 15.9c0 2.8.7 5.5 2.1 7.9L0 32l8.5-2.2c2.3 1.3 4.8 1.9 7.5 1.9 8.6 0 15.6-6.9 15.6-15.5S24.6.4 16 .4zm8.9 22.3c-.4 1-2.1 1.9-2.9 2-.8.1-1.8.2-5.8-1.5-5-2.2-8.2-7.5-8.5-7.9-.3-.4-2-2.6-2-5 0-2.3 1.2-3.5 1.6-4 .4-.4.9-.5 1.2-.5h.9c.3 0 .7-.1 1 .7.4 1 .9 2.5 1 2.7.1.2.2.5 0 .8-.2.3-.3.5-.6.8-.3.3-.5.6-.7.8-.2.2-.4.5-.2.9.2.4 1.1 1.9 2.4 3 .7.7 1.7 1.5 2.7 2 .4.2.7.2.9-.1.3-.3.7-.8 1-1.2.2-.3.5-.3.9-.2.3.1 2.2 1 2.6 1.2.4.2.7.3.8.5.1.2.1 1-.3 2z"/>
      </svg>
    </a>
  );
}