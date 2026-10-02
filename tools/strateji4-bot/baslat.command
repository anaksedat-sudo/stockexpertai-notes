#!/bin/bash
# Mac'te çift tıklayarak başlatın. Sanal hesapta çalışır. caffeinate Mac'in uyumasını engeller.
cd "$(dirname "$0")" || exit 1
echo "Strateji 4 botu başlıyor (sanal hesap). Durdurmak için Ctrl+C veya pencereyi kapatın."
caffeinate -i npx --yes tsx bot.ts
