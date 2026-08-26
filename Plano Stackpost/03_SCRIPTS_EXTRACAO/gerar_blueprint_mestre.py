"""Blueprint Master - bundle.social"""
from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_fill_color(10,16,30); self.rect(0,0,210,22,'F')
            self.set_text_color(255); self.set_font('Helvetica','B',9)
            self.cell(0,8,'BLUEPRINT TECNICO MESTRE - bundle.social',0,1,'L')
            self.set_font('Helvetica','I',6)
            self.cell(0,5,'Limites | Fluxo | Resolucao | Formatos | Rotas | Paralelismo',0,1,'L')
            self.ln(3)
    def footer(self):
        self.set_y(-12); self.set_text_color(120); self.set_font('Helvetica','I',7)
        self.cell(0,8,f'Pag {self.page_no()}/{{nb}} | Blueprint Master',0,0,'C')
    def h1(self,t):
        self.ln(4); self.set_fill_color(15,23,42); self.set_text_color(255)
        self.set_font('Helvetica','B',13); self.cell(0,9,f'  {t}',0,1,'L',fill=True); self.ln(2)
    def h2(self,t):
        self.ln(3); self.set_text_color(37,99,235); self.set_font('Helvetica','B',10)
        self.cell(0,6,t,0,1,'L'); self.set_text_color(0)
    def h3(self,t):
        self.ln(1); self.set_text_color(30,64,175); self.set_font('Helvetica','B',8)
        self.cell(0,5,t,0,1,'L'); self.set_text_color(0)
    def p(self,t,sz=8):
        self.set_font('Helvetica','',sz); self.multi_cell(0,4,t); self.ln(1)
    def code(self,t):
        self.set_fill_color(240,240,245); self.set_font('Courier','',7)
        self.multi_cell(0,4,t,fill=True); self.ln(2)
    def tbl(self,rows,widths=None):
        if not widths:
            n=len(rows[0]); widths=[190/n]*n
        for i,row in enumerate(rows):
            if i==0:
                self.set_fill_color(30,41,59); self.set_text_color(255); self.set_font('Helvetica','B',7)
            else:
                self.set_fill_color(248,250,252) if i%2==0 else self.set_fill_color(255,255,255)
                self.set_text_color(0); self.set_font('Helvetica','',7)
            for j,cell in enumerate(row):
                self.cell(widths[j],5,str(cell)[:int(widths[j]/1.3)],0,0,'L',fill=True)
            self.ln()
        self.ln(2)

pdf=PDF(); pdf.alias_nb_pages(); pdf.set_auto_page_break(auto=True,margin=18)

# CAPA
pdf.add_page()
pdf.set_fill_color(10,16,30); pdf.rect(0,0,210,297,'F')
pdf.set_text_color(255); pdf.set_font('Helvetica','B',24); pdf.ln(80)
pdf.cell(0,12,'BLUEPRINT TECNICO MESTRE',0,1,'C')
pdf.set_font('Helvetica','B',16); pdf.cell(0,10,'bundle.social',0,1,'C')
pdf.set_font('Helvetica','',10); pdf.ln(5)
pdf.cell(0,6,'Analise tecnica completa para alternativa superior',0,1,'C')
pdf.ln(3); pdf.set_text_color(150,200,255)
pdf.cell(0,5,'114 endpoints | 15 plataformas | OpenAPI 3.0 real',0,1,'C')
pdf.cell(0,5,'Limites de midia | Resolucoes | Fluxo de postagem | Paralelismo',0,1,'C')
pdf.cell(0,5,'Rotas | Tempos | Mapeamento | Validacao | Erros',0,1,'C')
pdf.ln(10); pdf.set_text_color(200); pdf.set_font('Helvetica','I',8)
pdf.cell(0,5,'Fontes: api.bundle.social/swagger-json + docs.bundle.social + scan VulnStrike',0,1,'C')
pdf.cell(0,5,'Data: 25/08/2026',0,1,'C')

# 1. VISAO GERAL
pdf.add_page(); pdf.h1('1. VISAO GERAL E URLs OFICIAIS')
pdf.p('bundle.social = API REST unificada (middleware) para postar em 15 redes sociais com uma integracao.')
pdf.h2('URLs Oficiais')
pdf.tbl([['Recurso','URL'],['Site','https://bundle.social'],['API prod','https://api.bundle.social'],['API dev','http://localhost:3001'],['Docs','https://docs.bundle.social'],['Docs MD','https://info.bundle.social'],['OpenAPI JSON','https://api.bundle.social/swagger-json'],['OpenAPI YAML','https://api.bundle.social/swagger-yaml'],['SDK','github.com/bundleglobal/bundlesocial-node'],['Status','bundlesocial.betteruptime.com'],['Contato','contact@bundle.social']],[40,150])
pdf.h2('Dados OpenAPI')
pdf.tbl([['Campo','Valor'],['Titulo','bundle.social API'],['Versao','1.0.0'],['Spec','OpenAPI 3.0'],['Endpoints','114'],['Plataformas','15'],['Auth','API Key (x-api-key header)'],['Tags','app, organization, team, socialAccount, upload, post, postImport, analytics, comment, misc, postCSV']],[40,150])
pdf.h2('15 Plataformas')
pdf.p('TIKTOK | YOUTUBE | INSTAGRAM | FACEBOOK | TWITTER | THREADS | LINKEDIN | PINTEREST | REDDIT | MASTODON | DISCORD | SLACK | BLUESKY | GOOGLE_BUSINESS | SNAPCHAT')
