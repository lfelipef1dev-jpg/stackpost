# -*- coding: utf-8 -*-
from pathlib import Path
for rel in [
    r'C:\PROJETOS\EXPOSTACKER\StackPost\apps\web\src\app\api\pagamentos\creditos\route.ts',
    r'C:\PROJETOS\EXPOSTACKER\StackPost\apps\web\src\app\api\pagamentos\webhook\route.ts',
]:
    p = Path(rel)
    t = p.read_text(encoding='utf-8')
    t = t.replace("'créditos-x'", "'creditos-x'")
    p.write_text(t, encoding='utf-8')
    print('ok', p.name)
