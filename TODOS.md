# TODOS

## Landing Page

### Live Auto-Updating Waitlist Counter

**What:** Replace the static hardcoded counter with an auto-updating count that increments in real-time as people sign up.

**Why:** A counter that visibly grows creates compounding social proof and FOMO. The static version requires manual edits.

**Context:** Static counter ships in init-draft as Proposal 1. Upgrade path: Formspree webhook → Cloudflare Workers KV (free) → counter API endpoint → page polls every 60s. Total infra cost: $0/month on Cloudflare free tier. Start this after the static version has been validated and you have a production domain.

**Effort:** M (human: ~4h / CC: ~30min)
**Priority:** P2
**Depends on:** Static counter (Proposal 1) live, production domain configured

## Completed
