# mdshot

<!-- automd:badges color=yellow -->

[![npm version](https://img.shields.io/npm/v/mdshot?color=yellow)](https://npmjs.com/package/mdshot)
[![npm downloads](https://img.shields.io/npm/dm/mdshot?color=yellow)](https://npm.chart.dev/mdshot)

<!-- /automd -->

Render beautiful screenshots from Markdown. Powered by [Takumi](https://github.com/prazdevs/takumi-rs) and [MD4x](https://github.com/unjs/md4x).

## Features

- Render Markdown to PNG images
- GitHub-flavored styling with headings, lists, tables, code blocks, blockquotes, and more
- Section selection via regex pattern matching
- Watch mode for live re-rendering
- Customizable themes, dimensions, and fonts
- Bundled with [Geist](https://vercel.com/font) font family
- System emoji font support (Linux, macOS, Windows)

## Usage

### CLI

```bash
npx mdshot input.md
```

```bash
npx mdshot input.md output.png
```

You can also render README directly from npm packages or GitHub repos:

```bash
# From an npm package
npx mdshot npm:vue

# From a GitHub repo
npx mdshot gh:unjs/mdshot
```

**Options:**

| Flag | Description |
| --- | --- |
| `--watch`, `-w` | Watch for file changes and re-render |
| `--select <pattern>`, `-s <pattern>` | Select sections by heading (regex) |
| `--width <px>` | Image width in pixels (default: `1280`) |
| `--height <px>` | Image height in pixels (default: `640`) |

**Examples:**

```bash
# Render a specific section
npx mdshot README.md --select "Installation"

# Watch mode with custom dimensions
npx mdshot notes.md -w --width 800 --height 400
```

### Programmatic

```ts
import { mdshot } from "mdshot";

const png = await mdshot("# Hello World\n\nThis is **mdshot**.");

// With options
const png = await mdshot(markdown, {
  width: 800,
  height: 400,
  select: "Usage",
  theme: {
    bg: "#1e1e2e",
    text: "#cdd6f4",
  },
});
```

**Options:**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | `1280` | Image width in pixels |
| `height` | `number` | `640` | Image height in pixels |
| `format` | `OutputFormat` | `"png"` | Output format |
| `devicePixelRatio` | `number` | `2` | Device pixel ratio (retina) |
| `theme` | `Partial<Theme>` | - | Custom theme overrides |
| `fonts` | `Font[]` | - | Additional fonts to load |
| `select` | `string` | - | Regex pattern to select sections by heading |

## Development

<details>

<summary>local development</summary>

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

</details>

## License

Published under the [MIT](https://github.com/pi0/mdshot/blob/main/LICENSE) license.
