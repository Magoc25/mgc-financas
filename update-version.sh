#!/usr/bin/env bash
# Lê a versão mais recente do CHANGELOG.md e atualiza APP_VERSION no HTML.
# Uso: ./update-version.sh

set -e

CHANGELOG="CHANGELOG.md"
HTML="mgc-financas.html"

VERSION=$(grep -m1 '## \[' "$CHANGELOG" | sed 's/.*\[\(.*\)\].*/\1/')

if [ -z "$VERSION" ]; then
    echo "Erro: nenhuma versão encontrada em $CHANGELOG"
    exit 1
fi

# -i.bak funciona igual no macOS e no Git Bash; `-i ''` só existe no sed do macOS
sed -i.bak "s/const APP_VERSION    = '[^']*'/const APP_VERSION    = '$VERSION'/" "$HTML" && rm -f "$HTML.bak"

echo "Versão atualizada para $VERSION em $HTML"
