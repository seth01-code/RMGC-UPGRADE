// src/client/i18n.ts
"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// import your translations
import en from "../../public/locales/en/translation.json";

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: { translation: en },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
