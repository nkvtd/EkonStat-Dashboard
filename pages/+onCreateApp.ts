export { onCreateApp };

import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import type { PageContext } from "vike/types";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});

function onCreateApp(pageContext: PageContext) {
    // biome-ignore lint/style/noNonNullAssertion: <Required by vike, which guarantees that `app` is always defined in `pageContext`>
    const app = pageContext.app!;

    app.use(VueQueryPlugin, { queryClient });
}
