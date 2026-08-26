import json

d = json.load(open('C:/Users/lfeli/Desktop/bundle_openapi_full.json', 'r', encoding='utf-8'))
paths = d.get('paths', {})

# Extrair TODOS os endpoints com descricao COMPLETA (sem truncar)
out = []
for path in sorted(paths.keys()):
    for method, spec in paths[path].items():
        if method not in ['get','post','patch','put','delete']:
            continue
        out.append(f'\n{"="*80}')
        out.append(f'{method.upper()} {path}')
        out.append(f'Tags: {spec.get("tags", [])}')
        out.append(f'Summary: {spec.get("summary", "")}')
        out.append(f'Description: {spec.get("description", "")}')
        params = spec.get('parameters', [])
        if params:
            out.append(f'Parameters ({len(params)}):')
            for p in params:
                out.append(f'  - {p.get("name","")} (in={p.get("in","")}, required={p.get("required",False)}, schema={json.dumps(p.get("schema",{}))[:200]})')
                if p.get('description'):
                    out.append(f'    desc: {p["description"][:300]}')
        rb = spec.get('requestBody', {})
        if rb:
            content = rb.get('content', {})
            for ct, ct_spec in content.items():
                schema = ct_spec.get('schema', {})
                out.append(f'RequestBody ({ct}):')
                out.append(json.dumps(schema, indent=2, ensure_ascii=False))
        responses = spec.get('responses', {})
        for code, rspec in responses.items():
            out.append(f'  Response {code}: {rspec.get("description","")[:200]}')

with open('C:/Users/lfeli/Desktop/openapi_FULL.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print(f'Linhas: {len(out)}')
