This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Vendor Test on Vercel Preview

`/vendor-test` and `/api/v1/vendor/auth/dev-test-login` are enabled on Vercel Preview only when `ENABLE_DEV_TEST_VENDOR=true`. Vercel sets `VERCEL_ENV` automatically; do not set it manually. Keep the flag unset or `false` in Production.

For separate frontend and backend Vercel projects, configure these variables in the **Preview** environment:

- **Frontend:** `ENABLE_DEV_TEST_VENDOR=true` and `NEXT_PUBLIC_API_URL` pointing to the matching Preview backend.
- **Backend:** `ENABLE_DEV_TEST_VENDOR=true`, `TEST_VENDOR_EMAIL`, `TEST_VENDOR_PASSWORD`, `MONGODB_URI`, `MONGODB_DB_NAME`, `DEV_TEST_VENDOR_DB_NAME`, `PRODUCTION_MONGODB_DB_NAME`, and `ALLOWED_ORIGINS`.

Use a dedicated Preview MongoDB database and credentials: `MONGODB_DB_NAME` must equal `DEV_TEST_VENDOR_DB_NAME`, and that name must differ from `PRODUCTION_MONGODB_DB_NAME`. Provision the Vendor Test account in that Preview database. Set `ALLOWED_ORIGINS` to the exact Preview frontend origin so the login request and session cookie work across the two deployments. Do not expose test credentials through `NEXT_PUBLIC_` variables or client code.

For local development, the page remains available; the login endpoint additionally requires `ENABLE_DEV_TEST_VENDOR=true`, a provisioned test account, and the test credentials. Production remains disabled regardless of `NODE_ENV`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
