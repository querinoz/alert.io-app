/**
 * Attention Safety Widget — Web Embed Script
 *
 * Paste this into any webpage to add a floating safety button and overlay:
 *
 *   <script src="https://cdn.attention-app.com/widget.js"
 *     data-api-key="YOUR_API_KEY"
 *     data-position="bottom-right"
 *     data-theme="dark"
 *   ></script>
 *
 * Or initialize programmatically:
 *
 *   AttentionWidget.init({
 *     apiKey: 'YOUR_API_KEY',
 *     position: 'bottom-right',
 *     user: { uid: '123', displayName: 'John' },
 *   });
 */

interface WebWidgetConfig {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  theme?: 'dark' | 'light';
  user?: { uid: string; displayName: string; email?: string };
  features?: string[];
  sosHoldDuration?: number;
  onSOS?: (location: { latitude: number; longitude: number } | null) => void;
  onEvent?: (event: any) => void;
}

const WIDGET_ID = 'attention-safety-widget';

const CSS = `
  #${WIDGET_ID} {
    position: fixed;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  #${WIDGET_ID}.pos-bottom-right { bottom: 24px; right: 16px; }
  #${WIDGET_ID}.pos-bottom-left { bottom: 24px; left: 16px; }
  #${WIDGET_ID}.pos-bottom-center { bottom: 24px; left: 50%; transform: translateX(-50%); }

  .attn-fab {
    width: 60px; height: 60px; border-radius: 50%;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 2px solid rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    font-size: 26px; user-select: none;
  }
  .attn-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0,122,255,0.3); }
  .attn-fab:active { transform: scale(0.95); }

  .attn-panel {
    position: absolute; bottom: 72px; right: 0; width: 340px;
    background: rgba(18,18,24,0.97); backdrop-filter: blur(20px);
    border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    overflow: hidden; display: none;
  }
  .attn-panel.open { display: block; animation: attn-slide 0.25s ease; }
  @keyframes attn-slide { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }

  .attn-panel-header {
    padding: 16px 18px; border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex; justify-content: space-between; align-items: center;
  }
  .attn-panel-header h3 { margin:0; color:#fff; font-size:16px; font-weight:700; }
  .attn-panel-close {
    width:28px; height:28px; border-radius:14px;
    background: rgba(255,255,255,0.1); border:none; color:#fff;
    font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center;
  }

  .attn-panel-body { padding: 16px; max-height: 360px; overflow-y: auto; }

  .attn-action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .attn-action {
    background: rgba(255,255,255,0.06); border-radius: 12px;
    padding: 16px 12px; text-align: center; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s;
  }
  .attn-action:hover { background: rgba(255,255,255,0.12); transform: translateY(-2px); }
  .attn-action-icon { font-size: 28px; margin-bottom: 6px; }
  .attn-action-label { color: #fff; font-size: 12px; font-weight: 600; }

  .attn-sos-bar { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.08); }
  .attn-sos-btn {
    width: 100%; padding: 12px; background: #FF3B30; color: #fff;
    border: none; border-radius: 12px; font-size: 14px; font-weight: 800;
    letter-spacing: 1px; cursor: pointer; transition: all 0.2s;
  }
  .attn-sos-btn:hover { background: #CC0000; transform: scale(1.02); }

  .attn-status {
    padding: 10px 16px; background: rgba(52,199,89,0.1);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; gap: 8px;
  }
  .attn-status-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #34C759;
    animation: attn-pulse 2s infinite;
  }
  @keyframes attn-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .attn-status-text { color: rgba(255,255,255,0.7); font-size: 12px; }
`;

function createWidget(config: WebWidgetConfig) {
  if (document.getElementById(WIDGET_ID)) return;

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = WIDGET_ID;
  container.className = `pos-${config.position || 'bottom-right'}`;

  const panel = document.createElement('div');
  panel.className = 'attn-panel';
  panel.innerHTML = `
    <div class="attn-panel-header">
      <h3>🛡️ Attention Safety</h3>
      <button class="attn-panel-close">✕</button>
    </div>
    <div class="attn-status">
      <div class="attn-status-dot"></div>
      <span class="attn-status-text">Safety layer active · Monitoring</span>
    </div>
    <div class="attn-panel-body">
      <div class="attn-action-grid">
        <div class="attn-action" data-action="sos">
          <div class="attn-action-icon">🆘</div>
          <div class="attn-action-label">SOS</div>
        </div>
        <div class="attn-action" data-action="report">
          <div class="attn-action-icon">⚠️</div>
          <div class="attn-action-label">Report</div>
        </div>
        <div class="attn-action" data-action="alerts">
          <div class="attn-action-icon">🔔</div>
          <div class="attn-action-label">Alerts</div>
        </div>
        <div class="attn-action" data-action="chain">
          <div class="attn-action-icon">🔗</div>
          <div class="attn-action-label">Chain</div>
        </div>
        <div class="attn-action" data-action="location">
          <div class="attn-action-icon">📍</div>
          <div class="attn-action-label">Share Location</div>
        </div>
        <div class="attn-action" data-action="score">
          <div class="attn-action-icon">📊</div>
          <div class="attn-action-label">Safety Score</div>
        </div>
      </div>
    </div>
    <div class="attn-sos-bar">
      <button class="attn-sos-btn">🆘 EMERGENCY SOS</button>
    </div>
  `;

  const fab = document.createElement('div');
  fab.className = 'attn-fab';
  fab.textContent = '🛡️';

  let isOpen = false;
  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    fab.textContent = isOpen ? '✕' : '🛡️';
  });

  panel.querySelector('.attn-panel-close')!.addEventListener('click', () => {
    isOpen = false;
    panel.classList.remove('open');
    fab.textContent = '🛡️';
  });

  panel.querySelectorAll('.attn-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = (btn as HTMLElement).dataset.action;
      config.onEvent?.({ type: `widget_${action}`, timestamp: Date.now() });

      if (action === 'sos') {
        triggerSOS(config);
      }
    });
  });

  panel.querySelector('.attn-sos-btn')!.addEventListener('click', () => {
    triggerSOS(config);
  });

  container.appendChild(panel);
  container.appendChild(fab);
  document.body.appendChild(container);
}

function triggerSOS(config: WebWidgetConfig) {
  if (!navigator.geolocation) {
    config.onSOS?.(null);
    config.onEvent?.({ type: 'sos_triggered', timestamp: Date.now(), data: { location: null } });
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      config.onSOS?.(location);
      config.onEvent?.({ type: 'sos_triggered', timestamp: Date.now(), data: { location } });
    },
    () => {
      config.onSOS?.(null);
      config.onEvent?.({ type: 'sos_triggered', timestamp: Date.now(), data: { location: null } });
    }
  );
}

function destroyWidget() {
  const el = document.getElementById(WIDGET_ID);
  if (el) el.remove();
}

if (typeof window !== 'undefined') {
  (window as any).AttentionWidget = { init: createWidget, destroy: destroyWidget };

  if (typeof document !== 'undefined') {
    const script = document.querySelector('script[data-api-key]') as HTMLScriptElement | null;
    if (script) {
      createWidget({
        apiKey: script.dataset.apiKey || '',
        position: (script.dataset.position as any) || 'bottom-right',
        theme: (script.dataset.theme as any) || 'dark',
      });
    }
  }
}

export { createWidget, destroyWidget };
export type { WebWidgetConfig };
