# Netlify SPA Debugging Guide

## Check Build Output
```bash
cd client
npm run build
ls -la build/          # Should see index.html
cat build/_redirects   # Should contain: /*    /index.html   200
```

## Verify Netlify Configuration
1. Check netlify.toml in repo root
2. Verify no conflicting UI settings
3. Ensure publish directory matches build output

## Test Locally
```bash
# Serve build folder locally
npx serve -s build
# Test routes: http://localhost:3000/login
```

## Common Error Messages
- "Page Not Found" = Missing redirect rule
- "Build failed" = Wrong build command/directory
- "Site not updating" = Cached deployment, clear cache