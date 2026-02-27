<div align="center">

<!-- Logo / Title -->
<img src="https://img.icons8.com/color/96/badge.png" width="80" alt="Credly Readme Stats" />

# credly-readme-stats

**Dynamic SVG cards for your [Credly](https://www.credly.com) badges — embed in any GitHub README.**

[![CI](https://github.com/ebenezer-isaac/credly-readme-stats/actions/workflows/ci.yml/badge.svg)](https://github.com/ebenezer-isaac/credly-readme-stats/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Coverage: 94%](https://img.shields.io/badge/Coverage-94%25-brightgreen.svg)](#)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](#)
[![Hono](https://img.shields.io/badge/Hono-4.7-E36002?logo=hono&logoColor=white)](#)
[![Deploy on Render](https://img.shields.io/badge/Render-Live-46E3B7?logo=render&logoColor=white)](https://credly-readme-stats.onrender.com)

[Live Demo](https://credly-readme-stats.onrender.com) &nbsp;&middot;&nbsp;
[Quick Start](#-quick-start) &nbsp;&middot;&nbsp;
[Card Types](#-card-types) &nbsp;&middot;&nbsp;
[Themes](#-themes) &nbsp;&middot;&nbsp;
[Self-Hosting](#-self-hosting)

</div>

---

## Preview

<div align="center">

<table>
<tr>
<td align="center"><strong>Stats Card</strong></td>
<td align="center"><strong>Badge Grid</strong></td>
</tr>
<tr>
<td>

<a href="https://credly-readme-stats.onrender.com">
  <img src="https://credly-readme-stats.onrender.com/api/stats?username=ebenezer-isaac.05496d7f&theme=tokyonight" alt="Stats Card" width="400" />
</a>

</td>
<td>

<a href="https://credly-readme-stats.onrender.com">
  <img src="https://credly-readme-stats.onrender.com/api/grid?username=ebenezer-isaac.05496d7f&theme=tokyonight&columns=3&rows=2" alt="Badge Grid" width="400" />
</a>

</td>
</tr>
<tr>
<td align="center"><strong>Timeline</strong></td>
<td align="center"><strong>Carousel</strong></td>
</tr>
<tr>
<td>

<a href="https://credly-readme-stats.onrender.com">
  <img src="https://credly-readme-stats.onrender.com/api/timeline?username=ebenezer-isaac.05496d7f&theme=tokyonight&max_items=3" alt="Timeline" width="400" />
</a>

</td>
<td>

<a href="https://credly-readme-stats.onrender.com">
  <img src="https://credly-readme-stats.onrender.com/api/carousel?username=ebenezer-isaac.05496d7f&theme=tokyonight&visible_count=3" alt="Carousel" width="400" />
</a>

</td>
</tr>
</table>

<a href="https://credly-readme-stats.onrender.com">
  <img src="https://credly-readme-stats.onrender.com/api/overview?username=ebenezer-isaac.05496d7f&theme=tokyonight&visible_count=4&card_width=600" alt="Overview Card" width="600" />
</a>

<br />
<sub><em>All cards render as pure SVG — no JavaScript, no tracking, no external requests at render time.</em></sub>

</div>

---

## ⚡ Quick Start

Replace `YOUR_USERNAME` with your Credly username (from `credly.com/users/YOUR_USERNAME`).

```md
![Credly Stats](https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME)
```

```md
![Badge Grid](https://credly-readme-stats.onrender.com/api/grid?username=YOUR_USERNAME)
```

```md
![Timeline](https://credly-readme-stats.onrender.com/api/timeline?username=YOUR_USERNAME)
```

```md
![Carousel](https://credly-readme-stats.onrender.com/api/carousel?username=YOUR_USERNAME)
```

```md
![Overview](https://credly-readme-stats.onrender.com/api/overview?username=YOUR_USERNAME)
```

> **Finding your username:** Go to your [Credly profile](https://www.credly.com) → look at the URL → `https://www.credly.com/users/your-username` → the part after `/users/` is your username.

---

## 🎴 Card Types

### Stats Card

Summary of your badge statistics with icons and footer sections.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `show_icons` | boolean | `true` | Show stat row icons |
| `hide` | string | `""` | Hide stats: `total`, `issuers`, `skills`, `active`, `expiring`, `top_issuers`, `top_skills` |
| `card_width` | number | `495` | Card width (300–800) |
| `line_height` | number | `25` | Stat row spacing |

### Badge Grid

Your badges in a configurable grid layout with images.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `columns` | number | `3` | Grid columns (1–6) |
| `rows` | number | `2` | Grid rows (1–10) |
| `badge_size` | number | `64` | Image size in px (32–128) |
| `show_name` | boolean | `true` | Show badge name |
| `show_issuer` | boolean | `false` | Show issuer name |
| `sort` | enum | `recent` | `recent` · `oldest` · `name` · `issuer` |
| `filter_issuer` | string | `""` | Comma-separated issuer filter |
| `filter_skill` | string | `""` | Comma-separated skill filter |
| `page` | number | `1` | Grid page for pagination |

### Timeline

Chronological timeline of your badge achievements.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `max_items` | number | `6` | Max entries (1–20) |
| `show_description` | boolean | `false` | Show badge description |
| `show_skills` | boolean | `true` | Show skill tags |
| `sort` | enum | `recent` | `recent` · `oldest` |
| `filter_issuer` | string | `""` | Issuer filter |
| `card_width` | number | `495` | Width (400–800) |

### Carousel

Animated sliding carousel with pure CSS animation.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `visible_count` | number | `5` | Visible badges at once (1–6) |
| `badge_size` | number | `64` | Badge image size in px (32–128) |
| `show_name` | boolean | `true` | Show badge name |
| `show_issuer` | boolean | `false` | Show issuer name |
| `interval` | number | `3` | Seconds per slide (1–10) |
| `sort` | enum | `recent` | `recent` · `oldest` · `name` · `issuer` |
| `filter_issuer` | string | `""` | Comma-separated issuer filter |
| `filter_skill` | string | `""` | Comma-separated skill filter |
| `max_items` | number | `12` | Max badges (3–30) |
| `card_width` | number | auto | Card width (200–800) |

### Overview

Stats summary + badge carousel — the all-in-one card.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `show_icons` | boolean | `true` | Show stat row icons |
| `hide` | string | `""` | Hide: `total`, `issuers`, `skills`, `active`, `expiring`, `top_issuers`, `top_skills`, `carousel` |
| `line_height` | number | `25` | Stat row spacing |
| `visible_count` | number | `5` | Carousel visible badges (1–6) |
| `badge_size` | number | `64` | Carousel badge size (32–128) |
| `show_name` | boolean | `true` | Show badge name in carousel |
| `show_issuer` | boolean | `false` | Show issuer in carousel |
| `interval` | number | `3` | Carousel seconds per slide (1–10) |
| `sort` | enum | `recent` | `recent` · `oldest` · `name` · `issuer` |
| `filter_issuer` | string | `""` | Issuer filter |
| `filter_skill` | string | `""` | Skill filter |
| `max_items` | number | `12` | Max carousel badges (3–30) |
| `card_width` | number | `550` | Card width (350–800) |

### Single Badge Detail

Full details for one specific badge.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `badge_id` | string | **required** | Badge ID from Credly |
| `show_description` | boolean | `true` | Show description |
| `show_skills` | boolean | `true` | Show skills |
| `show_issuer` | boolean | `true` | Show issuer |
| `card_width` | number | `400` | Width (300–600) |

---

## 🎨 Themes

**20 built-in themes.** Add `&theme=THEME_NAME` to any URL.

<div align="center">
<table>
<tr>
<td><code>default</code></td>
<td><code>dark</code></td>
<td><code>radical</code></td>
<td><code>merko</code></td>
</tr>
<tr>
<td><code>gruvbox</code></td>
<td><code>tokyonight</code></td>
<td><code>onedark</code></td>
<td><code>cobalt</code></td>
</tr>
<tr>
<td><code>synthwave</code></td>
<td><code>dracula</code></td>
<td><code>nord</code></td>
<td><code>catppuccin_mocha</code></td>
</tr>
<tr>
<td><code>catppuccin_latte</code></td>
<td><code>rose_pine</code></td>
<td><code>github_dark</code></td>
<td><code>github_light</code></td>
</tr>
<tr>
<td><code>aura</code></td>
<td><code>neon</code></td>
<td><code>react</code></td>
<td><code>vue</code></td>
</tr>
</table>
</div>

**Example:**

```md
![Stats](https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME&theme=dracula)
```

---

## 🔧 Customization

### Common Parameters

All card types accept these parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `username` | string | **required** | Credly username |
| `theme` | string | `default` | Theme preset |
| `title_color` | hex | theme | Title text color |
| `text_color` | hex | theme | Body text color |
| `icon_color` | hex | theme | Icon color |
| `bg_color` | hex/gradient | theme | Background color |
| `border_color` | hex | theme | Border color |
| `hide_border` | boolean | `false` | Hide card border |
| `hide_title` | boolean | `false` | Hide card title |
| `custom_title` | string | auto | Custom title text |
| `border_radius` | number | `4.5` | Border radius in px |
| `disable_animations` | boolean | `false` | Disable CSS animations |
| `cache_seconds` | number | `21600` | Cache TTL (7200–86400) |

### Custom Colors

Override individual colors with hex values (without `#`):

```md
![Stats](https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME&title_color=ff6e96&icon_color=79dafa&bg_color=282a36)
```

### Gradient Backgrounds

Use `angle,color1,color2,...` format:

```md
![Stats](https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME&bg_color=35,0d1117,1a1b27,2d2b55)
```

### GitHub Dark/Light Mode

Use `<picture>` tags to adapt to the viewer's GitHub theme:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME&theme=github_dark" />
  <source media="(prefers-color-scheme: light)" srcset="https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME&theme=github_light" />
  <img alt="Credly Stats" src="https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME" />
</picture>
```

---

## 🏗️ Self-Hosting

### Docker

```bash
git clone https://github.com/ebenezer-isaac/credly-readme-stats.git
cd credly-readme-stats
docker compose -f docker/docker-compose.yml up -d
```

### Node.js

```bash
git clone https://github.com/ebenezer-isaac/credly-readme-stats.git
cd credly-readme-stats
pnpm install
pnpm build
pnpm start
```

The server runs on port **3000** by default. Set `PORT` to change it.

### Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ebenezer-isaac/credly-readme-stats)

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment |

See [.env.example](.env.example) for optional cache and rate-limit overrides.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **API** | [Hono](https://hono.dev) + TypeScript + [@hono/node-server](https://github.com/honojs/node-server) |
| **Landing Page** | [Astro](https://astro.build) + React + Tailwind CSS |
| **SVG Rendering** | Template literals — no DOM dependency |
| **Cache** | In-memory LRU (badge data 6h, images 24h) |
| **Testing** | [Vitest](https://vitest.dev) (94% coverage) + [Playwright](https://playwright.dev) E2E |
| **Monorepo** | [pnpm workspaces](https://pnpm.io/workspaces) |
| **CI/CD** | GitHub Actions → [Render](https://render.com) |

---

## 💻 Development

```bash
pnpm install          # Install dependencies
pnpm dev              # API dev server (hot reload)
pnpm dev:web          # Landing page dev server
pnpm test             # Run unit tests
pnpm test:coverage    # Tests with coverage report
pnpm lint             # Lint
pnpm build            # Build everything
```

---

## 📄 License

[MIT](LICENSE) — made by [Ebenezer Isaac](https://github.com/ebenezer-isaac)

---

<div align="center">
<sub>Not affiliated with Credly or Pearson. Credly is a trademark of Pearson Education, Inc.</sub>
</div>
