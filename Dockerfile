# ─── Stage 1 : Build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Outils nécessaires pour compiler better-sqlite3 (addon natif)
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Installer TOUTES les dépendances (dev incluses — TypeScript/Tailwind nécessaires au build)
COPY package.json package-lock.json* ./
RUN npm ci

# Copier les sources et compiler
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Stage 2 : Runner minimal ────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Le bundle standalone inclut déjà les node_modules tracés (better-sqlite3 compris)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static

# Répertoire persistant pour la base SQLite
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
