# BookMyMovie

Next.js App Router starter with TypeScript, Tailwind CSS, and shadcn/ui.

## Development

Use Node.js 22 LTS or newer and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Edit `src/app/page.tsx` to start building.

## Checks and production

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

## UI components

```sh
npx shadcn@latest add button
```

Components live in `src/components/ui`, shared utilities in `src/lib`, and theme tokens in `src/app/globals.css`. The `@/` alias resolves to `src/`.

See [AGENTS.md](AGENTS.md) for development conventions.
