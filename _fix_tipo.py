# -*- coding: utf-8 -*-
from pathlib import Path
p = Path(r'C:\PROJETOS\EXPOSTACKER\StackPost\apps\web\src\lib\mercadopago.ts')
t = p.read_text(encoding='utf-8')
t = t.replace('tipo: "créditos-x"', 'tipo: "creditos-x"')
p.write_text(t, encoding='utf-8')
print('ok')
