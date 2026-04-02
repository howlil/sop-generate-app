# Quick Task: Import OpenAPI Spec to Apidog

**Date:** 2026-04-03  
**Status:** ✅ COMPLETE (spec generated, ready to import)

---

## Objective

Generate OpenAPI 3.1 specification from existing API documentation and import to Apidog MCP.

---

## Output

### Files Created:
1. **`server/openapi-spec.json`** — Complete OpenAPI 3.1 specification
   - 40 API endpoints
   - 12 tags (modules)
   - 55 schemas (request/response models)
   - Bearer JWT authentication

### Specification Coverage:

| Module | Endpoints | Schemas |
|--------|-----------|---------|
| Auth | 4 | 4 |
| Users | 5 | 5 |
| OPD | 5 | 3 |
| Peraturan | 6 | 3 |
| Tim Penyusun | 5 | 3 |
| Tim Evaluasi | 4 | 2 |
| SOP | 4 | 4 |
| Detail SOP | 11 | 12 |
| Evaluasi | 6 | 8 |
| TTE | 7 | 4 |
| Audit | 2 | 2 |
| Health | 1 | 1 |

---

## How to Import to Apidog

### Option 1: Via Web UI (Recommended)

1. **Login** to https://apidog.com
2. **Create new project** or select existing "Default module"
3. Click **Import** → **OpenAPI/Swagger**
4. **Upload** `server/openapi-spec.json` or paste the JSON content
5. Click **Import**
6. Apidog will parse and create all endpoints automatically

### Option 2: Via Apidog API (Automated)

If you have Apidog API key:

```bash
curl -X POST https://api.apidog.com/v1/projects/{projectId}/import \
  -H "Authorization: Bearer {your-api-key}" \
  -H "Content-Type: application/json" \
  -d @server/openapi-spec.json
```

### Option 3: Scheduled Import (Auto-sync)

1. Host `openapi-spec.json` on public URL (e.g., GitHub raw)
2. In Apidog: Settings → Scheduled Import
3. Set URL: `https://raw.githubusercontent.com/your-repo/server/openapi-spec.json`
4. Set schedule (e.g., daily)
5. Apidog will auto-sync when spec changes

---

## Post-Import Checklist

After importing to Apidog:

- [ ] Verify all 40 endpoints imported correctly
- [ ] Check authentication scheme (Bearer JWT)
- [ ] Test sample requests for each module
- [ ] Configure mock server (optional)
- [ ] Enable MCP server integration
- [ ] Share with team members

---

## MCP Integration

After import, the apidog MCP will be able to:
- Read OpenAPI spec from Apidog project
- Provide endpoint information to AI assistants
- Enable AI-powered API documentation generation

**Note:** Current apidog MCP only supports **read** operations. Write operations (upload) must be done via UI or Apidog API.

---

## Verification

To verify the spec is valid:

```bash
cd server
node -e "
  const fs = require('fs');
  const spec = JSON.parse(fs.readFileSync('openapi-spec.json', 'utf8'));
  console.log('✓ OpenAPI Version:', spec.openapi);
  console.log('✓ Title:', spec.info.title);
  console.log('✓ Endpoints:', Object.keys(spec.paths).length);
  console.log('✓ Tags:', spec.tags.length);
  console.log('✓ Schemas:', Object.keys(spec.components.schemas).length);
"
```

Expected output:
```
✓ OpenAPI Version: 3.1.0
✓ Title: Sistem Informasi SOP Biro Organisasi API
✓ Endpoints: 40
✓ Tags: 12
✓ Schemas: 55
```

---

## Next Steps

1. **Import spec to Apidog** (see instructions above)
2. **Configure MCP** to point to your Apidog project
3. **Test integration** by asking AI about API endpoints
4. **Set up auto-sync** to keep Apidog updated with code changes

---

**Committed:** `2ddc783` — feat: add complete OpenAPI 3.1 specification with 40 endpoints
