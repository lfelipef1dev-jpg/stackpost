# StackPost — Organização do Ambiente Supabase

## 1. Resumo Executivo

Ambiente Supabase organizado conforme padrão profissional. Todos os projetos antigos descontinuados foram limpados e/ou renomeados. Apenas dois projetos produtivos permanecem ativos:

- **Nexus**
- **StackPost**

Não houve perda de dados. Nenhum banco foi deletado. Ações foram executadas via interface web com logs e screenshots para auditoria.

## 2. Dashboard Atual

| Organização | Plano   | Projetos | Status    |
|-------------|---------|----------|-----------|
| Nexus       | Free    | 1        | Ativo     |
| StackPost   | Free    | 1        | Ativo     |

Organizações removidas:
- `SEEDS Experience` (vazia) — removida em 2026-08-30.
- `StackPost Studio` — renomeada para `StackPost`.

## 3. Detalhamento das Ações

### 3.1. StackPost
- Organização originalmente chamada `StackPost Studio`.
- Renomeada para `StackPost`.
- Projeto permaneceu como `StackPost`.
- Banco: `aaynzvvoeufunbpzblwa` — `sa-east-1`.
- Migrations de billing aplicadas com sucesso.

### 3.2. Nexus
- Organização originalmente chamada `SEEDS Experience`.
- Renomeada para `Nexus`.
- Projeto `Nexus IA` renomeado para `Nexus`.
- Banco: `hfwiyxmezjfokescnzih` — `sa-east-1`.
- Permanece em produção, intacto.

### 3.3. SEEDS Experience vazia
- Identificada como organização sem projetos (`wbmxqnxmfnurbiqhqypz`).
- Removida do dashboard.
- Nenhum banco foi afetado.

## 4. Backups

Backups dos bancos foram criados antes das operações:

- `C:\Users\lfeli\Desktop\StackPost\backups\stackpost_2026-08-31T00-05-39-464Z`
- `C:\Users\lfeli\Desktop\StackPost\backups\nexus_2026-08-31T00-05-41-103Z`

Cada backup contém schema SQL e exportação JSON das tabelas.

## 5. Próximos Passos

1. Verificar billing no StackPost (rotas, jobs, webhooks).
2. Validar build local (`npx tsc --noEmit`, `npm run build`).
3. Testar fluxos críticos em `localhost:3333`.
4. Deploy automático via push para `main`.

## 6. Isolamento

- StackPost e Nexus estão em organizações separadas.
- Tokens de acesso são específicos por organização.
- Nenhuma tabela compartilhada entre os projetos.
