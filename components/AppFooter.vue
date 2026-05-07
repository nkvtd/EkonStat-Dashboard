<script setup lang="ts">
import { LogoGithub } from "@vicons/ionicons5";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = withDefaults(
    defineProps<{
        variant?: "page" | "drawer";
    }>(),
    {
        variant: "page",
    },
);

const { t } = useI18n();

const isDrawer = computed(() => props.variant === "drawer");

const dashboardRepoHref = "https://github.com/nkvtd/EkonStat-Dashboard";
const apiRepoHref = "https://github.com/nkvtd/EkonStat-API";
</script>

<template>
    <footer
        class="bg-background"
        :class="isDrawer ? 'px-4 py-3' : 'px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-4'"
    >
       <div
           class="mx-auto w-full border-t border-muted pt-2.5 sm:pt-3"
           :class="isDrawer ? 'max-w-none' : 'max-w-336'"
        >
            <div class="flex flex-col items-center justify-center text-center">
                <nav
                    :aria-label="t('footer.repositories')"
                    class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
                >
                    <a
                        :href="dashboardRepoHref"
                       target="_blank"
                       rel="noopener noreferrer"
                        class="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent transition-colors duration-150 hover:text-primary"
                   >
                        <LogoGithub class="h-3.5 w-3.5 shrink-0" />
                        <span>EkonStat-Dashboard</span>
                    </a>
                
                    <a
                        :href="apiRepoHref"
                        target="_blank"
                        rel="noopener noreferrer"
                       class="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent transition-colors duration-150 hover:text-primary"
                   >
                        <LogoGithub class="h-3.5 w-3.5 shrink-0" />
                        <span>EkonStat-API</span>
                    </a>
                </nav>
            
                <p
                    class="mt-2 text-sm font-medium leading-5 text-accent sm:text-[15px]"
                    :class="isDrawer ? 'max-w-xs' : 'max-w-md'"
               >
                    {{ t('footer.poweredBy') }}
                   <span class="font-semibold text-content">EkonStat-API</span>
                </p>
            </div>
        </div>
    </footer>
</template>