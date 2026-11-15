# GitHub and Free Deployment Guide

This guide takes the CIPHER project from the downloaded ZIP to a new GitHub repository and a public HTTPS website hosted on Cloudflare Pages.

## Before starting

Keep the old GitHub repository until the new repository and live website have both been verified. Deleting the old repository immediately can break its URL, issue history, stars, forks and links already shared with other people. If you want a clean slate, make the old repository private or archive it after the new one is working.

You need:
- A GitHub account
- A Cloudflare account
- Git installed on Windows
- Node.js 22.23.4 or newer in the Node 22 line, or another version supported by the project dependencies

## Part A — Prepare the project on your computer

1. Download and extract the latest CIPHER project ZIP.
2. Open the extracted project folder in VS Code.
3. Confirm that `package.json`, `package-lock.json`, `README.md`, `.gitignore`, `.nvmrc`, `src/` and `docs/` are directly inside the folder you opened. Do not open the parent folder that merely contains the project folder.
4. Open VS Code Terminal > New Terminal.
5. Check your tools:

```bash
node --version
npm --version
git --version
```

6. Install dependencies and verify the production build:

```bash
npm ci
npm run build
```

If `npm ci` fails, read the first meaningful error in the terminal. Do not delete `package-lock.json` just to make the error disappear.

The build should create a `dist/` folder. The `dist/` folder is generated output and should not be committed to GitHub.

## Part B — Create a new GitHub repository

1. Open [https://github.com/new](https://github.com/new).
2. Repository name suggestion: `CIPHER` or `cipher-steganography`.
3. Add a short description, for example:

   `A browser-based image steganography and metadata toolkit using AES-256-GCM and RGB LSB encoding.`

4. Choose **Public** if you want recruiters, classmates and evaluators to inspect the source code.
5. Do not select Add a README, Add .gitignore or Choose a license. The project already contains a README and `.gitignore`.
6. Click **Create repository**.
7. Keep the page open. GitHub will show the repository URL.

A public repository makes source code public. Never commit passwords, API secrets, private keys, `.env` files or personal data.

## Part C — Push the project to GitHub

In VS Code, make sure the terminal is at the project root, the folder containing `package.json`.

If this extracted folder does not already have a `.git` directory, run:

```bash
git init
git branch -M main
git add .
git status
```

Review the `git status` output. Confirm that `node_modules`, `dist`, `.env` and local user data are not staged. The project's `.gitignore` should exclude these.

Create the first commit:

```bash
git commit -m "Initial release of CIPHER"
```

Connect the new GitHub repository. Replace the URL with the exact URL GitHub gave you:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_NEW_REPOSITORY.git
git push -u origin main
```

If Git says `remote origin already exists`, inspect it:

```bash
git remote -v
```

If it points to the old repository and you intentionally want to use the new one, update it:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_NEW_REPOSITORY.git
git push -u origin main
```

If Git asks you to authenticate, complete the browser sign-in flow. Do not paste a GitHub password or personal access token into this chat.

### Confirm the upload

Refresh the new GitHub repository page. You should see:
- `src/`
- `public/`
- `docs/`
- `README.md`
- `package.json`
- `package-lock.json`
- `.gitignore`
- `.nvmrc`

Open `README.md` on GitHub and click `docs/PROJECT_DOCUMENTATION.md` to verify that the detailed documentation is visible.

## Part D — Deploy on Cloudflare Pages for free

Cloudflare Pages is a good fit because CIPHER is a static React/Vite application. It does not need a continuously running server.

1. Open [https://dash.cloudflare.com/](https://dash.cloudflare.com/) and sign in or create an account.
2. Open **Workers & Pages**.
3. Select **Create application**.
4. Choose **Pages** and then **Import an existing Git repository**.
5. Connect GitHub if asked.
6. Select the new CIPHER repository.
7. Configure the build:

| Setting | Value |
|---|---|
| Project name | `cipher` or another available name |
| Production branch | `main` |
| Framework preset | `Vite` if offered; otherwise configure manually |
| Root directory | `/` (repository root) |
| Build command | `npm run build` |
| Build output directory | `dist` |

8. In build environment variables, set:

```text
NODE_VERSION = 22.23.4
```

The repository also includes `.nvmrc` with the same version, so the local and hosted Node version are aligned.

9. Select **Save and Deploy**.
10. Wait for the build to finish. Open the generated address, normally:

```text
https://YOUR-PROJECT-NAME.pages.dev
```

The first deployment can take a few minutes.

## Part E — Test the live website

Do not stop at the homepage. Test direct routes, refresh and actual browser functionality.

Open these paths directly, replacing the domain with your real Pages URL:

```text
/
 /technology
 /learn/steganography
 /learn/aes
 /learn/pbkdf2
 /learn/lsb
 /learn/png
 /learn/webcrypto
 /studio
 /studio/vault
 /studio/metadata
 /studio/metadata-editor
 /studio/cleaner
 /studio/clear-payload
```

For each route:
- Open it directly in a new browser tab.
- Refresh the page.
- Confirm it does not show a host-level 404.
- Test navigation and browser back/forward.

Then test the important product workflows:
1. Upload a JPEG or another supported input.
2. Hide a short test message.
3. Download the generated PNG.
4. Upload that PNG and decrypt it with the correct key.
5. Try a wrong key.
6. Confirm an encrypted image is saved in the Vault.
7. Download the Vault image and copy its key.
8. Edit PNG metadata and inspect the result.
9. Remove one selected metadata entry.
10. Clean metadata and verify the hidden payload is still present.
11. Clear the hidden payload using the separate Payload Cleaner.

Use test messages and test keys, not real sensitive information.

## Part F — Automatic updates after publishing

Once Cloudflare Pages is connected to the GitHub repository, updates are simple.

After changing code:

```bash
git status
git add .
git commit -m "Describe the update"
git push
```

Cloudflare Pages detects the push to `main`, runs the build and publishes the new version automatically.

You can check deployment progress in Cloudflare > Workers & Pages > your CIPHER project > Deployments.

If a deployment fails, open its build log. Fix the first build error, commit the fix and push again.

## Part G — Should the old repository be deleted?

My recommendation: **do not delete it yet**.

After the new repository is public and the new Pages URL works:
- Update your LinkedIn/GitHub profile links to the new repository.
- Update any project links in your resume.
- If you no longer want the old repository active, archive it or make it private.
- Delete it only if you are certain you do not need its history or existing URL.

## Is GitHub README the same as documentation?

They are related, but they serve different purposes.

- **README.md** is the front page of the repository. It should quickly explain what the project is, list key features, show how to install/run it and link to the full documentation.
- **Detailed documentation** explains the design and implementation in depth: architecture, algorithms, payload format, metadata behaviour, limitations, security, testing and deployment.

GitHub renders Markdown files directly, so `docs/PROJECT_DOCUMENTATION.md` is readable in the browser. The README links to it. This gives visitors a short introduction and a detailed technical document without making the repository front page enormous.

## Free hosting: what “free” means

Cloudflare Pages currently offers a Free plan suitable for small static projects. Its documented free-plan limits include a maximum of 500 builds per month, 1 concurrent build and a 25 MiB maximum individual static asset size. Limits and plan terms can change.

The `pages.dev` subdomain is free. A custom domain name is generally not free; buying and renewing a domain costs money.

No provider can promise that a free service will remain free forever. For a small educational portfolio project, Cloudflare Pages is a sensible zero-cost starting point, but keep a local copy of the source and the ability to redeploy elsewhere.

## Official references

- [Cloudflare Pages: Deploy a React site](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
- [Cloudflare Pages: Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Cloudflare Pages: Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages: Build image and Node.js version](https://developers.cloudflare.com/pages/configuration/build-image/)
- [Cloudflare Pages: Free-plan limits](https://developers.cloudflare.com/pages/platform/limits/)
- [GitHub: Create a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository)
- [GitHub: Adding locally hosted code to GitHub](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)
