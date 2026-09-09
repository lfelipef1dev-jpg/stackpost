# -*- coding: utf-8 -*-
"""Reverte 'esta'->'está' quando era demonstrativo e audita chaves corrompidas."""
import re, subprocess
from pathlib import Path

ROOT = Path(r'C:\PROJETOS\EXPOSTACKER\StackPost\apps\web\src')

# 1) está + substantivo comum -> era "esta" (demonstrativo)
NOUNS = ('assinatura', 'equipe', 'organiza', 'senha', 'imagem', 'Page', 'página',
         'idempotency', 'conta', 'plataforma', 'foi', 'API', 'api', 'rota', 'seção',
         'etapa', 'versão', 'opção', 'regra', 'tela', 'lista', 'tabela', 'coluna',
         'data', 'hora', 'semana', 'manhã', 'forma', 'vez', 'URL', 'url',
         'documentação', 'função', 'variável', 'propriedade', 'configuração',
         'publicação', 'post', 'pergunta', 'resposta', 'solicitação', 'chamada',
         'chave', 'campo', 'área', 'rede', 'integração', 'credencial', 'ação',
         'mensagem', 'janela', 'modal', 'aba', 'caixa', 'sessão', 'thread',
         'instância', 'execução', 'aplicação', 'aplicacao', 'feature', 'ferramenta',
         'plataform', 'solução', 'opção', 'flag', 'variavel')
pat = re.compile(r'\bestá\s+(' + '|'.join(NOUNS) + r')')

diff_files = subprocess.run(['git', 'diff', '--name-only'], capture_output=True, text=True,
                            cwd=str(ROOT.parent.parent.parent), encoding='utf-8').stdout.split()
fixed = 0
for rel in diff_files:
    p = ROOT.parent.parent.parent / rel
    if not p.suffix in ('.ts', '.tsx') or not p.exists():
        continue
    t = p.read_text(encoding='utf-8')
    n = pat.sub(lambda m: 'esta ' + m.group(1), t)
    if n != t:
        p.write_text(n, encoding='utf-8')
        fixed += 1
        print('  revert esta->', rel)
print('esta revertidos:', fixed)

# 2) chaves/identificadores com acento que quebrariam contratos
bad = re.compile(r'([\'"`]\w*[áàâãéêíóôõúç]\w*[\'"`]\s*[:=]|external_reference|["\']créditos|id:\s*[\'"`]\w*[áéíóúç])')
for rel in diff_files:
    p = ROOT.parent.parent.parent / rel
    if not p.suffix in ('.ts', '.tsx') or not p.exists():
        continue
    for i, line in enumerate(p.read_text(encoding='utf-8').splitlines(), 1):
        if bad.search(line):
            print('  CHAVE??', rel, i, line.strip()[:140])
print('done')
