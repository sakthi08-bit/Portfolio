# Sakthi Kumaran — Portfolio

> **"Building ideas into digital experiences."**

Personal portfolio website of **Sakthi Kumaran** — **Coder | Developer | Cybersecurity Enthusiast**.  
Showcasing software engineering builds, Python & Bash security tooling, embedded systems exploration, and interactive web experiences.

🌐 **Live Website:** [https://sakthi08-bit.github.io](https://sakthi08-bit.github.io)

---

## ✨ Features & Design Language

- **Editorial Dark Aesthetic** — Deep charcoal canvas (`#0b0b0a`), warm off-white typography (`#ecebe6`), muted warm greys, signature orange accent (`#ff5b25`), and subtle film grain texture.
- **Refined Typography** — `Geist` & `Geist Mono` paired with expressive italic `Instrument Serif` display accents.
- **Motion & Smooth Scrolling** — Powered by **GSAP**, **ScrollTrigger**, and **Lenis** smooth scroll with character/word split reveals, scroll-scrubbed statement fill, velocity-reactive marquee, and pinned horizontal project gallery.
- **Interactive Hero Canvas** — Real-time HTML5 `<canvas>` wavelet dot-matrix background reactive to pointer movement.
- **Preloader & Custom Cursor** — `0–100` tabular loading sequence and responsive desktop magnetic cursor with contextual action labels.
- **Interactive Terminal (`~ $`)** — Press `` ` `` (backtick) anywhere on the site to open a built-in command-line drawer (`help`, `whoami`, `projects`, `skills`, `experience`, `contact`, `socials`, `edit`).
- **Accessibility First** — Semantic HTML, keyboard navigation, high-contrast focus states, and full `prefers-reduced-motion` support.

---

## 📂 Website Sections

1. **Hero** — Oversized editorial typography, live IST clock, rotating focus roles, and interactive dot-matrix canvas.
2. **About** — Personal introduction, sticky portrait frame (with customizable photo/monogram plate), core facts, and key metrics.
3. **Experience & Learning Journey** — Expandable accordion detailing hands-on progress across Cybersecurity/CTFs, Embedded Systems (`C/C++`), and Python Automation.
4. **Selected Projects** — Featured *NetRecon Suite* live topology mockup alongside a horizontal scroll-pinned showcase (*Network Scanner*, *Web Vuln Scanner*, *Password Auditor*, *WiFi Monitor Utility*) with inspectable project modals.
5. **Skills & Arsenal** — Structured breakdown of programming languages, security domains, offensive/defensive tools, embedded systems, and platforms.
6. **Additional Work** — *Task Automation Framework*, *CTF Solver Toolkit*, and *Editorial Web Experiences*, followed by a collaboration showcase band.
7. **Contact** — One-click email copy, direct Email & WhatsApp message launcher, and verified social channels.
8. **Footer** — Editorial quote, terminal launcher, full-width fitted wordmark, and credits.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 + Custom Editorial Design Tokens
- **Animations:** GSAP + ScrollTrigger
- **Smooth Scroll:** Lenis

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** `v18+` and **npm**

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/sakthi08-bit/sakthi08-bit.github.io.git
cd sakthi08-bit.github.io

# Install dependencies
npm install

# Start local development server (http://localhost:3000)
npm run dev
```

### Production Build

```bash
# Type-check and build static production bundle into dist/
npm run lint
npm run build

# Preview production build locally
npm run preview
```

---

## 🌍 Deployment

### GitHub Pages (`sakthi08-bit.github.io`) — Zero White Screen Setup
This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`) and relative asset paths (`base: './'`) so Vite compiles TypeScript/React automatically on every push:

1. Push all files (including the hidden `.github/workflows/deploy.yml` folder) to your GitHub repository (`sakthi08-bit.github.io`).
2. In your GitHub repository, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, change `"Deploy from a branch"` to **`GitHub Actions`**.
4. Open the **Actions** tab to watch the automatic build finish (~45 seconds). Your portfolio will be live at **[https://sakthi08-bit.github.io](https://sakthi08-bit.github.io)**.

### Cloudflare Pages
```bash
npm run build
npx wrangler pages deploy dist --project-name=sakthi-kumaran-portfolio
```

---

## 📬 Connect

- **Portfolio:** [https://sakthi08-bit.github.io](https://sakthi08-bit.github.io)
- **GitHub:** [@sakthi08-bit](https://github.com/sakthi08-bit)
- **Email:** [sakthisd.tech@gmail.com](mailto:sakthisd.tech@gmail.com)
- **WhatsApp:** [+91 9791226279](https://wa.me/919791226279)
- **Instagram:** `_.sakthyyy._08._`

---

## 📄 Credits

- Designed and developed by **Sakthi Kumaran**.
- **Created and Managed by NEXUS ENTERPRISES**
