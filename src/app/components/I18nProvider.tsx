// src/components/I18nProvider.tsx
"use client";

import React from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../client/i18n";

interface Props {
  children: React.ReactNode;
}

const I18nProvider: React.FC<Props> = ({ children }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default I18nProvider;
