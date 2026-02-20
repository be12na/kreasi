#!/bin/bash
# ==============================================
# Kreasi Fashion - Auto Build, Commit & Push
# URL: https://visio.cepat.digital/kreasi/
# ==============================================

set -e

echo "🔨 Building project..."
npm run build

echo ""
echo "📦 Staging all changes (including dist/)..."
git add -A

# Auto-generate commit message with timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
COMMIT_MSG="${1:-Deploy: auto build & push - $TIMESTAMP}"

echo "💾 Committing: $COMMIT_MSG"
git commit -m "$COMMIT_MSG" || echo "⚠️  Nothing to commit, working tree clean."

echo ""
echo "🚀 Pushing to GitHub (origin/main)..."
git push origin main

echo ""
echo "✅ Done! Deployed to GitHub successfully."
echo "📌 Selanjutnya, pull dari cPanel atau upload isi folder dist/ ke public_html/kreasi/"
