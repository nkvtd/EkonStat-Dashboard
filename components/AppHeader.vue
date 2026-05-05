<script setup lang="ts">
import {
    Dismiss24Regular,
    Globe24Regular,
    Navigation24Regular,
    WeatherMoon24Regular,
    WeatherSunny24Regular,
} from "@vicons/fluent";
import { LogoDiscord, LogoGithub } from "@vicons/ionicons5";
import { usePageContext } from "vike-vue/usePageContext";
import { computed, onMounted, onUnmounted, ref } from "vue";
import Logo from "./Logo.vue";

const pageContext = usePageContext();

const getCurrentPath = () => {
    if (pageContext.urlPathname) return pageContext.urlPathname;
    if (typeof window !== "undefined") return window.location.pathname;
    return "/";
};

const routePath = computed(() => getCurrentPath());

const isMobileMenuOpen = ref(false);
const isDark = ref(false);
const currentLang = ref("MK");

const isLangDropdownOpen = ref(false);
const langDropdownRef = ref<HTMLElement | null>(null);

const isMobileLangDropdownOpen = ref(false);
const mobileLangDropdownRef = ref<HTMLElement | null>(null);

const navItems = [
    { label: "Дома", href: "/" },
    { label: "Тендери", href: "/contracts" },
    { label: "Трезор", href: "/treasury" },
];

const languages = ["MK", "EN", "AL"];
const discordHref = ""; // add real link later

const applyTheme = (dark: boolean) => {
    document.documentElement.classList.toggle("dark", dark);
};

const toggleTheme = () => {
    isDark.value = !isDark.value;
    applyTheme(isDark.value);
    localStorage.setItem("theme", isDark.value ? "dark" : "light");
};

const toggleLangDropdown = () => {
    isLangDropdownOpen.value = !isLangDropdownOpen.value;
    if (isLangDropdownOpen.value) {
        isMobileLangDropdownOpen.value = false;
    }
};

const toggleMobileLangDropdown = () => {
    isMobileLangDropdownOpen.value = !isMobileLangDropdownOpen.value;
    if (isMobileLangDropdownOpen.value) {
        isLangDropdownOpen.value = false;
    }
};

const setLanguage = (lang: string) => {
    currentLang.value = lang;
    localStorage.setItem("lang", lang);
    isLangDropdownOpen.value = false;
    isMobileLangDropdownOpen.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
    if (
        langDropdownRef.value &&
        !langDropdownRef.value.contains(e.target as Node)
    ) {
        isLangDropdownOpen.value = false;
    }

    if (
        mobileLangDropdownRef.value &&
        !mobileLangDropdownRef.value.contains(e.target as Node)
    ) {
        isMobileLangDropdownOpen.value = false;
    }
};

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

onMounted(() => {
    isDark.value = localStorage.getItem("theme") === "dark";
    currentLang.value = localStorage.getItem("lang") || "MK";
    applyTheme(isDark.value);
    document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
});

const toSectionPath = (path: string) => {
    path = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

    if (path === "/") return "/";

    const firstSegment = path.match(/^\/[^/]+/)?.[0];
    return firstSegment ?? path;
};

const isNavActive = (activePath: string, href: string) => {
    return toSectionPath(activePath) === toSectionPath(href);
};

const handleNavClick = () => {
    isMobileMenuOpen.value = false;
};
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-muted bg-content text-white dark:bg-background"
  >
    <div class="border-b border-white/15 px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-start justify-between gap-4">
        <div class="flex min-w-0 items-center gap-3 sm:gap-4">
          <Logo class="h-11 w-11 shrink-0 sm:h-12 sm:w-12" />

          <div class="min-w-0 pr-2">
            <h1 class="text-lg font-bold leading-tight text-white sm:text-xl">
              Економски Статистики
            </h1>
            <p class="mt-1 text-sm leading-tight text-white/75">
              Јавно достапни податоци, на едно место
            </p>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <div class="hidden md:flex items-center border border-white/15 bg-white/5">
            <a
              href="https://github.com/nkvtd/EkonStat-Dashboard"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-11 w-11 items-center justify-center border-r border-white/15 text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white"
              aria-label="GitHub"
            >
              <LogoGithub class="h-5 w-5" />
            </a>

            <a
              href="https://discord.gg/"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-11 w-11 items-center justify-center text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white"
              aria-label="Discord"
            > <!-- TODO: add actual discord link -->
              <LogoDiscord class="h-5 w-5" />
            </a>
          </div>

          <button
            @click="toggleMobileMenu"
            class="flex h-11 w-11 items-center justify-center border border-white/15 bg-white/5 text-white/85 transition-colors duration-150 hover:bg-white/10 md:hidden"
            :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
          >
            <Navigation24Regular v-if="!isMobileMenuOpen" class="h-6 w-6" />
            <Dismiss24Regular v-else class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <div class="hidden md:flex items-stretch justify-between border-t border-white/15">
      <nav class="flex min-w-0 flex-1 items-stretch">
        <a
          v-for="item in navItems"
          :key="item.href"
          :href="item.href"
          @click="handleNavClick"
          class="flex min-h-12 items-center border-r border-white/15 px-5 text-sm font-semibold text-white/80 "
          :class="isNavActive(routePath, item.href) ? 'bg-primary text-black hover:bg-primary/50' : 'hover:bg-white/8 hover:text-white'"
        >
          {{ item.label }}
        </a>
      </nav>

     <div class="flex shrink-0 items-stretch border-l border-white/15">
       <button
         @click="toggleTheme"
          class="flex min-h-12 items-center gap-2 border-r border-white/15 px-4 text-sm font-medium text-white/80 hover:bg-white/8 hover:text-white"
         :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
       >
         <WeatherSunny24Regular v-if="isDark" class="h-5 w-5" />
         <WeatherMoon24Regular v-else class="h-5 w-5" />
       </button>

       <div ref="langDropdownRef" class="relative">
         <button
           @click.stop="toggleLangDropdown"
           class="flex min-h-12 items-center gap-2 px-4 text-sm font-medium text-white/80 hover:bg-white/8 hover:text-white"
         >
           <Globe24Regular class="h-5 w-5" />
           <span>{{ currentLang }}</span>
         </button>

         <div
           v-if="isLangDropdownOpen"
            class="absolute right-0 top-full z-50 mt-0 min-w-22 border border-white/15 bg-content dark:bg-background"
          >
            <button
              v-for="lang in languages"
              :key="lang"
             @click="setLanguage(lang)"
             class="flex h-11 w-full items-center justify-center border-b border-white/15 px-3 text-sm font-medium text-white/85 last:border-b-0 "
             :class="lang === currentLang ? 'bg-primary text-black hover:bg-primary/75' : 'hover:bg-white/8'"
            >
              {{ lang }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isMobileMenuOpen"
      class="border-t border-white/15 bg-content dark:bg-background md:hidden"
    >
      <div class="px-4 py-4 sm:px-6">
        <nav class="grid border border-white/15">
          <a
            v-for="item in navItems"
            :key="item.href"
            :href="item.href"
            @click="handleNavClick"
            class="flex min-h-12 items-center justify-center border-b border-white/15 px-4 text-center text-sm font-semibold text-white/85 last:border-b-0 "
            :class="isNavActive(routePath, item.href) ? 'bg-primary text-black hover:bg-primary/50 hover:text-white' : 'hover:bg-white/8 hover:text-white'"
          >
            {{ item.label }}
          </a>
        </nav>

        <div class="mt-4 grid border border-white/15">
          <button
            @click="toggleTheme"
            class="flex min-h-12 items-center justify-between border-b border-white/15 px-4 text-sm font-medium text-white"
          >
            <span>Тема</span>
            <span class="flex items-center gap-2 text-white/75">
              <WeatherSunny24Regular v-if="isDark" class="h-5 w-5" />
              <WeatherMoon24Regular v-else class="h-5 w-5" />
            </span>
          </button>

          <div ref="mobileLangDropdownRef" class="relative">
            <button
              @click.stop="toggleMobileLangDropdown"
              class="flex min-h-12 w-full items-center justify-between px-4 text-sm font-medium text-white"
            >
              <span>Јазик</span>
              <span class="flex items-center gap-2 text-white/75">
                <Globe24Regular class="h-5 w-5" />
                <span>{{ currentLang }}</span>
              </span>
            </button>

            <div
              v-if="isMobileLangDropdownOpen"
              class="border-t border-white/15 bg-white/5"
            >
              <button
                v-for="lang in languages"
                :key="lang"
                @click="setLanguage(lang)"
                class="flex h-11 w-full items-center justify-center border-b border-white/15 text-sm font-medium text-white/85 last:border-b-0"
                :class="lang === currentLang ? 'bg-primary text-black' : ''"
              >
                {{ lang }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4 flex border border-white/15">
          <a
            href="https://github.com/nkvtd/EkonStat-Dashboard"
            target="_blank"
            rel="noopener noreferrer"
            class="flex h-11 flex-1 items-center justify-center border-r border-white/15 text-white/80 transition-colors duration-150 hover:bg-white/8 hover:text-white"
            aria-label="GitHub"
          >
            <LogoGithub class="h-5 w-5" />
          </a>

          <a
            href="https://discord.gg/"
            target="_blank"
            rel="noopener noreferrer"
            class="flex h-11 flex-1 items-center justify-center text-white/80 transition-colors duration-150 hover:bg-white/8 hover:text-white"
            aria-label="Discord"
          > <!-- TODO: add actual discord link -->
            <LogoDiscord class="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  </header>
</template>