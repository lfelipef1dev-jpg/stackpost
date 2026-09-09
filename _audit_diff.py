# -*- coding: utf-8 -*-
"""Audita o diff por substituicoes ambiguas perigosas."""
import subprocess, re
from collections import defaultdict

diff = subprocess.run(['git', 'diff'], capture_output=True, text=True,
                      cwd=r'C:\PROJETOS\EXPOSTACKER\StackPost', encoding='utf-8').stdout

cur = '?'
pairs = defaultdict(list)
old_line = None
for line in diff.splitlines():
    if line.startswith('+++'):
        cur = line[4:]
    elif line.startswith('-') and not line.startswith('---'):
        old_line = line[1:]
    elif line.startswith('+') and not line.startswith('+++'):
        new_line = line[1:]
        if old_line is None:
            continue
        # encontra o que mudou
        for w in ['está', 'só ', 'mês', 'já ', 'até ', 'será', 'após', 'útil', 'úteis',
                  'estão', 'pós', 'pré', 'não', 'também', 'então']:
            if w in new_line and w not in old_line:
                pairs[w].append((cur, new_line.strip()[:150]))
        old_line = None

for w, items in pairs.items():
    print(f'=== "{w}" ({len(items)}) ===')
    for f, l in items[:25]:
        print(' ', f.split('/')[-1], '|', l)
