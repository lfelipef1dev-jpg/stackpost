# -*- coding: utf-8 -*-
"""Corrige acentuacao pt-BR em rotulos de UI do StackPost (somente strings visiveis)."""
from pathlib import Path

ROOT = Path(r"C:\PROJETOS\EXPOSTACKER\StackPost\apps\web\src")

SUBS = {
    "components/Header.tsx": [
        ("label: 'Calendario'", "label: 'Calendário'"),
        ("label: 'Metricas'", "label: 'Métricas'"),
        ("label: 'Cobranca'", "label: 'Cobrança'"),
        ("label: 'Config'", "label: 'Configurações'"),
    ],
    "components/Footer.tsx": [
        ("{ label: 'Documentacao', href: '/docs' }", "{ label: 'Documentação', href: '/docs' }"),
        ("title: 'Comparacao'", "title: 'Comparação'"),
    ],
    "components/DocsSidebar.tsx": [
        ("Secao Documentacao", "Seção Documentação"),
    ],
    "app/ai-agents/page.tsx": [
        ("Documentacao MCP", "Documentação MCP"),
    ],
    "app/security/page.tsx": [
        ("{/* Documentacao */}", "{/* Documentação */}"),
        (">Documentacao<", ">Documentação<"),
    ],
    "app/compare/page.tsx": [
        (">Comparacao<", ">Comparação<"),
    ],
    "app/status/page.tsx": [
        ("Metricas baseadas", "Métricas baseadas"),
    ],
    "app/settings/page.tsx": [
        ("Configuracao inicial", "Configuração inicial"),
    ],
    "app/for-agencies/page.tsx": [
        ("Cobranca por post", "Cobrança por post"),
        ("Cobranca em reais", "Cobrança em reais"),
        ("Metricas de todas", "Métricas de todas"),
    ],
    "app/plans/PlansClient.tsx": [
        ("{ label: 'Calendario', value: true }", "{ label: 'Calendário', value: true }"),
        ("'Cobranca via Mercado Pago", "'Cobrança via Mercado Pago"),
        ("'Cobranca por conta social'", "'Cobrança por conta social'"),
        ("'Cobranca em reais'", "'Cobrança em reais'"),
        ("'Cobranca por canal'", "'Cobrança por canal'"),
    ],
    "app/api/pagamentos/webhook/route.ts": [
        ("'Cobranca de assinatura nao aprovada.'", "'Cobrança de assinatura não aprovada.'"),
        ("'Cobranca de assinatura processada.'", "'Cobrança de assinatura processada.'"),
    ],
}

for rel, subs in SUBS.items():
    p = ROOT / rel
    if not p.exists():
        print(f"  !! arquivo nao existe: {rel}")
        continue
    t = p.read_text(encoding="utf-8")
    orig = t
    for old, new in subs:
        if old not in t:
            print(f"  !! NAO ACHOU em {rel}: {old[:60]}")
        t = t.replace(old, new)
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print(f"  ok {rel}")
print("done")
