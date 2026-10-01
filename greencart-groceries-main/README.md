# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Cloudflare Pages + Functions (recommended)
1. Commit and push your repo to GitHub.
2. Go to Cloudflare Pages and create a new project.
3. Connect your GitHub repo, choose branch `main`.
4. Set build command: `npm run build`.
5. Set publish directory: `dist`.
6. Configure the WhatsApp Cloud API variables below before accepting orders.
7. Configure the shared product catalog below.
8. Deploy. Your site will be available at `https://<project>.pages.dev`.

#### Shared product catalog and admin access

Products, sizes, categories, and today's-offer flags must use shared storage; browser `localStorage` is only a device-specific cache. To make changes in Admin appear on every phone:

1. In Cloudflare, create a KV namespace (for example `EC_SHOPPING_CATALOG`).
2. Open Workers & Pages > `ec-shopping-website` > Settings > Functions > KV namespace bindings. Add a binding with variable name `CATALOG` and select that namespace. Configure production and preview environments as needed.
3. In Settings > Variables and Secrets, add `ADMIN_PASSWORD` as a secret. Use a new strong password; the old demo password was not secure and is no longer supported.
4. Save the settings and redeploy the latest GitHub `main` deployment.
5. Sign in at `/admin` with the secret. On the first sign-in, the current device's previously saved product/category lists are copied into shared KV if those lists have not been initialized yet. Do this first from the device/browser that contains the latest admin edits.
6. A successful Admin save now confirms that changes synced. If the KV binding is missing, Admin displays a warning and product/category saves fail rather than pretending they synced.

The storefront reads the shared catalog when this binding exists and refreshes it on page load, return to the tab, and every 30 seconds. Without this KV binding, each device can only show its own browser-local changes and built-in defaults.

#### WhatsApp order notifications

Checkout sends orders from the backend directly to the shop's WhatsApp Business number; it does not open WhatsApp on the customer's device. To enable delivery:

1. Set up the WhatsApp Business Platform Cloud API and create an approved `new_order_notification` message template in `en_US`, with one body text parameter (for example, `New order received:\n{{1}}`).
2. In Cloudflare Pages > `ec-shopping-website` > Settings > Variables and Secrets, add these bindings for the production environment (and preview, if required):
	- `WHATSAPP_ACCESS_TOKEN` — secret access token for the WhatsApp Business account; never add this as a `VITE_` variable.
	- `WHATSAPP_PHONE_NUMBER_ID` — WhatsApp Cloud API sender phone-number ID.
	- `WHATSAPP_ADMIN_PHONE_NUMBER` — recipient shop number in international format, digits only (for example, `918078312105`).
	- `WHATSAPP_ORDER_TEMPLATE_NAME` — approved template name, default `new_order_notification`.
	- `WHATSAPP_TEMPLATE_LANGUAGE` — approved template language code, default `en_US`.
3. Save the settings and allow Cloudflare Pages to redeploy. The checkout shows an error and keeps the cart if required WhatsApp settings are missing or the notification fails.

For local development, copy `.env.example` to `.env` and provide the WhatsApp credentials. Export the values into the environment used to start `npm run dev:full`; the Vite frontend proxies `/api` to the local Node backend.

### Verify API routes
Your app calls:
- `/api/products`
- `/api/products/:id`
- `/api/categories`
- `/api/testimonials`
- `/api/checkout`

These are served by Cloudflare Pages Functions in `functions/api/*`.

### Custom domain
If you want a custom domain, add it in Cloudflare Pages > Custom domains and follow DNS setup.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)



### Quick version (all commands together):

git add .
git commit -m "update website"
git push origin main ###