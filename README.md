<h1 align="center">credly-readme-stats</h1>

<p align="center">
  Dynamic SVG cards for your <a href="https://www.credly.com">Credly</a> badges — embed in any GitHub README.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#card-types">Card Types</a> •
  <a href="#themes">Themes</a> •
  <a href="#customization">Customization</a> •
  <a href="#self-hosting">Self-Hosting</a>
</p>

---

## Quick Start

Replace `YOUR_USERNAME` with your Credly username (from your profile URL: `credly.com/users/YOUR_USERNAME`).

### Stats Card

```md
![Credly Stats](https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME)
```

### Badge Grid

```md
![Badge Grid](https://credly-readme-stats.onrender.com/api/grid?username=YOUR_USERNAME)
```

### Timeline

```md
![Timeline](https://credly-readme-stats.onrender.com/api/timeline?username=YOUR_USERNAME)
```

### Carousel

```md
![Carousel](https://credly-readme-stats.onrender.com/api/carousel?username=YOUR_USERNAME)
```

### Overview (Stats + Carousel)

```md
![Overview](https://credly-readme-stats.onrender.com/api/overview?username=YOUR_USERNAME)
```

### Single Badge

```md
![Badge](https://credly-readme-stats.onrender.com/api/badge?username=YOUR_USERNAME&badge_id=BADGE_ID)
```

---

## Finding Your Username

1. Go to your [Credly profile](https://www.credly.com)
2. Look at the URL: `https://www.credly.com/users/your-username`
3. Your username is the part after `/users/` (e.g., `ebenezer-isaac.05496d7f`)

---

## Card Types

### Stats Card

Shows a summary of your badge statistics.

```md
![Stats](https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `show_icons` | boolean | `true` | Show stat row icons |
| `hide` | string | `""` | Hide stats: `total`, `issuers`, `skills`, `active`, `expiring`, `top_issuers`, `top_skills` |
| `card_width` | number | `495` | Card width (300-800) |
| `line_height` | number | `25` | Stat row spacing |

### Badge Grid

Displays your badges in a grid layout with images.

```md
![Grid](https://credly-readme-stats.onrender.com/api/grid?username=YOUR_USERNAME&columns=4&rows=2)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `columns` | number | `3` | Grid columns (1-6) |
| `rows` | number | `2` | Grid rows (1-10) |
| `badge_size` | number | `64` | Image size px (32-128) |
| `show_name` | boolean | `true` | Show badge name |
| `show_issuer` | boolean | `false` | Show issuer name |
| `sort` | enum | `recent` | `recent`, `oldest`, `name`, `issuer` |
| `filter_issuer` | string | `""` | Comma-separated issuer filter |
| `filter_skill` | string | `""` | Comma-separated skill filter |
| `page` | number | `1` | Grid page for pagination |

### Timeline

Chronological timeline of your badge achievements.

```md
![Timeline](https://credly-readme-stats.onrender.com/api/timeline?username=YOUR_USERNAME&max_items=5)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `max_items` | number | `6` | Max entries (1-20) |
| `show_description` | boolean | `false` | Show badge description |
| `show_skills` | boolean | `true` | Show skill tags |
| `sort` | enum | `recent` | `recent`, `oldest` |
| `filter_issuer` | string | `""` | Issuer filter |
| `card_width` | number | `495` | Width (400-800) |

### Carousel

Animated sliding carousel of your badge images with CSS-only animation.

```md
![Carousel](https://credly-readme-stats.onrender.com/api/carousel?username=YOUR_USERNAME&visible_count=3&badge_size=80)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `visible_count` | number | `5` | Visible badges at once (1-6) |
| `badge_size` | number | `64` | Badge image size px (32-128) |
| `show_name` | boolean | `true` | Show badge name |
| `show_issuer` | boolean | `false` | Show issuer name |
| `interval` | number | `3` | Seconds per slide (1-10) |
| `sort` | enum | `recent` | `recent`, `oldest`, `name`, `issuer` |
| `filter_issuer` | string | `""` | Comma-separated issuer filter |
| `filter_skill` | string | `""` | Comma-separated skill filter |
| `max_items` | number | `12` | Max badges in carousel (3-30) |
| `card_width` | number | auto | Card width (200-800) |

### Overview

Stats summary at top + badge carousel at bottom — the combined "big" card.

```md
![Overview](https://credly-readme-stats.onrender.com/api/overview?username=YOUR_USERNAME&visible_count=3&hide=expiring)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `show_icons` | boolean | `true` | Show stat row icons |
| `hide` | string | `""` | Hide: `total`, `issuers`, `skills`, `active`, `expiring`, `top_issuers`, `top_skills`, `carousel` |
| `line_height` | number | `25` | Stat row spacing |
| `visible_count` | number | `5` | Carousel visible badges (1-6) |
| `badge_size` | number | `64` | Carousel badge size px (32-128) |
| `show_name` | boolean | `true` | Show badge name in carousel |
| `show_issuer` | boolean | `false` | Show issuer in carousel |
| `interval` | number | `3` | Carousel seconds per slide (1-10) |
| `sort` | enum | `recent` | `recent`, `oldest`, `name`, `issuer` |
| `filter_issuer` | string | `""` | Comma-separated issuer filter |
| `filter_skill` | string | `""` | Comma-separated skill filter |
| `max_items` | number | `12` | Max badges in carousel (3-30) |
| `card_width` | number | `550` | Card width (350-800) |

### Single Badge Detail

Display a single badge with full details.

```md
![Badge](https://credly-readme-stats.onrender.com/api/badge?username=YOUR_USERNAME&badge_id=BADGE_ID)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `badge_id` | string | **required** | Badge ID from Credly |
| `show_description` | boolean | `true` | Show description |
| `show_skills` | boolean | `true` | Show skills |
| `show_issuer` | boolean | `true` | Show issuer |
| `card_width` | number | `400` | Width (300-600) |

---

## Themes

20 built-in themes. Add `&theme=THEME_NAME` to your URL.

| Theme | | Theme | | Theme |
|-------|--|-------|--|-------|
| `default` | | `dark` | | `radical` |
| `merko` | | `gruvbox` | | `tokyonight` |
| `onedark` | | `cobalt` | | `synthwave` |
| `dracula` | | `nord` | | `catppuccin_mocha` |
| `catppuccin_latte` | | `rose_pine` | | `github_dark` |
| `github_light` | | `aura` | | `neon` |
| `react` | | `vue` | | |

Example:

```md
![Stats](https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME&theme=tokyonight)
```

---

## Customization

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
| `border_radius` | number | `4.5` | Border radius px |
| `disable_animations` | boolean | `false` | Disable CSS animations |
| `cache_seconds` | number | `21600` | Cache TTL (7200-86400) |

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

Use HTML `<picture>` tags to show different themes based on the viewer's GitHub theme:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME&theme=github_dark" />
  <source media="(prefers-color-scheme: light)" srcset="https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME&theme=github_light" />
  <img alt="Credly Stats" src="https://credly-readme-stats.onrender.com/api/stats?username=YOUR_USERNAME" />
</picture>
```

---

## Self-Hosting

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

The server runs on port 3000 by default. Set the `PORT` environment variable to change it.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment |

See [.env.example](.env.example) for all available options.

---

## Tech Stack

- **API**: [Hono](https://hono.dev) + TypeScript + `@hono/node-server`
- **Landing Page**: [Astro](https://astro.build) + React + Tailwind CSS
- **SVG**: Template literals (no DOM dependency)
- **Cache**: In-memory LRU (badge data 6h, images 24h)
- **Testing**: Vitest (92%+ coverage) + Playwright E2E
- **Monorepo**: pnpm workspaces

---

## Development

```bash
# Install dependencies
pnpm install

# Start API dev server (hot reload)
pnpm dev

# Start landing page dev server
pnpm dev:web

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Build everything
pnpm build
```

---

## License

[MIT](LICENSE)

---

<p align="center">
  Not affiliated with Credly or Pearson. Credly is a trademark of Pearson Education, Inc.
</p>
