Follow the steps below to finish setting up your application.

## Cloudflare Workers

Run [`wrangler types`](https://developers.cloudflare.com/workers/wrangler/commands/#types) to generate the `worker-configuration.d.ts` file:

```sh
npx wrangler types
```

> Re-run it whenever you change your Cloudflare configuration to update `worker-configuration.d.ts`.

Then commit `worker-configuration.d.ts`:

```sh
git commit -am "add cloudflare types"
```

See also: https://vike.dev/cloudflare#typescript

