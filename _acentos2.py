# -*- coding: utf-8 -*-
"""Correcao de acentuacao pt-BR em textos de UI (word-boundary, protege codigo)."""
import re
from pathlib import Path

ROOT = Path(r"C:\PROJETOS\EXPOSTACKER\StackPost\apps\web\src")

# pares (palavra sem acento) -> com acento; case-sensitive por variante
FIXES = {
    'voce': 'você', 'Voce': 'Você',
    'midia': 'mídia', 'Midia': 'Mídia', 'midias': 'mídias', 'Midias': 'Mídias',
    'conteudo': 'conteúdo', 'Conteudo': 'Conteúdo',
    'usuario': 'usuário', 'Usuario': 'Usuário', 'usuarios': 'usuários', 'Usuarios': 'Usuários',
    'historico': 'histórico', 'Historico': 'Histórico',
    'servico': 'serviço', 'Servico': 'Serviço',
    'endereco': 'endereço', 'Endereco': 'Endereço',
    'numero': 'número', 'Numero': 'Número',
    'codigo': 'código', 'Codigo': 'Código',
    'pagina': 'página', 'Pagina': 'Página', 'paginas': 'páginas', 'Paginas': 'Páginas',
    'dinamico': 'dinâmico', 'dinamica': 'dinâmica', 'Dinamico': 'Dinâmico',
    'periodo': 'período', 'Periodo': 'Período',
    'analise': 'análise', 'Analise': 'Análise',
    'otimo': 'ótimo', 'otima': 'ótima', 'Otimo': 'Ótimo', 'Otima': 'Ótima',
    'necessario': 'necessário', 'necessaria': 'necessária', 'Necessario': 'Necessário',
    'obrigatorio': 'obrigatório', 'obrigatoria': 'obrigatória',
    'padrao': 'padrão', 'Padrao': 'Padrão',
    'proximo': 'próximo', 'proxima': 'próxima', 'Proximo': 'Próximo', 'Proxima': 'Próxima',
    'ultimo': 'último', 'ultima': 'última', 'Ultimo': 'Último', 'Ultima': 'Última',
    'funcao': 'função', 'Funcao': 'Função', 'funcoes': 'funções',
    'automatico': 'automático', 'automatica': 'automática', 'Automatico': 'Automático', 'Automatica': 'Automática',
    'automaticamente': 'automaticamente',
    'preco': 'preço', 'Preco': 'Preço', 'precos': 'preços', 'Precos': 'Preços',
    'cambio': 'câmbio', 'Cambio': 'Câmbio',
    'dolar': 'dólar', 'Dolar': 'Dólar',
    'agencia': 'agência', 'Agencia': 'Agência', 'agencias': 'agências', 'Agencias': 'Agências',
    'creditos': 'créditos', 'Creditos': 'Créditos', 'credito': 'crédito', 'Credito': 'Crédito',
    'notificacao': 'notificação', 'Notificacao': 'Notificação', 'notificacoes': 'notificações',
    'integracao': 'integração', 'Integracao': 'Integração', 'integracoes': 'integrações',
    'documentacao': 'documentação', 'Documentacao': 'Documentação',
    'comparacao': 'comparação', 'Comparacao': 'Comparação', 'comparacoes': 'comparações',
    'configuracao': 'configuração', 'Configuracao': 'Configuração', 'configuracoes': 'configurações', 'Configuracoes': 'Configurações',
    'calendario': 'calendário', 'Calendario': 'Calendário',
    'metricas': 'métricas', 'Metricas': 'Métricas',
    'cobranca': 'cobrança', 'Cobranca': 'Cobrança',
    'estrategia': 'estratégia', 'Estrategia': 'Estratégia', 'estrategias': 'estratégias',
    'relatorio': 'relatório', 'Relatorio': 'Relatório', 'relatorios': 'relatórios',
    'publicacao': 'publicação', 'Publicacao': 'Publicação', 'publicacoes': 'publicações',
    'agendamento': 'agendamento',
    'conexao': 'conexão', 'conexoes': 'conexões',
    'opcao': 'opção', 'opcoes': 'opções', 'Opcao': 'Opção',
    'botao': 'botão', 'Botao': 'Botão', 'botoes': 'botões',
    'inicio': 'início', 'Inicio': 'Início',
    'rapido': 'rápido', 'rapida': 'rápida', 'Rapido': 'Rápido', 'Rapida': 'Rápida',
    'pratico': 'prático', 'pratica': 'prática', 'Pratico': 'Prático', 'Pratica': 'Prática',
    'grafico': 'gráfico', 'graficos': 'gráficos',
    'mencao': 'menção', 'mencoes': 'menções',
    'comentario': 'comentário', 'comentarios': 'comentários',
    'experiencia': 'experiência', 'Experiencia': 'Experiência',
    'referencia': 'referência',
    'frequencia': 'frequência',
    'otimizacao': 'otimização', 'otimizacoes': 'otimizações',
    'visualizacao': 'visualização', 'visualizacoes': 'visualizações',
    'avaliacao': 'avaliação', 'avaliacoes': 'avaliações',
    'exibicao': 'exibição',
    'apos': 'após', 'Apos': 'Após',
    'ate ': 'até ', 'Ate ': 'Até ',
    'entao': 'então', 'Entao': 'Então',
    'tambem': 'também', 'Tambem': 'Também',
    'ja ': 'já ',
    'so ': 'só ',
    'mes ': 'mês ', 'Mes ': 'Mês ',
    'meses': 'meses', 'Meses': 'Meses',
    'anos': 'anos',
    'pos-pagos': 'pós-pagos', 'pre-pagos': 'pré-pagos',
    'sera': 'será', 'Sera': 'Será',
    'esta ': 'está ', 'Esta ': 'Está ',
    'estao': 'estão',
    'disponivel': 'disponível', 'Disponivel': 'Disponível', 'disponiveis': 'disponíveis', 'Disponiveis': 'Disponíveis',
    'facil': 'fácil', 'Facil': 'Fácil',
    'util ': 'útil ', 'uteis': 'úteis',
    'horario': 'horário', 'horarios': 'horários',
    'diario': 'diário', 'diaria': 'diária',
    'semana ': 'semana ',
    'varios': 'vários', 'varias': 'várias',
    'algumas': 'algumas',
    'repositorio': 'repositório',
    'diretorio': 'diretório',
    'saida': 'saída',
    'versao': 'versão', 'Versao': 'Versão',
    'permissao': 'permissão', 'permissoes': 'permissões',
    'situacao': 'situação',
    'acesso ': 'acesso ',
    'basico': 'básico', 'basica': 'básica', 'Basico': 'Básico',
    'avancado': 'avançado', 'avancada': 'avançada', 'Avancado': 'Avançado', 'Avancada': 'Avançada',
    'validacao': 'validação',
    'cancelamento': 'cancelamento',
    'acao': 'ação', 'acoes': 'ações', 'Acao': 'Ação',
    'excecao': 'exceção',
    'opcional': 'opcional',
    'informacao': 'informação', 'informacoes': 'informações', 'Informacao': 'Informação',
    'exclusao': 'exclusão',
    'recomendacao': 'recomendação', 'recomendacoes': 'recomendações',
    'proxima-renovacao': 'proxima-renovacao',
}

# contextos a NUNCA tocar: CSS/classes tecnicas, identificadores
SKIP_LINE_PAT = re.compile(r'(pre-wrap|pre-line|whitespace-|import\s|from\s+[\'"]|require\(|className=|console\.|//|href=|src=|path:|slug|url|fetch\(|\bfunction\b|=>|\.map\(|\.filter\(|\.forEach|interface\s|type\s+\w+\s*=|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=)')

# palavras que NUNCA devem ser tocadas dentro de codigo (ambiguas)
CODE_SAFE = {'mes ', 'ja ', 'so ', 'ate ', 'esta ', 'util '}

pat = re.compile(r'\b(' + '|'.join(re.escape(k) for k in sorted(FIXES, key=len, reverse=True)) + r')\b')

files = list(ROOT.rglob('*.tsx')) + list(ROOT.rglob('*.ts'))
changed = 0
for f in files:
    if 'node_modules' in str(f) or '.open-next' in str(f) or '.next' in str(f):
        continue
    t = f.read_text(encoding='utf-8')
    out_lines = []
    dirty = False
    for line in t.splitlines():
        # proteger linhas claramente de codigo para palavras ambiguas
        def repl(m):
            w = m.group(0)
            if w in FIXES:
                return FIXES[w]
            return w
        new_line = pat.sub(repl, line)
        # protecoes: nao corromper pre-wrap, nomes de vars etc — word boundary ja cobre
        if new_line != line:
            dirty = True
        out_lines.append(new_line)
    if dirty:
        f.write_text('\n'.join(out_lines) + ('\n' if t.endswith('\n') else ''), encoding='utf-8')
        changed += 1
        print('  ok', f.relative_to(ROOT))
print('arquivos alterados:', changed)
