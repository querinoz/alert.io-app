import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform, Pressable, Dimensions } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useIncidentStore } from '../../stores/incidentStore';
import { useFamilyStore } from '../../stores/familyStore';
import { useChainStore } from '../../stores/chainStore';
import { useAccessibilityStore } from '../../stores/accessibilityStore';
import { useLanguageStore } from '../../i18n';

type DemoPhase = 'auth' | 'map' | 'report' | 'family' | 'chain' | 'profile' | 'settings' | 'done';

type DemoStep = {
  phase: DemoPhase;
  label: string;
  action: () => Promise<void> | void;
  waitMs: number;
};

const PHASE_META: Record<DemoPhase, { icon: string; color: string; label: string }> = {
  auth:     { icon: '🔐', color: '#7B61FF', label: 'AUTH' },
  map:      { icon: '🗺️', color: '#00D4FF', label: 'MAP' },
  report:   { icon: '📝', color: '#FF3B7A', label: 'REPORT' },
  family:   { icon: '👨‍👩‍👧‍👦', color: '#FFB800', label: 'FAMILY' },
  chain:    { icon: '🔗', color: '#2196FF', label: 'CHAIN' },
  profile:  { icon: '👤', color: '#00FF88', label: 'PROFILE' },
  settings: { icon: '⚙️', color: '#FF9800', label: 'SETTINGS' },
  done:     { icon: '✅', color: '#00FF88', label: 'DONE' },
};

const STEP_DELAY = 1500;

// ── Web-only: cursor + toast (minimal) ─────────────────────────────────────

function injectDemoCSS() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.getElementById('demo-css-v2')) return;
  const s = document.createElement('style');
  s.id = 'demo-css-v2';
  s.textContent = `
    @keyframes demo-pill-in { from { opacity:0; transform:translateY(-8px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes demo-pill-out { from { opacity:1; } to { opacity:0; transform:translateY(-6px); } }
    #demo-pill {
      position:fixed; bottom:20px; right:20px; z-index:999999; pointer-events:none;
      background:rgba(8,10,18,0.94); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
      border-radius:12px; border:1px solid rgba(255,255,255,0.06); overflow:hidden;
      box-shadow:0 8px 32px rgba(0,0,0,0.5); min-width:280px; max-width:360px;
      animation: demo-pill-in 0.35s cubic-bezier(.16,1,.3,1) forwards;
    }
    #demo-pill.exit { animation: demo-pill-out 0.3s ease forwards; }
    #demo-pill .dp-accent { height:3px; width:100%; }
    #demo-pill .dp-body { padding:10px 14px; display:flex; align-items:center; gap:10px; }
    #demo-pill .dp-icon { font-size:16px; flex-shrink:0; }
    #demo-pill .dp-text { flex:1; min-width:0; }
    #demo-pill .dp-phase { font-family:'Courier New',monospace; font-size:8px; font-weight:800; letter-spacing:2px; text-transform:uppercase; margin-bottom:1px; }
    #demo-pill .dp-msg { font-family:system-ui,sans-serif; font-size:12px; font-weight:600; color:#E6EDF3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #demo-pill .dp-bar { height:2px; background:rgba(255,255,255,0.04); }
    #demo-pill .dp-bar-fill { height:100%; border-radius:1px; transition:width 0.4s ease; }
  `;
  document.head.appendChild(s);
}

function showDemoPill(opts: { icon: string; phase: string; msg: string; color: string; progress: number; total: number }) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  injectDemoCSS();
  let pill = document.getElementById('demo-pill');
  if (!pill) { pill = document.createElement('div'); pill.id = 'demo-pill'; document.body.appendChild(pill); }
  pill.classList.remove('exit');
  pill.innerHTML = `
    <div class="dp-accent" style="background:linear-gradient(90deg,${opts.color},${opts.color}60,transparent)"></div>
    <div class="dp-body">
      <span class="dp-icon">${opts.icon}</span>
      <div class="dp-text">
        <div class="dp-phase" style="color:${opts.color}">${opts.phase} · ${opts.progress}/${opts.total}</div>
        <div class="dp-msg">${opts.msg}</div>
      </div>
    </div>
    <div class="dp-bar"><div class="dp-bar-fill" style="width:${(opts.progress/opts.total)*100}%;background:${opts.color}"></div></div>
  `;
}

function hideDemoPill() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const pill = document.getElementById('demo-pill');
  if (pill) { pill.classList.add('exit'); setTimeout(() => pill.remove(), 350); }
}

// ── Native toast (compact) ─────────────────────────────────────────────────

type ToastData = { icon: string; phase: string; msg: string; color: string; progress: number; total: number };

function NativeToast({ data, visible }: { data: ToastData | null; visible: boolean }) {
  const slide = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && data) {
      Animated.parallel([
        Animated.spring(slide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 4 }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(progressAnim, { toValue: data.total > 0 ? data.progress / data.total : 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slide, { toValue: 80, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, data?.progress]);

  if (!data) return null;
  return (
    <Animated.View style={[ntStyles.container, { opacity, transform: [{ translateY: slide }] }]} pointerEvents="none">
      <View style={[ntStyles.accent, { backgroundColor: data.color }]} />
      <View style={ntStyles.body}>
        <Text style={ntStyles.icon}>{data.icon}</Text>
        <View style={ntStyles.textWrap}>
          <Text style={[ntStyles.phase, { color: data.color }]}>{data.phase} · {data.progress}/{data.total}</Text>
          <Text style={ntStyles.msg} numberOfLines={1}>{data.msg}</Text>
        </View>
      </View>
      <View style={ntStyles.barTrack}>
        <Animated.View style={[ntStyles.barFill, { backgroundColor: data.color, width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      </View>
    </Animated.View>
  );
}

const ntStyles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 20, right: 16, left: 16,
    zIndex: 999999, backgroundColor: 'rgba(8,10,18,0.95)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 24,
  },
  accent: { height: 3, width: '100%' },
  body: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
  icon: { fontSize: 16 },
  textWrap: { flex: 1, minWidth: 0 },
  phase: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 8, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  msg: { fontSize: 12, fontWeight: '600', color: '#E6EDF3', marginTop: 1 },
  barTrack: { height: 2, backgroundColor: 'rgba(255,255,255,0.04)' },
  barFill: { height: '100%', borderRadius: 1 },
});

// ── Main component ─────────────────────────────────────────────────────────

export function LiveDemoRunner({ onNavigate, autoStart }: { onNavigate: (screen: string) => void; autoStart?: boolean }) {
  const [running, setRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<DemoPhase | null>(null);
  const [currentStep, setCurrentStep] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const [toastData, setToastData] = useState<ToastData | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const isNative = Platform.OS !== 'web';

  useEffect(() => {
    if (Platform.OS === 'web') injectDemoCSS();
    Animated.timing(bannerOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  useEffect(() => {
    if (autoStart && !running) { const t = setTimeout(() => runDemo(), 1200); return () => clearTimeout(t); }
  }, [autoStart]);

  const togglePause = () => { const n = !paused; setPaused(n); pausedRef.current = n; };

  const runDemo = useCallback(async () => {
    if (running) return;
    setRunning(true);

    const wait = async (ms: number) => {
      const start = Date.now();
      while (Date.now() - start < ms) {
        if (pausedRef.current) { await new Promise(r => setTimeout(r, 100)); continue; }
        await new Promise(r => setTimeout(r, Math.min(100, ms - (Date.now() - start))));
      }
    };

    const auth = useAuthStore.getState;
    const incidents = useIncidentStore.getState;
    const family = useFamilyStore.getState;
    const chain = useChainStore.getState;
    const a11y = useAccessibilityStore.getState;
    const lang = useLanguageStore.getState;

    const steps: DemoStep[] = [
      // Auth — quick sign up + verify
      { phase: 'auth', label: 'Creating demo account...', action: async () => { if (auth().isAuthenticated) auth().signOut(); onNavigate('sign-up'); await auth().requestSignUp('demo@alert.io', 'demo12345', 'Demo User'); }, waitMs: STEP_DELAY },
      { phase: 'auth', label: 'Verifying account ✓', action: async () => { const code = auth().verificationCode; if (code) await auth().verifyCode('demo@alert.io', code); if (!auth().isAuthenticated) auth().signInDemo(); onNavigate('tabs'); }, waitMs: STEP_DELAY },

      // Map — load + interact
      { phase: 'map', label: 'Loading real-time incidents...', action: async () => { await incidents().loadIncidents(); }, waitMs: STEP_DELAY },
      { phase: 'map', label: 'Selecting incident on map', action: () => { const inc = incidents().incidents[0]; if (inc) { incidents().viewIncident(inc.id); incidents().selectIncident(inc); } }, waitMs: STEP_DELAY },
      { phase: 'map', label: 'Confirming + commenting', action: () => { const inc = incidents().incidents[0]; if (inc) { incidents().confirmIncident(inc.id); incidents().addComment(inc.id, 'Confirmed — I was nearby!'); } }, waitMs: STEP_DELAY },

      // Report
      { phase: 'report', label: 'Submitting new incident report', action: async () => { onNavigate('report'); await new Promise(r => setTimeout(r, 500)); await incidents().createIncident({ category: 'suspicious', severity: 'medium', title: 'Drone zona residencial', description: 'Drone não autorizado', location: { latitude: 41.24, longitude: -8.63 } }); onNavigate('tabs'); }, waitMs: STEP_DELAY + 500 },

      // Family
      { phase: 'family', label: 'Opening Family dashboard', action: async () => { onNavigate('family'); await family().loadFamily(); }, waitMs: STEP_DELAY },
      { phase: 'family', label: 'Sending check-in ✓', action: () => family().sendCheckIn(), waitMs: STEP_DELAY },

      // Chain
      { phase: 'chain', label: 'Creating safety chain', action: async () => { onNavigate('chain'); const u = auth().user; if (u) { await chain().createChain(u.uid, 'Demo Chain'); await chain().loadChains(u.uid); } }, waitMs: STEP_DELAY },
      { phase: 'chain', label: 'Adding members + SOS', action: async () => { const u = auth().user; const c = chain().activeChain; if (u && c) { await chain().addMember({ chainId: c.id, type: 'friend', name: 'Patrícia', ownerUid: u.uid, metadata: {} }); await chain().triggerSOS(c.id, u.uid, u.displayName, { latitude: 41.2356, longitude: -8.62 }); } }, waitMs: STEP_DELAY },

      // Profile + Settings
      { phase: 'profile', label: 'Viewing profile & Ghost Mode', action: () => { onNavigate('profile'); auth().updateProfile({ isGhostMode: true }); }, waitMs: STEP_DELAY },
      { phase: 'settings', label: 'Toggling theme & language', action: () => { onNavigate('settings'); a11y().set('lightTheme', true); }, waitMs: STEP_DELAY },
      { phase: 'settings', label: 'Restoring defaults', action: () => { a11y().reset(); lang().setLocale('pt-BR'); }, waitMs: STEP_DELAY },

      // Done
      { phase: 'done', label: 'Demo complete — all features shown!', action: () => { auth().signInDemo(); onNavigate('tabs'); }, waitMs: 2500 },
    ];

    setTotalSteps(steps.length);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setStepIndex(i + 1);
      setCurrentStep(step.label);
      setCurrentPhase(step.phase);

      const pm = PHASE_META[step.phase];
      const td: ToastData = { icon: pm.icon, phase: pm.label, msg: step.label, color: pm.color, progress: i + 1, total: steps.length };

      if (isNative) { setToastData(td); setToastVisible(true); }
      else showDemoPill(td);

      try { await step.action(); } catch {}
      await wait(step.waitMs);
    }

    if (!isNative) hideDemoPill();
    setToastVisible(false);
    setRunning(false);
    setCurrentPhase('done');
    setCurrentStep('Demo complete — tap START to replay');
  }, [running, onNavigate]);

  const progress = totalSteps > 0 ? stepIndex / totalSteps : 0;
  const pm = currentPhase ? PHASE_META[currentPhase] : null;

  return (
    <>
      {isNative && <NativeToast data={toastData} visible={toastVisible && running} />}

      {/* Compact floating pill — bottom-right, never overlays app content */}
      <Animated.View style={[styles.banner, { opacity: bannerOpacity }]} pointerEvents="box-none">
        <View style={styles.pill}>
          <Animated.View style={[styles.recDot, { opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }), transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }] }]} />
          {running ? (
            <>
              <Text style={[styles.pillText, pm ? { color: pm.color } : undefined]} numberOfLines={1}>
                {pm?.icon} {stepIndex}/{totalSteps}
              </Text>
              <View style={styles.pillProgress}>
                <View style={[styles.pillProgressFill, { width: `${progress * 100}%`, backgroundColor: pm?.color || '#00FF88' }]} />
              </View>
              <Pressable onPress={togglePause} style={styles.pillBtn}>
                <Text style={styles.pillBtnText}>{paused ? '▶' : '⏸'}</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={runDemo} style={styles.pillStartBtn}>
              <Text style={styles.pillStartText}>▶ DEMO</Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : Platform.OS === 'android' ? 70 : 16,
    right: 16,
    zIndex: 99998,
    pointerEvents: 'box-none',
  } as any,
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(6, 8, 14, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', cursor: 'default' } as any
      : { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 10 }),
  },
  recDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF2D2D',
  },
  pillText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : Platform.OS === 'web' ? "'Courier New', monospace" : 'monospace',
    fontSize: 9, fontWeight: '800', color: '#6E7681', letterSpacing: 1,
  },
  pillProgress: {
    width: 40, height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden',
  },
  pillProgressFill: {
    height: '100%', borderRadius: 2,
    ...(Platform.OS === 'web' ? { transition: 'width 0.4s ease' } as any : {}),
  },
  pillBtn: {
    width: 22, height: 22, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } as any : {}),
  },
  pillBtnText: { color: '#E6EDF3', fontSize: 10 },
  pillStartBtn: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    backgroundColor: 'rgba(0,255,136,0.1)', borderWidth: 1, borderColor: 'rgba(0,255,136,0.25)',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } as any : {}),
  },
  pillStartText: {
    color: '#00FF88',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : Platform.OS === 'web' ? "'Courier New', monospace" : 'monospace',
    fontSize: 9, fontWeight: '800', letterSpacing: 1.5,
  },
});
