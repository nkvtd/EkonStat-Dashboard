import { nextTick } from "vue";
import { createI18n } from "vue-i18n";

export const SUPPORT_LOCALES = ["MK", "EN", "AL"] as const;
export type AppLocale = (typeof SUPPORT_LOCALES)[number];

const localeLoaders = import.meta.glob("./*.json");

function isAppLocale(value: string | null): value is AppLocale {
    return SUPPORT_LOCALES.includes(value as AppLocale);
}

export function getDefaultLocale(): AppLocale {
    if (typeof window === "undefined") {
        return "MK";
    }

    const savedLocale = localStorage.getItem("lang");
    return isAppLocale(savedLocale) ? savedLocale : "MK";
}

export const i18n = createI18n({
    legacy: false,
    locale: "MK",
    fallbackLocale: "MK",
    messages: {},
});

export function setI18nLanguage(locale: AppLocale) {
    i18n.global.locale.value = locale;

    if (typeof document !== "undefined") {
        document.documentElement.setAttribute("lang", locale.toLowerCase());
    }

    if (typeof window !== "undefined") {
        localStorage.setItem("lang", locale);
    }
}

export async function loadLocaleMessages(locale: AppLocale) {
    const path = `./${locale.toLowerCase()}.json`;
    const loader = localeLoaders[path];

    if (!loader) {
        throw new Error(`Locale file not found: ${path}`);
    }

    const messagesModule = await loader();
    i18n.global.setLocaleMessage(locale, messagesModule.default);
    return nextTick();
}

export async function setupI18n() {
    const locale = getDefaultLocale();

    if (!i18n.global.availableLocales.includes(locale)) {
        await loadLocaleMessages(locale);
    }

    setI18nLanguage(locale);
    return i18n;
}
