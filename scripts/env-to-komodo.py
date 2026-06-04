#!/usr/bin/env python3
"""Konversi .env lokal → TOML variabel Komodo (paste di UI, jangan commit output)."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env"
OUT_VARIABLES = ROOT / "komodo" / "variables.local.toml"
OUT_SECRETS = ROOT / "komodo" / "secrets-core.snippet.toml"

# Kunci yang dipakai stack.toml ([[NAMA]])
STACK_KEYS = (
    "DB_ROOT_PASSWORD",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "JWT_EXPIRATION",
    "JWT_REFRESH_EXPIRATION",
    "PDF_SIGNING_ENABLED",
    "PDF_SIGNING_P12_BASE64",
    "PDF_SIGNING_P12_PASSPHRASE",
)


def parse_env(path: Path) -> dict[str, str]:
    if not path.is_file():
        raise FileNotFoundError(f"Tidak ada {path} — buat dari .env.example dulu.")
    result: dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].strip()
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        result[key] = value
    return result


def toml_literal(value: str) -> str:
    if "\n" in value or '"""' in value:
        escaped = value.replace("\\", "\\\\").replace('"""', '\\"""')
        return f'"""{escaped}"""'
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def build_variable_blocks(env: dict[str, str]) -> str:
    lines = [
        "# Generated — JANGAN commit. Paste di Komodo: Settings → Variables → Toml",
        "",
    ]
    missing: list[str] = []
    for key in STACK_KEYS:
        if key not in env:
            missing.append(key)
            continue
        secret = key not in ("JWT_EXPIRATION", "JWT_REFRESH_EXPIRATION", "PDF_SIGNING_ENABLED")
        lines.append("[[variable]]")
        lines.append(f'name = "{key}"')
        lines.append(f"value = {toml_literal(env[key])}")
        lines.append(f"is_secret = {'true' if secret else 'false'}")
        lines.append("")
    if missing:
        lines.append(f"# MISSING dari .env: {', '.join(missing)}")
    return "\n".join(lines).rstrip() + "\n"


def build_secrets_block(env: dict[str, str]) -> str:
    lines = [
        "# Paste ke core.config.toml atau periphery.config.toml di VPS",
        "# Lalu restart Core / Periphery",
        "",
        "[secrets]",
    ]
    for key in STACK_KEYS:
        if key not in env:
            continue
        lines.append(f"{key} = {toml_literal(env[key])}")
    return "\n".join(lines) + "\n"


def main() -> int:
    try:
        env = parse_env(ENV_FILE)
    except FileNotFoundError as err:
        print(err, file=sys.stderr)
        return 1
    OUT_VARIABLES.parent.mkdir(parents=True, exist_ok=True)
    OUT_VARIABLES.write_text(build_variable_blocks(env), encoding="utf-8")
    OUT_SECRETS.write_text(build_secrets_block(env), encoding="utf-8")
    print(f"OK: {OUT_VARIABLES}")
    print(f"OK: {OUT_SECRETS}")
    print()
    print("Langkah cepat:")
    print("  1) Komodo > Settings > Variables > Toml > paste isi variables.local.toml")
    print("  2) Atau salin [secrets] dari secrets-core.snippet.toml ke config Core/Periphery")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
