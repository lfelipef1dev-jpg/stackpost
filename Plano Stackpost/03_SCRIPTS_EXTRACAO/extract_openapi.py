import requests, json

r = requests.get('https://api.bundle.social/swagger-json', timeout=15)
d = r.json()

schemas = d.get('components', {}).get('schemas', {})
print(f'TOTAL SCHEMAS: {len(schemas)}')
print(f'TOTAL ENDPOINTS: {len(d.get("paths", {}))}')

# Salvar spec completa
with open('C:/Users/lfeli/Desktop/bundle_openapi_full.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, indent=2, ensure_ascii=False)
print('Spec completa salva em bundle_openapi_full.json')

# Listar schemas e suas propriedades
for name, schema in list(schemas.items())[:40]:
    props = schema.get('properties', {})
    required = schema.get('required', [])
    print(f'\n=== {name} ===')
    print(f'  Required: {required}')
    for pname, pval in props.items():
        ptype = pval.get('type', pval.get('$ref', 'object'))
        desc = pval.get('description', '')[:80]
        print(f'  {pname}: {ptype} - {desc}')
