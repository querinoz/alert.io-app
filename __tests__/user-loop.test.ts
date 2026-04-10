/**
 * COMPREHENSIVE USER LOOP TEST
 * Simulates a full user session through every function in the application.
 * Acts as a real user: sign up, login, navigate every screen, interact with
 * every feature, verify state at each step, and sign out.
 */

// ─── MOCKS ──────────────────────────────────────────────────────────────────

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));

jest.mock('../src/services/authService', () => ({
  signInWithEmail: jest.fn(),
  requestSignUp: jest.fn(),
  verifyCode: jest.fn(),
  signOutUser: jest.fn(async () => {}),
  onAuthChange: jest.fn(() => () => {}),
}));

jest.mock('../src/services/publicDataService', () => ({
  fetchAllPublicData: jest.fn(async () => []),
}));

// ─── IMPORTS ────────────────────────────────────────────────────────────────

import { useAuthStore } from '../src/stores/authStore';
import { useIncidentStore } from '../src/stores/incidentStore';
import { useFamilyStore } from '../src/stores/familyStore';
import { useChainStore } from '../src/stores/chainStore';
import { useAccessibilityStore } from '../src/stores/accessibilityStore';
import { useLanguageStore } from '../src/i18n';
import { BADGES, getBadgeForReputation, getProgressToNextLevel } from '../src/constants/badges';
import { analyzeCredibility } from '../src/services/credibilityEngine';

// ─── HELPERS ────────────────────────────────────────────────────────────────

function resetAllStores() {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    authError: null,
    isDemoMode: false,
    pendingEmail: null,
    verificationCode: null,
    isVerifying: false,
  });
  useIncidentStore.setState({
    incidents: [],
    selectedIncident: null,
    filterCategory: null,
    isLoading: false,
    publicDataLoaded: false,
  });
  useAccessibilityStore.getState().reset();
  useLanguageStore.setState({ locale: 'pt-BR' });
}

// ─── TEST SUITE ─────────────────────────────────────────────────────────────

describe('🔄 FULL USER LOOP TEST — Acting as a real user', () => {
  beforeEach(() => {
    resetAllStores();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: AUTHENTICATION FLOW
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Phase 1: Authentication', () => {
    test('1.1 — App starts with no user logged in', () => {
      const auth = useAuthStore.getState();
      expect(auth.user).toBeNull();
      expect(auth.isAuthenticated).toBe(false);
      expect(auth.isDemoMode).toBe(false);
      expect(auth.isLoading).toBe(false);
      expect(auth.authError).toBeNull();
    });

    test('1.2 — User signs in with Demo mode', () => {
      useAuthStore.getState().signInDemo();
      const auth = useAuthStore.getState();

      expect(auth.user).not.toBeNull();
      expect(auth.isAuthenticated).toBe(true);
      expect(auth.isDemoMode).toBe(true);
      expect(auth.user!.displayName).toBe('Eduardo Q.');
      expect(auth.user!.uid).toBe('mock-user-001');
      expect(auth.user!.reputation).toBe(203750);
      expect(auth.user!.isGuardian).toBe(true);
      expect(auth.user!.level).toBe(31);
    });

    test('1.3 — User signs out and state resets', () => {
      useAuthStore.getState().signInDemo();
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      useAuthStore.getState().signOut();
      const auth = useAuthStore.getState();
      expect(auth.user).toBeNull();
      expect(auth.isAuthenticated).toBe(false);
      expect(auth.isDemoMode).toBe(false);
    });

    test('1.4 — Sign up flow: request → verify code', async () => {
      const store = useAuthStore.getState();
      await store.requestSignUp('test@example.com', 'password123', 'Test User');

      let auth = useAuthStore.getState();
      expect(auth.isVerifying).toBe(true);
      expect(auth.pendingEmail).toBe('test@example.com');
      expect(auth.verificationCode).toBeTruthy();
      expect(auth.verificationCode).toHaveLength(6);

      const code = auth.verificationCode!;
      await auth.verifyCode('test@example.com', code);

      auth = useAuthStore.getState();
      expect(auth.isAuthenticated).toBe(true);
      expect(auth.isVerifying).toBe(false);
      expect(auth.verificationCode).toBeNull();
    });

    test('1.5 — Invalid verification code rejected', async () => {
      await useAuthStore.getState().requestSignUp('test@example.com', 'pass12345', 'Test');
      const auth = useAuthStore.getState();
      expect(auth.isVerifying).toBe(true);

      await expect(auth.verifyCode('test@example.com', '000000')).rejects.toThrow();
      expect(useAuthStore.getState().authError).toContain('Invalid');
    });

    test('1.6 — Error cleared properly', async () => {
      await useAuthStore.getState().requestSignUp('a@b.com', '12345678', 'X');
      try { await useAuthStore.getState().verifyCode('a@b.com', '999999'); } catch {}
      expect(useAuthStore.getState().authError).toBeTruthy();

      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().authError).toBeNull();
    });

    test('1.7 — Profile update works', () => {
      useAuthStore.getState().signInDemo();
      useAuthStore.getState().updateProfile({ isGhostMode: true, displayName: 'Ghost User' });

      const user = useAuthStore.getState().user!;
      expect(user.isGhostMode).toBe(true);
      expect(user.displayName).toBe('Ghost User');
    });

    test('1.8 — Auth listener initializes and returns unsubscribe', () => {
      const unsub = useAuthStore.getState().initAuthListener();
      expect(typeof unsub).toBe('function');
      unsub();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: INCIDENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Phase 2: Incidents (Map Screen)', () => {
    beforeEach(() => {
      useAuthStore.getState().signInDemo();
    });

    test('2.1 — Load mock incidents', async () => {
      await useIncidentStore.getState().loadIncidents();
      const incidents = useIncidentStore.getState().incidents;
      expect(incidents.length).toBeGreaterThan(0);
    });

    test('2.2 — Create a new incident', async () => {
      const before = useIncidentStore.getState().incidents.length;
      await useIncidentStore.getState().createIncident({
        category: 'robbery',
        severity: 'high',
        title: 'Test incident report',
        description: 'Testing the incident creation flow',
        location: { latitude: 41.2356, longitude: -8.6200 },
      });

      const state = useIncidentStore.getState();
      expect(state.incidents.length).toBe(before + 1);
      expect(state.isLoading).toBe(false);

      const created = state.incidents[0];
      expect(created.title).toBe('Test incident report');
      expect(created.category).toBe('robbery');
      expect(created.severity).toBe('high');
      expect(created.reporterName).toBe('Eduardo Q.');
      expect(created.confirmCount).toBe(0);
      expect(created.denyCount).toBe(0);
      expect(created.status).toBe('active');
      expect(created.source).toBe('community');
    });

    test('2.3 — Confirm an incident increments count', async () => {
      await useIncidentStore.getState().loadIncidents();
      const incident = useIncidentStore.getState().incidents[0];
      const beforeCount = incident.confirmCount;

      useIncidentStore.getState().confirmIncident(incident.id);

      const updated = useIncidentStore.getState().incidents.find(i => i.id === incident.id)!;
      expect(updated.confirmCount).toBe(beforeCount + 1);
    });

    test('2.4 — Deny an incident increments count', async () => {
      await useIncidentStore.getState().loadIncidents();
      const incident = useIncidentStore.getState().incidents[0];
      const beforeCount = incident.denyCount;

      useIncidentStore.getState().denyIncident(incident.id);

      const updated = useIncidentStore.getState().incidents.find(i => i.id === incident.id)!;
      expect(updated.denyCount).toBe(beforeCount + 1);
    });

    test('2.5 — View incident increments views', async () => {
      await useIncidentStore.getState().loadIncidents();
      const incident = useIncidentStore.getState().incidents[0];
      const beforeViews = incident.views;

      useIncidentStore.getState().viewIncident(incident.id);

      const updated = useIncidentStore.getState().incidents.find(i => i.id === incident.id)!;
      expect(updated.views).toBe(beforeViews + 1);
    });

    test('2.6 — Add comment to incident', async () => {
      await useIncidentStore.getState().loadIncidents();
      const incident = useIncidentStore.getState().incidents[0];
      const beforeComments = incident.commentCount;

      useIncidentStore.getState().addComment(incident.id, 'I saw this too!');

      const updated = useIncidentStore.getState().incidents.find(i => i.id === incident.id)!;
      expect(updated.commentCount).toBe(beforeComments + 1);
      expect(updated.comments.length).toBeGreaterThan(0);
      expect(updated.comments[updated.comments.length - 1].text).toBe('I saw this too!');
      expect(updated.comments[updated.comments.length - 1].userName).toBe('Eduardo Q.');
    });

    test('2.7 — Empty comment is ignored', async () => {
      await useIncidentStore.getState().loadIncidents();
      const incident = useIncidentStore.getState().incidents[0];
      const beforeCount = incident.commentCount;

      useIncidentStore.getState().addComment(incident.id, '   ');

      const updated = useIncidentStore.getState().incidents.find(i => i.id === incident.id)!;
      expect(updated.commentCount).toBe(beforeCount);
    });

    test('2.8 — Select and deselect incident', async () => {
      await useIncidentStore.getState().loadIncidents();
      const incident = useIncidentStore.getState().incidents[0];

      useIncidentStore.getState().selectIncident(incident);
      expect(useIncidentStore.getState().selectedIncident).toEqual(incident);

      useIncidentStore.getState().selectIncident(null);
      expect(useIncidentStore.getState().selectedIncident).toBeNull();
    });

    test('2.9 — Filter by category', () => {
      useIncidentStore.getState().setFilter('robbery');
      expect(useIncidentStore.getState().filterCategory).toBe('robbery');

      useIncidentStore.getState().setFilter(null);
      expect(useIncidentStore.getState().filterCategory).toBeNull();
    });

    test('2.10 — Verify incident as guardian', async () => {
      await useIncidentStore.getState().loadIncidents();
      const unverified = useIncidentStore.getState().incidents.find(i => !i.isVerified);
      if (!unverified) return;

      useIncidentStore.getState().verifyIncident(unverified.id, 'guardian-001', 'Eduardo Q.');

      const updated = useIncidentStore.getState().incidents.find(i => i.id === unverified.id)!;
      expect(updated.isVerified).toBe(true);
      expect(updated.verifiedByName).toBe('Eduardo Q.');
    });

    test('2.11 — Auto-verify at 10 confirms', async () => {
      await useIncidentStore.getState().createIncident({
        category: 'fire',
        severity: 'critical',
        title: 'Fire downtown',
        description: 'Big fire',
        location: { latitude: 41.23, longitude: -8.62 },
      });
      const id = useIncidentStore.getState().incidents[0].id;

      for (let i = 0; i < 10; i++) {
        useIncidentStore.getState().confirmIncident(id);
      }

      const updated = useIncidentStore.getState().incidents.find(i => i.id === id)!;
      expect(updated.confirmCount).toBe(10);
      expect(updated.isVerified).toBe(true);
    });

    test('2.12 — Auto-flag as fake at 10 denies', async () => {
      await useIncidentStore.getState().createIncident({
        category: 'noise',
        severity: 'low',
        title: 'Fake report test',
        description: 'Testing fake detection',
        location: { latitude: 41.23, longitude: -8.62 },
      });
      const id = useIncidentStore.getState().incidents[0].id;

      for (let i = 0; i < 10; i++) {
        useIncidentStore.getState().denyIncident(id);
      }

      const updated = useIncidentStore.getState().incidents.find(i => i.id === id)!;
      expect(updated.denyCount).toBe(10);
      expect(updated.isFakeReport).toBe(true);
      expect(updated.status).toBe('removed');
    });

    test('2.13 — Add incident directly', () => {
      const direct: any = {
        id: 'direct-001', reporterUid: 'x', reporterName: 'X', reporterLevel: 1,
        reporterBadge: 'X', category: 'other', severity: 'low', title: 'Direct add',
        description: '', location: { latitude: 0, longitude: 0 }, geohash: '',
        address: null, photoURLs: [], confirmCount: 0, denyCount: 0,
        credibilityScore: 50, status: 'active', isVerified: false, isFakeReport: false,
        verifiedByUid: null, views: 0, commentCount: 0, comments: [],
        createdAt: Date.now(), expiresAt: Date.now() + 86400000,
      };
      useIncidentStore.getState().addIncidentDirect(direct);
      expect(useIncidentStore.getState().incidents.find(i => i.id === 'direct-001')).toBeTruthy();

      useIncidentStore.getState().addIncidentDirect(direct);
      expect(useIncidentStore.getState().incidents.filter(i => i.id === 'direct-001').length).toBe(1);
    });

    test('2.14 — Load public data sets flag', async () => {
      expect(useIncidentStore.getState().publicDataLoaded).toBe(false);
      await useIncidentStore.getState().loadPublicData();
      expect(useIncidentStore.getState().publicDataLoaded).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: FAMILY SCREEN
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Phase 3: Family', () => {
    beforeEach(() => {
      useAuthStore.getState().signInDemo();
    });

    test('3.1 — Load family populates group and members', async () => {
      await useFamilyStore.getState().loadFamily();
      const state = useFamilyStore.getState();

      expect(state.activeGroup).not.toBeNull();
      expect(state.activeGroup!.name).toBeTruthy();
      expect(state.members.length).toBeGreaterThan(0);
      expect(state.isLoading).toBe(false);
    });

    test('3.2 — Family group has invite code', async () => {
      await useFamilyStore.getState().loadFamily();
      expect(useFamilyStore.getState().activeGroup!.inviteCode).toBeTruthy();
    });

    test('3.3 — Members have required fields', async () => {
      await useFamilyStore.getState().loadFamily();
      const members = useFamilyStore.getState().members;

      for (const m of members) {
        expect(m.uid).toBeTruthy();
        expect(m.displayName).toBeTruthy();
        expect(['admin', 'member', 'kid']).toContain(m.role);
        expect(typeof m.locationSharingEnabled).toBe('boolean');
      }
    });

    test('3.4 — Kid members have safe zone info', async () => {
      await useFamilyStore.getState().loadFamily();
      const kids = useFamilyStore.getState().members.filter(m => m.role === 'kid');

      for (const kid of kids) {
        expect(typeof kid.isInSafeZone).toBe('boolean');
      }
    });

    test('3.5 — Send check-in does not crash', async () => {
      await useFamilyStore.getState().loadFamily();
      expect(() => useFamilyStore.getState().sendCheckIn()).not.toThrow();
    });

    test('3.6 — Select group updates state', async () => {
      await useFamilyStore.getState().loadFamily();
      const group = useFamilyStore.getState().activeGroup!;

      useFamilyStore.getState().selectGroup(null);
      expect(useFamilyStore.getState().activeGroup).toBeNull();

      useFamilyStore.getState().selectGroup(group);
      expect(useFamilyStore.getState().activeGroup).toEqual(group);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 4: CHAIN SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Phase 4: Chain System', () => {
    beforeEach(() => {
      useAuthStore.getState().signInDemo();
      useChainStore.setState({ chains: [], activeChain: null, members: [], messages: [], alerts: [], isLoading: false });
    });

    test('4.1 — Create a new chain', async () => {
      const user = useAuthStore.getState().user!;
      const chainId = await useChainStore.getState().createChain(user.uid, 'My Safety Chain');
      expect(chainId).toBeTruthy();
    });

    test('4.2 — Load chains for user', async () => {
      const user = useAuthStore.getState().user!;
      await useChainStore.getState().createChain(user.uid, 'Test Chain');
      await useChainStore.getState().loadChains(user.uid);

      const state = useChainStore.getState();
      expect(state.chains.length).toBeGreaterThan(0);
      expect(state.activeChain).not.toBeNull();
    });

    test('4.3 — Add members of different types', async () => {
      const user = useAuthStore.getState().user!;
      await useChainStore.getState().createChain(user.uid, 'Chain');
      await useChainStore.getState().loadChains(user.uid);
      const chain = useChainStore.getState().activeChain!;

      const types: Array<{ type: any; name: string }> = [
        { type: 'friend', name: 'Patrícia' },
        { type: 'pet', name: 'Rex' },
        { type: 'vehicle', name: 'Audi A3' },
        { type: 'device', name: 'AirTag Chaves' },
      ];

      for (const { type, name } of types) {
        const id = await useChainStore.getState().addMember({
          chainId: chain.id, type, name, ownerUid: user.uid, metadata: {},
        });
        expect(id).toBeTruthy();
      }

      const members = useChainStore.getState().members;
      expect(members.length).toBe(4);
      expect(members.map(m => m.type).sort()).toEqual(['device', 'friend', 'pet', 'vehicle']);
    });

    test('4.4 — Send text message', async () => {
      const user = useAuthStore.getState().user!;
      await useChainStore.getState().createChain(user.uid, 'Chat Test');
      await useChainStore.getState().loadChains(user.uid);
      const chain = useChainStore.getState().activeChain!;

      await useChainStore.getState().sendMessage(chain.id, user.uid, user.displayName, 'text', 'Hello world');

      const messages = useChainStore.getState().messages;
      expect(messages.length).toBe(1);
      expect(messages[0].content).toBe('Hello world');
      expect(messages[0].type).toBe('text');
    });

    test('4.5 — Send location message', async () => {
      const user = useAuthStore.getState().user!;
      await useChainStore.getState().createChain(user.uid, 'Loc Test');
      await useChainStore.getState().loadChains(user.uid);
      const chain = useChainStore.getState().activeChain!;

      await useChainStore.getState().sendMessage(chain.id, user.uid, user.displayName, 'location', 'My location', {
        location: { latitude: 41.2356, longitude: -8.6200 },
      });

      const messages = useChainStore.getState().messages;
      const locMsg = messages.find(m => m.type === 'location');
      expect(locMsg).toBeTruthy();
      expect(locMsg!.content).toBe('My location');
    });

    test('4.6 — Send alert', async () => {
      const user = useAuthStore.getState().user!;
      await useChainStore.getState().createChain(user.uid, 'Alert Test');
      await useChainStore.getState().loadChains(user.uid);
      const chain = useChainStore.getState().activeChain!;

      await useChainStore.getState().sendAlert(
        chain.id, user.uid, user.displayName, 'custom',
        'Ping: Rex', 'Location requested', 'info',
      );

      const alerts = useChainStore.getState().alerts;
      expect(alerts.length).toBe(1);
      expect(alerts[0].title).toBe('Ping: Rex');
      expect(alerts[0].severity).toBe('info');
      expect(alerts[0].isAcknowledged).toBe(false);
    });

    test('4.7 — Acknowledge alert', async () => {
      const user = useAuthStore.getState().user!;
      await useChainStore.getState().createChain(user.uid, 'Ack Test');
      await useChainStore.getState().loadChains(user.uid);
      const chain = useChainStore.getState().activeChain!;

      await useChainStore.getState().sendAlert(chain.id, user.uid, user.displayName, 'custom', 'Test', 'Msg', 'warning');
      const alertId = useChainStore.getState().alerts[0].id;

      await useChainStore.getState().acknowledgeAlert(alertId, user.uid);

      const updated = useChainStore.getState().alerts.find(a => a.id === alertId)!;
      expect(updated.isAcknowledged).toBe(true);
    });

    test('4.8 — Trigger SOS creates alert + message', async () => {
      const user = useAuthStore.getState().user!;
      await useChainStore.getState().createChain(user.uid, 'SOS Test');
      await useChainStore.getState().loadChains(user.uid);
      const chain = useChainStore.getState().activeChain!;

      await useChainStore.getState().triggerSOS(chain.id, user.uid, user.displayName, {
        latitude: 41.2356, longitude: -8.6200,
      });

      const alerts = useChainStore.getState().alerts;
      const messages = useChainStore.getState().messages;
      expect(alerts.length).toBeGreaterThanOrEqual(1);
      const sosAlert = alerts.find(a => a.type === 'sos');
      expect(sosAlert).toBeTruthy();
      expect(sosAlert!.severity).toBe('critical');
      const sosMsg = messages.find(m => m.type === 'sos');
      expect(sosMsg).toBeTruthy();
    });

    test('4.9 — Join chain by code', async () => {
      const user = useAuthStore.getState().user!;
      await useChainStore.getState().createChain(user.uid, 'Join Test');
      await useChainStore.getState().loadChains(user.uid);
      const code = useChainStore.getState().activeChain!.inviteCode;

      const success = await useChainStore.getState().joinChain(code, 'user-999');
      expect(success).toBe(true);
    });

    test('4.10 — Join with invalid code fails', async () => {
      const success = await useChainStore.getState().joinChain('INVALID', 'user-999');
      expect(success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 5: ACCESSIBILITY & SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Phase 5: Accessibility & Settings', () => {
    test('5.1 — Default accessibility values', () => {
      const store = useAccessibilityStore.getState();
      expect(store.highContrast).toBe(false);
      expect(store.largeText).toBe(false);
      expect(store.reducedMotion).toBe(false);
      expect(store.hapticFeedback).toBe(true);
      expect(store.voiceGuidance).toBe(false);
      expect(store.screenReaderEnabled).toBe(false);
      expect(store.largeTargets).toBe(false);
      expect(store.simplifiedUI).toBe(false);
      expect(store.lightTheme).toBe(false);
    });

    test('5.2 — Toggle each accessibility setting', () => {
      const store = useAccessibilityStore.getState();
      const keys: Array<keyof typeof store> = [
        'highContrast', 'largeText', 'reducedMotion', 'voiceGuidance',
        'screenReaderEnabled', 'largeTargets', 'simplifiedUI', 'lightTheme',
      ];

      for (const key of keys) {
        if (key === 'set' || key === 'reset') continue;
        store.set(key as any, true);
        expect(useAccessibilityStore.getState()[key]).toBe(true);
      }
    });

    test('5.3 — Disable haptic feedback', () => {
      useAccessibilityStore.getState().set('hapticFeedback', false);
      expect(useAccessibilityStore.getState().hapticFeedback).toBe(false);
    });

    test('5.4 — Reset returns to defaults', () => {
      const store = useAccessibilityStore.getState();
      store.set('highContrast', true);
      store.set('largeText', true);
      store.set('reducedMotion', true);

      store.reset();

      const after = useAccessibilityStore.getState();
      expect(after.highContrast).toBe(false);
      expect(after.largeText).toBe(false);
      expect(after.reducedMotion).toBe(false);
      expect(after.hapticFeedback).toBe(true);
    });

    test('5.5 — Language switching', () => {
      expect(useLanguageStore.getState().locale).toBe('pt-BR');

      useLanguageStore.getState().setLocale('en');
      expect(useLanguageStore.getState().locale).toBe('en');

      useLanguageStore.getState().setLocale('es');
      expect(useLanguageStore.getState().locale).toBe('es');

      useLanguageStore.getState().setLocale('de');
      expect(useLanguageStore.getState().locale).toBe('de');

      useLanguageStore.getState().setLocale('pt-BR');
      expect(useLanguageStore.getState().locale).toBe('pt-BR');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 6: BADGE / REPUTATION SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Phase 6: Badge & Reputation', () => {
    test('6.1 — Badge list is ordered by level', () => {
      for (let i = 1; i < BADGES.length; i++) {
        expect(BADGES[i].level).toBeGreaterThan(BADGES[i - 1].level);
        expect(BADGES[i].minReputation).toBeGreaterThan(BADGES[i - 1].minReputation);
      }
    });

    test('6.2 — getBadgeForReputation returns correct badge at boundaries', () => {
      expect(getBadgeForReputation(0).level).toBe(0);
      expect(getBadgeForReputation(49).level).toBe(0);
      expect(getBadgeForReputation(50).level).toBe(1);
      expect(getBadgeForReputation(100).level).toBe(2);
      expect(getBadgeForReputation(203750).level).toBe(31);
    });

    test('6.3 — Progress to next level is between 0 and 1', () => {
      const badge = getBadgeForReputation(75);
      const progress = getProgressToNextLevel(75, badge);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });

    test('6.4 — All badges have required fields', () => {
      for (const badge of BADGES) {
        expect(badge.badgeId).toBeTruthy();
        expect(badge.name).toBeTruthy();
        expect(badge.nameEN).toBeTruthy();
        expect(badge.icon).toBeTruthy();
        expect(badge.color).toBeTruthy();
        expect(badge.glowColor).toBeTruthy();
        expect(badge.perks.length).toBeGreaterThan(0);
        expect(badge.dailyReportLimit === -1 || badge.dailyReportLimit > 0).toBe(true);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 7: CREDIBILITY ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Phase 7: Credibility Engine', () => {
    const makeIncident = (overrides: Partial<any> = {}): any => ({
      id: 'test-cred-001', reporterUid: 'u1', reporterName: 'Test', reporterLevel: 5,
      reporterBadge: 'Reporter', category: 'robbery', severity: 'high',
      title: 'Test incident for credibility', description: 'A detailed description of what happened',
      location: { latitude: 41.2356, longitude: -8.6200 }, geohash: 'ez3q',
      address: null, photoURLs: [], confirmCount: 3, denyCount: 0,
      credibilityScore: 50, status: 'active', isVerified: false, isFakeReport: false,
      verifiedByUid: null, views: 10, commentCount: 0, comments: [],
      createdAt: Date.now() - 3600000, expiresAt: Date.now() + 86400000,
      ...overrides,
    });

    test('7.1 — Returns score, level, factors, and flags', () => {
      const result = analyzeCredibility(makeIncident(), []);
      expect(typeof result.score).toBe('number');
      expect(['high', 'medium', 'low', 'likely_fake']).toContain(result.level);
      expect(result.factors).toBeDefined();
      expect(Array.isArray(result.flags)).toBe(true);
    });

    test('7.2 — Higher confirm count improves score', () => {
      const low = analyzeCredibility(makeIncident({ confirmCount: 0 }), []);
      const high = analyzeCredibility(makeIncident({ confirmCount: 10 }), []);
      expect(high.score).toBeGreaterThanOrEqual(low.score);
    });

    test('7.3 — High deny count lowers score', () => {
      const clean = analyzeCredibility(makeIncident({ denyCount: 0 }), []);
      const denied = analyzeCredibility(makeIncident({ denyCount: 8 }), []);
      expect(denied.score).toBeLessThanOrEqual(clean.score);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 8: PROFILE INTERACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Phase 8: Profile Screen Functions', () => {
    beforeEach(() => {
      useAuthStore.getState().signInDemo();
    });

    test('8.1 — Toggle ghost mode on/off', () => {
      expect(useAuthStore.getState().user!.isGhostMode).toBe(false);

      useAuthStore.getState().updateProfile({ isGhostMode: true });
      expect(useAuthStore.getState().user!.isGhostMode).toBe(true);

      useAuthStore.getState().updateProfile({ isGhostMode: false });
      expect(useAuthStore.getState().user!.isGhostMode).toBe(false);
    });

    test('8.2 — Theme toggle (light/dark)', () => {
      expect(useAccessibilityStore.getState().lightTheme).toBe(false);

      useAccessibilityStore.getState().set('lightTheme', true);
      expect(useAccessibilityStore.getState().lightTheme).toBe(true);

      useAccessibilityStore.getState().set('lightTheme', false);
      expect(useAccessibilityStore.getState().lightTheme).toBe(false);
    });

    test('8.3 — User stats are populated', () => {
      const user = useAuthStore.getState().user!;
      expect(user.totalReports).toBeGreaterThanOrEqual(0);
      expect(user.totalConfirmations).toBeGreaterThanOrEqual(0);
      expect(user.reportsToday).toBeGreaterThanOrEqual(0);
      expect(typeof user.dailyReportLimit).toBe('number');
    });

    test('8.4 — Guardian has extra stats', () => {
      const user = useAuthStore.getState().user!;
      expect(user.isGuardian).toBe(true);
      expect(user.verifiedIncidents).toBeGreaterThan(0);
      expect(user.removedIncidents).toBeGreaterThan(0);
      expect(user.mentees).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 9: FULL USER JOURNEY (END-TO-END LOOP)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Phase 9: Complete User Journey Loop', () => {
    test('FULL LOOP — Sign in → Browse → Report → Interact → Family → Chain → Settings → Sign out', async () => {
      // STEP 1: Sign in
      useAuthStore.getState().signInDemo();
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      const user = useAuthStore.getState().user!;

      // STEP 2: Load map data
      await useIncidentStore.getState().loadIncidents();
      const incidentCount = useIncidentStore.getState().incidents.length;
      expect(incidentCount).toBeGreaterThan(0);

      // STEP 3: Browse incidents (view several)
      const incidents = useIncidentStore.getState().incidents;
      for (let i = 0; i < Math.min(3, incidents.length); i++) {
        useIncidentStore.getState().viewIncident(incidents[i].id);
        useIncidentStore.getState().selectIncident(incidents[i]);
      }

      // STEP 4: Confirm and deny
      useIncidentStore.getState().confirmIncident(incidents[0].id);
      if (incidents.length > 1) {
        useIncidentStore.getState().denyIncident(incidents[1].id);
      }

      // STEP 5: Add a comment
      useIncidentStore.getState().addComment(incidents[0].id, 'Confirmed, I saw this.');

      // STEP 6: Report a new incident
      await useIncidentStore.getState().createIncident({
        category: 'suspicious',
        severity: 'medium',
        title: 'Loop test incident',
        description: 'Created during the full loop test',
        location: { latitude: 41.24, longitude: -8.63 },
      });
      expect(useIncidentStore.getState().incidents.length).toBe(incidentCount + 1);

      // STEP 7: Visit Family screen
      await useFamilyStore.getState().loadFamily();
      expect(useFamilyStore.getState().activeGroup).not.toBeNull();
      expect(useFamilyStore.getState().members.length).toBeGreaterThan(0);
      useFamilyStore.getState().sendCheckIn();

      // STEP 8: Visit Chain screen
      const chainId = await useChainStore.getState().createChain(user.uid, 'Loop Test Chain');
      await useChainStore.getState().loadChains(user.uid);
      const chain = useChainStore.getState().activeChain!;
      expect(chain).not.toBeNull();

      await useChainStore.getState().addMember({
        chainId: chain.id, type: 'friend', name: 'Loop Friend',
        ownerUid: user.uid, metadata: { notes: 'Test member' },
      });
      expect(useChainStore.getState().members.length).toBeGreaterThanOrEqual(1);

      await useChainStore.getState().sendMessage(chain.id, user.uid, user.displayName, 'text', 'Loop test message');
      expect(useChainStore.getState().messages.length).toBeGreaterThanOrEqual(1);

      // STEP 9: Change settings
      useAccessibilityStore.getState().set('highContrast', true);
      useAccessibilityStore.getState().set('largeText', true);
      useLanguageStore.getState().setLocale('en');
      expect(useAccessibilityStore.getState().highContrast).toBe(true);
      expect(useLanguageStore.getState().locale).toBe('en');

      // STEP 10: Toggle ghost mode
      useAuthStore.getState().updateProfile({ isGhostMode: true });
      expect(useAuthStore.getState().user!.isGhostMode).toBe(true);

      // STEP 11: Reset settings
      useAccessibilityStore.getState().reset();
      useLanguageStore.getState().setLocale('pt-BR');
      expect(useAccessibilityStore.getState().highContrast).toBe(false);

      // STEP 12: Sign out
      useAuthStore.getState().signOut();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
