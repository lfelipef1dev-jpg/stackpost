import json

d = json.load(open('C:/Users/lfeli/Desktop/bundle_openapi_full.json', 'r', encoding='utf-8'))
paths = d.get('paths', {})

# Extrair schema COMPLETO do POST /api/v1/post/
post_spec = paths.get('/api/v1/post/', {}).get('post', {})
rb = post_spec.get('requestBody', {}).get('content', {}).get('application/json', {}).get('schema', {})

print('=== SCHEMA COMPLETO: POST /api/v1/post/ ===')
print(json.dumps(rb, indent=2, ensure_ascii=False))
