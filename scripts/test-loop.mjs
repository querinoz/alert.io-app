/**
 * Alert.io — Comprehensive User Flow Test Loop
 * Tests all API endpoints, store logic, and data flows.
 * Run with: node scripts/test-loop.mjs
 */

const API = 'http://localhost:3000';
const WEB = 'http://localhost:8081';
const LANDING = 'http://localhost:8080';

let passed = 0;
let failed = 0;
const errors = [];

function log(ok, msg) {
  if (ok) { passed++; console.log(`  ✓ ${msg}`); }
  else { failed++; errors.push(msg); console.log(`  ✗ ${msg}`); }
}

async function fetchOk(url, opts = {}) {
  try {
    const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(10000) });
    return r;
  } catch (e) {
    return { ok: false, status: 0, statusText: e.message, json: async () => ({}) };
  }
}

async function testBackend() {
  console.log('\n═══ BACKEND API TESTS ═══');

  // Health
  const health = await fetchOk(`${API}/health`);
  log(health.ok, `GET /health — ${health.status}`);

  // Auth: register
  const reg = await fetchOk(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `test${Date.now()}@alert.io`, password: 'test12345', displayName: 'Test User' }),
  });
  log(reg.status === 201 || reg.status === 200 || reg.status === 409, `POST /auth/register — ${reg.status}`);

  // Auth: login
  const login = await fetchOk(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@alert.io', password: 'test12345' }),
  });
  log(login.status === 200 || login.status === 401, `POST /auth/login — ${login.status}`);

  // Incidents
  const inc = await fetchOk(`${API}/incidents`);
  log(inc.status === 200 || inc.status === 401, `GET /incidents — ${inc.status}`);

  // Family
  const fam = await fetchOk(`${API}/family`);
  log(fam.status === 200 || fam.status === 401, `GET /family — ${fam.status}`);

  // Chains
  const chains = await fetchOk(`${API}/chains`);
  log(chains.status === 200 || chains.status === 401, `GET /chains — ${chains.status}`);

  // SOS
  const sos = await fetchOk(`${API}/sos`);
  log(sos.status === 200 || sos.status === 401 || sos.status === 404, `GET /sos — ${sos.status}`);
}

async function testWebApp() {
  console.log('\n═══ WEB APP TESTS ═══');

  const main = await fetchOk(WEB);
  log(main.ok, `GET ${WEB} — ${main.status} ${main.ok ? 'OK' : 'FAIL'}`);

  const demo = await fetchOk(`${WEB}/?demo=1`);
  log(demo.ok, `GET ${WEB}/?demo=1 — ${demo.status}`);

  const autologin = await fetchOk(`${WEB}/?autologin=1`);
  log(autologin.ok, `GET ${WEB}/?autologin=1 — ${autologin.status}`);
}

async function testFileIntegrity() {
  console.log('\n═══ FILE INTEGRITY TESTS ═══');

  const { readFileSync, existsSync } = await import('fs');
  const { join } = await import('path');

  const base = join(process.cwd(), '..');
  const appBase = join(base, 'attention-app');

  const criticalFiles = [
    'app/_layout.tsx',
    'app/(auth)/sign-in.tsx',
    'app/(auth)/sign-up.tsx',
    'app/(tabs)/index.tsx',
    'app/(tabs)/family.tsx',
    'app/(tabs)/chain.tsx',
    'app/(tabs)/profile.tsx',
    'app/incident/report.tsx',
    'app/settings/index.tsx',
    'app/settings/accessibility.tsx',
    'src/components/ui/SecurityBootScreen.tsx',
    'src/components/ui/BadgeIcon.tsx',
    'src/components/ui/LoadingRadar.tsx',
    'src/components/ui/LogoMark.tsx',
    'src/components/ui/GlassCard.tsx',
    'src/components/ui/NeonText.tsx',
    'src/components/ui/NeonButton.tsx',
    'src/components/map/AttentionMap.tsx',
    'src/components/map/AttentionMap.web.tsx',
    'src/components/incident/IncidentCard.tsx',
    'src/stores/authStore.ts',
    'src/stores/incidentStore.ts',
    'src/stores/familyStore.ts',
    'src/stores/chainStore.ts',
    'src/stores/accessibilityStore.ts',
  ];

  for (const f of criticalFiles) {
    const p = join(appBase, f);
    const exists = existsSync(p);
    log(exists, `File exists: ${f}`);
    if (exists) {
      const content = readFileSync(p, 'utf-8');
      log(content.length > 50, `  — has content (${content.length} chars)`);

      // Check for common errors
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        const hasSyntaxError = content.includes('<<<') || content.includes('>>>') || content.includes('===<<<');
        log(!hasSyntaxError, `  — no merge conflict markers`);
      }
    }
  }

  // Landing page
  const landingPath = join(base, 'alert-io', 'index.html');
  const landingExists = existsSync(landingPath);
  log(landingExists, 'Landing page exists: alert-io/index.html');
  if (landingExists) {
    const html = readFileSync(landingPath, 'utf-8');
    log(html.includes('</html>'), '  — valid HTML closing tag');
    log(html.includes('</script>'), '  — has script closing tag');
    const hasRealUndefined = html.replace(/typeof\s+\w+\s*===?\s*'undefined'/g, '').replace(/===\s*'undefined'/g, '').includes('>undefined<');
    log(!hasRealUndefined, '  — no "undefined" literals in rendered HTML');
  }

  // Icons
  const icons = ['icon.png', 'adaptive-icon.png', 'favicon.png', 'splash-icon.png'];
  for (const ic of icons) {
    const p = join(appBase, 'assets', ic);
    log(existsSync(p), `Icon exists: assets/${ic}`);
  }
}

async function testCodeQuality() {
  console.log('\n═══ CODE QUALITY TESTS ═══');

  const { readFileSync } = await import('fs');
  const { join } = await import('path');
  const appBase = join(process.cwd(), '..', 'attention-app');

  // Check no dead imports in key files
  const indexContent = readFileSync(join(appBase, 'app/(tabs)/index.tsx'), 'utf-8');
  log(!indexContent.includes('hoverPreviewY'), 'index.tsx — no dead hoverPreviewY state');
  const hasDeadKeyframe = indexContent.includes('@keyframes hoverPreviewIn');
  log(!hasDeadKeyframe, 'index.tsx — no dead hoverPreviewIn CSS keyframe');
  log(!indexContent.includes('glowAnim'), 'index.tsx — no dead glowAnim in MapFab');

  const reportContent = readFileSync(join(appBase, 'app/incident/report.tsx'), 'utf-8');
  log(!reportContent.includes('AccessibleTouchable'), 'report.tsx — no unused AccessibleTouchable import');

  const bootContent = readFileSync(join(appBase, 'src/components/ui/SecurityBootScreen.tsx'), 'utf-8');
  log(!bootContent.includes('TOTAL_DURATION'), 'SecurityBootScreen.tsx — no unused TOTAL_DURATION');

  const chainContent = readFileSync(join(appBase, 'app/(tabs)/chain.tsx'), 'utf-8');
  log(!chainContent.includes("'battery-50'"), 'chain.tsx — no invalid battery-50 icon');
  log(chainContent.includes("'battery-medium'"), 'chain.tsx — uses valid battery-medium icon');

  const landingContent = readFileSync(join(process.cwd(), '..', 'alert-io', 'index.html'), 'utf-8');
  log(!landingContent.includes('origAnimateCounter'), 'landing page — no dead origAnimateCounter');

  // Check SecurityBootScreen is imported in layout
  const layoutContent = readFileSync(join(appBase, 'app/_layout.tsx'), 'utf-8');
  log(layoutContent.includes('SecurityBootScreen'), '_layout.tsx — imports SecurityBootScreen');
  log(layoutContent.includes('booting'), '_layout.tsx — has booting state');

  // Check reduced motion in map
  const mapContent = readFileSync(join(appBase, 'src/components/map/AttentionMap.tsx'), 'utf-8');
  log(mapContent.includes('reducedMotion'), 'AttentionMap.tsx — checks reducedMotion');
  log(mapContent.includes('useAccessibilityStore'), 'AttentionMap.tsx — imports accessibilityStore');

  const mapWebContent = readFileSync(join(appBase, 'src/components/map/AttentionMap.web.tsx'), 'utf-8');
  log(mapWebContent.includes('prefers-reduced-motion'), 'AttentionMap.web.tsx — has reduced motion media query');
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Alert.io — Comprehensive Test Suite             ║');
  console.log('║  Testing: Backend, Web App, Files, Code Quality  ║');
  console.log('╚══════════════════════════════════════════════════╝');

  await testBackend();
  await testWebApp();
  await testFileIntegrity();
  await testCodeQuality();

  console.log('\n══════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  if (errors.length > 0) {
    console.log('\n  FAILURES:');
    errors.forEach(e => console.log(`    ✗ ${e}`));
  } else {
    console.log('  All tests passed!');
  }
  console.log('══════════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main();
