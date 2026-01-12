
import requests
import hashlib
import json

# Configuration
API_URL = "http://localhost:5173/api/v1" # This routes to Convex eventually? 
# Wait, bun/vite proxy /api to convex? Or convex dev serves it?
# In dev, calling the site calls Vite. Vite needs to proxy /api to Convex.
# Or we call the convex HTTP url directly if we know it.
# Assuming standard setup which might require the direct Convex URL.
# Let's use the convex HTTP url if possible.
# But for now let's try to assume user can test via UI.
# Or if I can find the CONVEX_URL.

print("This script is a template. Please set your API KEY and Endpoint to run it.")
print("Steps to verify manually:")
print("1. Go to /dashboard/settings and generate an API API.")
print("2. Go to /api and click 'Authorize'. Paste your key.")
print("3. Try 'GET /domains'. Should return list.")
print("4. Try 'POST /domains' with { subdomain: 'test-api' }.")
print("5. Try 'GET /domains/{id}/dns'.")
