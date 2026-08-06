"use client";

import * as React from "react";
import { translations, type Locale, type TranslationKey } from "./translations";
import { useAuthStore } from "@/stores/auth-store";

interface I18nContextValue {
  locale: Locale;
  t: (key: TranslationKey) => string;
}

const I18nContext = React.createContext<I18nContextValue>({
  locale: "en",
  t: (key) => translations.en[key],
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const language = useAuthStore((s) => s.user?.preferences?.language ?? "en");
  const locale: Locale = (language === "hi" ? "hi" : "en");

  const t = React.useCallback(
    (key: TranslationKey): string => {
      return translations[locale][key] ?? translations.en[key] ?? key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return React.useContext(I18nContext);
}
