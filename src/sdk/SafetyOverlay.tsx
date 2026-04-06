import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { AttentionSDK } from './AttentionSDK';
import type { SafetyOverlayProps } from './types';
import type { Incident, Chain, ChainAlert } from '../types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const TABS = [
  { key: 'map', icon: '🗺️', label: 'Map' },
  { key: 'incidents', icon: '⚠️', label: 'Incidents' },
  { key: 'chain', icon: '🔗', label: 'Chain' },
  { key: 'alerts', icon: '🔔', label: 'Alerts' },
] as const;

type TabKey = typeof TABS[number]['key'];

/**
 * Full-screen or slide-up safety overlay. Drop it into any app to give users
 * access to the complete Attention safety dashboard (map, incidents, chain, alerts).
 *
 * <SafetyOverlay visible={showSafety} onClose={() => setShowSafety(false)} />
 */
export function SafetyOverlay({
  visible = false,
  onClose,
  initialView = 'incidents',
  fullScreen = true,
  style,
}: SafetyOverlayProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialView as TabKey);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);
  const [alerts, setAlerts] = useState<ChainAlert[]>([]);
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SCREEN_H,
      friction: 10,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  useEffect(() => {
    if (!visible || !AttentionSDK.isInitialized) return;

    const unsubIncidents = AttentionSDK.subscribeIncidents(setIncidents);

    (async () => {
      if (AttentionSDK.currentUser) {
        const userChains = await AttentionSDK.getUserChains();
        setChains(userChains);
      }
    })();

    return () => { unsubIncidents(); };
  }, [visible]);

  const renderTab = useCallback(() => {
    switch (activeTab) {
      case 'map':
        return (
          <View style={ov.center}>
            <Text style={ov.emptyIcon}>🗺️</Text>
            <Text style={ov.emptyTitle}>Safety Map</Text>
            <Text style={ov.emptySubtitle}>
              {incidents.length} incidents nearby{'\n'}
              Location: {AttentionSDK.currentLocation
                ? `${AttentionSDK.currentLocation.latitude.toFixed(4)}, ${AttentionSDK.currentLocation.longitude.toFixed(4)}`
                : 'Not available'}
            </Text>
          </View>
        );

      case 'incidents':
        return (
          <ScrollView style={ov.scrollArea} showsVerticalScrollIndicator={false}>
            {incidents.length === 0 ? (
              <View style={ov.center}>
                <Text style={ov.emptyIcon}>✅</Text>
                <Text style={ov.emptyTitle}>All Clear</Text>
                <Text style={ov.emptySubtitle}>No incidents reported nearby</Text>
              </View>
            ) : incidents.map(inc => (
              <View key={inc.id} style={[ov.card, severityBorder(inc.severity)]}>
                <View style={ov.cardHeader}>
                  <Text style={ov.cardCategory}>{categoryEmoji(inc.category)} {inc.category.toUpperCase()}</Text>
                  <Text style={[ov.cardSeverity, { color: severityColor(inc.severity) }]}>
                    {inc.severity}
                  </Text>
                </View>
                <Text style={ov.cardTitle}>{inc.title}</Text>
                <Text style={ov.cardMeta}>
                  {inc.confirmCount} confirms · {new Date(inc.createdAt).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        );

      case 'chain':
        return (
          <ScrollView style={ov.scrollArea} showsVerticalScrollIndicator={false}>
            {chains.length === 0 ? (
              <View style={ov.center}>
                <Text style={ov.emptyIcon}>🔗</Text>
                <Text style={ov.emptyTitle}>No Chains</Text>
                <Text style={ov.emptySubtitle}>Create or join a chain to connect with others</Text>
              </View>
            ) : chains.map(chain => (
              <View key={chain.id} style={ov.card}>
                <Text style={ov.cardTitle}>🔗 {chain.name}</Text>
                <Text style={ov.cardMeta}>
                  {chain.memberCount} member{chain.memberCount !== 1 ? 's' : ''} · Code: {chain.inviteCode}
                </Text>
              </View>
            ))}
          </ScrollView>
        );

      case 'alerts':
        return (
          <ScrollView style={ov.scrollArea} showsVerticalScrollIndicator={false}>
            {alerts.length === 0 ? (
              <View style={ov.center}>
                <Text style={ov.emptyIcon}>🔕</Text>
                <Text style={ov.emptyTitle}>No Alerts</Text>
                <Text style={ov.emptySubtitle}>You're all caught up</Text>
              </View>
            ) : alerts.map(alert => (
              <View key={alert.id} style={[ov.card, severityBorder(alert.severity)]}>
                <Text style={ov.cardTitle}>{alert.title}</Text>
                <Text style={ov.cardMeta}>{alert.message}</Text>
              </View>
            ))}
          </ScrollView>
        );
    }
  }, [activeTab, incidents, chains, alerts]);

  const content = (
    <Animated.View style={[
      ov.overlay,
      fullScreen ? ov.fullscreen : ov.sheet,
      { transform: [{ translateY: slideAnim }] },
      style,
    ]}>
      <View style={ov.header}>
        <Text style={ov.headerTitle}>🛡️ Attention Safety</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={ov.closeBtn} accessibilityLabel="Close safety overlay">
            <Text style={ov.closeTxt}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={ov.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[ov.tab, activeTab === tab.key && ov.tabActive]}
            accessibilityLabel={tab.label}
          >
            <Text style={ov.tabIcon}>{tab.icon}</Text>
            <Text style={[ov.tabLabel, activeTab === tab.key && ov.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={ov.body}>
        {renderTab()}
      </View>

      <View style={ov.sosBar}>
        <TouchableOpacity
          style={ov.sosBtn}
          onPress={() => AttentionSDK.triggerSOS()}
          accessibilityLabel="Emergency SOS"
        >
          <Text style={ov.sosTxt}>🆘 EMERGENCY SOS</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (Platform.OS === 'web') return visible ? content : null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      {content}
    </Modal>
  );
}

function categoryEmoji(cat: string) {
  const map: Record<string, string> = {
    robbery: '🔪', accident: '💥', suspicious: '👀', hazard: '⚠️',
    police: '🚔', fire: '🔥', medical: '🏥', traffic: '🚦', noise: '📢', other: '📌',
  };
  return map[cat] || '📌';
}

function severityColor(s: string) {
  return s === 'critical' ? '#FF3B30' : s === 'high' ? '#FF9500' : s === 'medium' ? '#FFCC00' : '#34C759';
}

function severityBorder(s: string) {
  return { borderLeftWidth: 4, borderLeftColor: severityColor(s) };
}

const ov = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(18,18,24,0.97)',
  },
  fullscreen: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 99999,
  },
  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: SCREEN_H * 0.7,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 99999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 16 : 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeTxt: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: 'rgba(0,122,255,0.15)',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#007AFF',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  scrollArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardCategory: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardSeverity: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardMeta: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
  },
  sosBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'web' ? 12 : 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  sosBtn: {
    backgroundColor: '#FF3B30',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 8px rgba(255,59,48,0.4)' } as any
      : { shadowColor: '#FF3B30', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 }),
  },
  sosTxt: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
