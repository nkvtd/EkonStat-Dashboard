import type { Config } from "vike/types";
import vikeVue from "vike-vue/config";

const config: Config = {
    prerender: true,
    ssr: false,
    title: "EkonStat-Dashboard",
    description: "Tool for visualising economic statistics",

    extends: [vikeVue]
};

export default config;
