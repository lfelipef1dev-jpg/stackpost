import requests
import json

SUPABASE_URL='https://aaynzvvoeufunbpzblwa.supabase.co'
SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFheW56dnZvZXVmdW5icHpibHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzcxNjYzMSwiZXhwIjoyMTAzMjkyNjMxfQ.RCfTkdX5F7HNBjA_mK6AmOJHTbNO9mRJ9rrRaRuPUEM'

h={'apikey':SUPABASE_KEY,'Authorization':f'Bearer {SUPABASE_KEY}'}

r=requests.get(f'{SUPABASE_URL}/rest/v1/social_accounts?limit=1',headers=h)
print('social_accounts sample:', json.dumps(r.json(),indent=2,default=str)[:1000])
