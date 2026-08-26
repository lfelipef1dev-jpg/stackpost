import json

d = json.load(open('C:/Users/lfeli/Desktop/bundle_openapi_full.json', 'r', encoding='utf-8'))
paths = d.get('paths', {})

# Extrair TODOS os endpoints com metodo, summary, parameters, requestBody
for path in sorted(paths.keys()):
    for method, spec in paths[path].items():
        if method not in ['get','post','patch','put','delete']:
            continue
        summary = spec.get('summary', '')
        desc = spec.get('description', '')[:200]
        tags = spec.get('tags', [])
        params = spec.get('parameters', [])
        rb = spec.get('requestBody', {})

        print(f'\n{"="*80}')
        print(f'{method.upper()} {path}')
        print(f'Tags: {tags}')
        print(f'Summary: {summary}')
        if desc:
            print(f'Description: {desc}')

        if params:
            print(f'Parameters ({len(params)}):')
            for p in params:
                pname = p.get('name','')
                pin = p.get('in','')
                preq = p.get('required', False)
                pschema = p.get('schema',{})
                ptype = pschema.get('type','')
                pdesc = p.get('description','')[:100]
                print(f'  - {pname} (in={pin}, type={ptype}, required={preq}) {pdesc}')

        if rb:
            content = rb.get('content', {})
            for ct, ct_spec in content.items():
                schema = ct_spec.get('schema', {})
                print(f'RequestBody ({ct}):')
                print(f'  {json.dumps(schema, indent=2, ensure_ascii=False)[:1500]}')

        # Responses
        responses = spec.get('responses', {})
        for code, rspec in responses.items():
            rdesc = rspec.get('description','')[:100]
            print(f'  Response {code}: {rdesc}')
