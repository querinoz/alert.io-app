import { AttentionSDK } from './AttentionSDK';
import { IncidentDB, ChainDB, ChainMemberDB, ChainMessageDB, ChainAlertDB, LogDB, UserDB } from '../services/database';
import type { GeoPosition, Incident, Chain, ChainMember, ChainMessage, ChainAlert, ActivityLog } from '../types';
import type { IncidentPayload, SOSPayload, AlertPayload, LocationPayload, SafetyEvent, OnEventCallback } from './types';

/**
 * Stateless API facade exposing all Attention safety features.
 * Can be used headlessly (no UI) in any JavaScript/TypeScript environment.
 *
 * Usage:
 *   import { AttentionAPI } from '@attention/sdk';
 *   await AttentionAPI.init({ apiKey: '...' });
 *   await AttentionAPI.setUser({ uid: '123', displayName: 'Alice' });
 *   const id = await AttentionAPI.sos({ location: { latitude: 41.23, longitude: -8.62 } });
 */
export const AttentionAPI = {

  // ─── LIFECYCLE ───

  init: AttentionSDK.init.bind(AttentionSDK),
  destroy: AttentionSDK.destroy.bind(AttentionSDK),
  setUser: AttentionSDK.setUser.bind(AttentionSDK),
  clearUser: AttentionSDK.clearUser.bind(AttentionSDK),

  get isReady() { return AttentionSDK.isInitialized; },
  get user() { return AttentionSDK.currentUser; },
  get location() { return AttentionSDK.currentLocation; },

  // ─── SOS ───

  async sos(payload?: Partial<SOSPayload>): Promise<string> {
    return AttentionSDK.triggerSOS(payload);
  },

  async cancelSOS(): Promise<void> {
    return AttentionSDK.cancelSOS();
  },

  // ─── INCIDENTS ───

  async reportIncident(payload: IncidentPayload): Promise<string> {
    return AttentionSDK.reportIncident(payload);
  },

  async getIncident(id: string): Promise<Incident | null> {
    return IncidentDB.get(id);
  },

  async getAllIncidents(): Promise<Incident[]> {
    return IncidentDB.getAll();
  },

  async getNearbyIncidents(center?: GeoPosition, radiusKm = 5): Promise<Incident[]> {
    const loc = center || AttentionSDK.currentLocation;
    if (!loc) return [];
    return IncidentDB.getByLocation(loc, radiusKm);
  },

  async confirmIncident(incidentId: string): Promise<void> {
    const user = AttentionSDK.currentUser;
    if (!user) throw new Error('[AttentionAPI] No user set');
    return IncidentDB.confirm(incidentId, user.uid);
  },

  async denyIncident(incidentId: string): Promise<void> {
    const user = AttentionSDK.currentUser;
    if (!user) throw new Error('[AttentionAPI] No user set');
    return IncidentDB.deny(incidentId, user.uid);
  },

  // ─── CHAINS ───

  async createChain(name: string): Promise<string> {
    return AttentionSDK.createChain(name);
  },

  async joinChain(inviteCode: string): Promise<string | null> {
    return AttentionSDK.joinChain(inviteCode);
  },

  async getChain(id: string): Promise<Chain | null> {
    return ChainDB.get(id);
  },

  async getUserChains(): Promise<Chain[]> {
    return AttentionSDK.getUserChains();
  },

  async getChainMembers(chainId: string): Promise<ChainMember[]> {
    return ChainMemberDB.getByChain(chainId);
  },

  async addChainMember(member: Parameters<typeof ChainMemberDB.add>[0]): Promise<string> {
    return ChainMemberDB.add(member);
  },

  async removeChainMember(memberId: string): Promise<void> {
    const user = AttentionSDK.currentUser;
    if (!user) throw new Error('[AttentionAPI] No user set');
    return ChainMemberDB.remove(memberId, user.uid);
  },

  async sendMessage(chainId: string, content: string, type?: 'text' | 'alert' | 'location'): Promise<string> {
    return AttentionSDK.sendChainMessage(chainId, content, type);
  },

  async getMessages(chainId: string, limit = 50): Promise<ChainMessage[]> {
    return ChainMessageDB.getByChain(chainId, limit);
  },

  async sendAlert(chainId: string, alert: Omit<AlertPayload, 'targetChainIds'>): Promise<string> {
    return AttentionSDK.sendChainAlert(chainId, alert);
  },

  async getAlerts(chainId: string): Promise<ChainAlert[]> {
    return ChainAlertDB.getByChain(chainId);
  },

  async acknowledgeAlert(alertId: string): Promise<void> {
    const user = AttentionSDK.currentUser;
    if (!user) throw new Error('[AttentionAPI] No user set');
    return ChainAlertDB.acknowledge(alertId, user.uid);
  },

  // ─── LOCATION ───

  async updateLocation(payload: LocationPayload): Promise<void> {
    return AttentionSDK.updateLocation(payload);
  },

  startTracking(intervalMs?: number): void {
    AttentionSDK.startLocationTracking(intervalMs);
  },

  stopTracking(): void {
    AttentionSDK.stopLocationTracking();
  },

  // ─── GEOFENCES ───

  addGeofence: AttentionSDK.addGeofence.bind(AttentionSDK),
  removeGeofence: AttentionSDK.removeGeofence.bind(AttentionSDK),
  getGeofences: AttentionSDK.getGeofences.bind(AttentionSDK),

  // ─── SAFETY SCORE ───

  async getSafetyScore() {
    return AttentionSDK.getSafetyScore();
  },

  // ─── EVENTS ───

  on(callback: OnEventCallback): () => void {
    return AttentionSDK.on(callback);
  },

  off(callback: OnEventCallback): void {
    AttentionSDK.off(callback);
  },

  // ─── REAL-TIME SUBSCRIPTIONS ───

  subscribeIncidents(callback: (incidents: Incident[]) => void): () => void {
    return AttentionSDK.subscribeIncidents(callback);
  },

  subscribeChainMessages(chainId: string, callback: (messages: ChainMessage[]) => void): () => void {
    return AttentionSDK.subscribeChainMessages(chainId, callback);
  },

  subscribeChainAlerts(chainId: string, callback: (alerts: ChainAlert[]) => void): () => void {
    return AttentionSDK.subscribeChainAlerts(chainId, callback);
  },

  // ─── ACTIVITY LOGS ───

  async getUserLogs(limit = 100): Promise<ActivityLog[]> {
    const user = AttentionSDK.currentUser;
    if (!user) return [];
    return LogDB.getByUser(user.uid, limit);
  },
};
