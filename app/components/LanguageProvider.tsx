"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  translations,
  Language,
} from "@/lib/translations";

type Translation = (typeof translations)[Language];

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translation;
};

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "atoz-language"
    ) as Language | null;

    if (
      savedLanguage === "ar" ||
      savedLanguage === "en"
    ) {
      setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;

    document.documentElement.dir =
      language === "ar" ? "rtl" : "ltr";

    localStorage.setItem(
      "atoz-language",
      language
    );
  }, [language]);

  function setLanguage(newLanguage: Language) {
    setLanguageState(newLanguage);
  }

  const t = translations[language];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}