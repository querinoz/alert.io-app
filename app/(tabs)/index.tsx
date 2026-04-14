import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, Platform, ScrollView, Animated, Easing, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AttentionMap } from '../../src/components/map/AttentionMap';
import type { MapMarker, GuardScanConfig, NavigationRoute, SpeedCamera } from '../../src/components/map/types';
import { NeonText } from '../../src/components/ui/NeonText';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { BadgeIcon } from '../../src/components/ui/BadgeIcon';
import { LoadingRadar } from '../../src/components/ui/LoadingRadar';

import { useA11y, announce } from '../../src/hooks/useAccessibility';
import { useHaptics } from '../../src/hooks/useHaptics';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useIncidentStore } from '../../src/stores/incidentStore';
import { useAuthStore } from '../../src/stores/authStore';
import { useFamilyStore } from '../../src/stores/familyStore';
import { useAccessibilityStore } from '../../src/stores/accessibilityStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, Radius } from '../../src/theme/spacing';
import { getCategoryMeta } from '../../src/constants/categories';
import { getBadgeForReputation } from '../../src/constants/badges';
import { timeAgo, formatDistance } from '../../src/services/mockData';
import type { Incident, IncidentCategory, IncidentSeverity, PublicCamera } from '../../src/types';
import { seedDatabase, IncidentDB } from '../../src/services/database';
import { generateWorldIncidents } from '../../src/data/worldIncidents';
import { generatePortugalIncidents } from '../../src/data/portugalIncidents';
import { LogoMark } from '../../src/components/ui/LogoMark';
import { CameraViewer } from '../../src/components/camera/CameraViewer';
import { TutorialOverlay } from '../../src/components/ui/TutorialOverlay';
import { fetchAllCameras } from '../../src/services/cameraService';
import FamilyScreen from './family';
import ProfileScreen from './profile';
import ChainScreen from './chain';

const USER_LOCATION = { latitude: 41.2356, longitude: -8.6200 };
const LANDING_PAGE_URL = 'http://localhost:8080';

const GRADUAL_CATEGORIES: { cat: IncidentCategory; sev: IncidentSeverity; title: string; desc: string }[] = [
  { cat: 'robbery', sev: 'high', title: 'Assalto na Rua de Santa Catarina', desc: 'Grupo de indivíduos armados avistados a assaltar uma loja de telemóveis.' },
  { cat: 'accident', sev: 'critical', title: 'Colisão múltipla na VCI', desc: 'Engavetamento com 4 viaturas. Trânsito completamente parado no sentido Oeste.' },
  { cat: 'suspicious', sev: 'medium', title: 'Indivíduo suspeito junto à escola', desc: 'Homem de capuz observando crianças à saída da escola durante vários minutos.' },
  { cat: 'hazard', sev: 'high', title: 'Fuga de gás na Rua do Almada', desc: 'Forte cheiro a gás reportado por vários moradores. Evacuação em curso.' },
  { cat: 'police', sev: 'medium', title: 'Operação STOP na Boavista', desc: 'PSP a realizar operação de fiscalização junto à rotunda da Boavista.' },
  { cat: 'fire', sev: 'critical', title: 'Incêndio em edifício no Bonfim', desc: 'Fogo no 3º andar de prédio habitacional. Bombeiros no local.' },
  { cat: 'medical', sev: 'high', title: 'Pessoa inconsciente na estação', desc: 'Pessoa caída sem sinais de consciência na estação de Metro da Trindade.' },
  { cat: 'traffic', sev: 'low', title: 'Semáforo avariado em Paranhos', desc: 'Semáforo no cruzamento da Rua de Costa Cabral está intermitente.' },
  { cat: 'noise', sev: 'low', title: 'Festa ruidosa na Cedofeita', desc: 'Música extremamente alta num apartamento. Já passa das 3 da manhã.' },
  { cat: 'flood', sev: 'medium', title: 'Inundação na Rua da Alegria', desc: 'Chuva forte provocou acumulação de água. Estrada intransitável.' },
  { cat: 'injured_animal', sev: 'low', title: 'Cão ferido junto ao rio Douro', desc: 'Cão de porte médio com pata partida encontrado no passeio ribeirinho.' },
  { cat: 'building_risk', sev: 'high', title: 'Fachada a cair em Campanhã', desc: 'Pedaços de fachada a cair na via pública. Risco para peões.' },
  { cat: 'robbery', sev: 'medium', title: 'Carteirista no Metro', desc: 'Grupo organizado a furtar carteiras na linha amarela do Metro.' },
  { cat: 'accident', sev: 'high', title: 'Atropelamento na Foz', desc: 'Peão atropelado na passadeira junto ao Forte de S. João da Foz.' },
  { cat: 'suspicious', sev: 'low', title: 'Veículo abandonado há 3 dias', desc: 'Carrinha branca sem matrícula estacionada na mesma posição há vários dias.' },
  { cat: 'hazard', sev: 'medium', title: 'Poste de eletricidade inclinado', desc: 'Poste de alta tensão visivelmente inclinado após tempestade.' },
  { cat: 'police', sev: 'high', title: 'Perseguição policial em Matosinhos', desc: 'Viatura em fuga da polícia pela marginal. Várias viaturas em perseguição.' },
  { cat: 'fire', sev: 'high', title: 'Contentor de lixo em chamas', desc: 'Contentor do lixo a arder na Rua de Cedofeita. Risco de propagação.' },
  { cat: 'medical', sev: 'medium', title: 'Queda de idoso no Bolhão', desc: 'Senhor idoso caiu nas escadas do mercado. Necessita assistência.' },
  { cat: 'traffic', sev: 'medium', title: 'Obra bloqueia duas faixas na A1', desc: 'Obras de pavimentação reduzem a via a uma faixa. Filas de 3km.' },
  { cat: 'noise', sev: 'low', title: 'Alarme de carro a tocar há horas', desc: 'Alarme de automóvel incessante na Rua do Heroísmo desde as 22h.' },
  { cat: 'flood', sev: 'high', title: 'Ribeira do Porto alagada', desc: 'Nível do rio Douro subiu. Zona da Ribeira com água nas ruas.' },
  { cat: 'injured_animal', sev: 'medium', title: 'Gato preso em árvore alta', desc: 'Gato preso no topo de uma árvore no Jardim da Cordoaria há 2 dias.' },
  { cat: 'building_risk', sev: 'critical', title: 'Desabamento parcial de telhado', desc: 'Parte do telhado de edifício devoluto desabou na Rua das Flores.' },
  { cat: 'robbery', sev: 'high', title: 'Assalto a farmácia em Ramalde', desc: 'Dois indivíduos encapuzados assaltaram farmácia. Fugiram a pé.' },
  { cat: 'accident', sev: 'medium', title: 'Queda de motociclista na Circunvalação', desc: 'Motociclista derrapou em mancha de óleo. Ferimentos ligeiros.' },
  { cat: 'suspicious', sev: 'high', title: 'Pacote suspeito na estação', desc: 'Mala abandonada na estação de São Bento. Área isolada pela PSP.' },
  { cat: 'hazard', sev: 'low', title: 'Buraco grande na estrada', desc: 'Buraco no asfalto com 50cm de profundidade na Rua de Santos Pousada.' },
  { cat: 'police', sev: 'low', title: 'Controlo de velocidade na IC1', desc: 'Radar da GNR ativo na IC1, sentido Porto-Lisboa, km 285.' },
  { cat: 'fire', sev: 'medium', title: 'Fumo visível em terreno baldio', desc: 'Coluna de fumo a sair de terreno baldio em Gondomar.' },
  { cat: 'medical', sev: 'critical', title: 'Paragem cardíaca no shopping', desc: 'Homem de 55 anos em paragem cardíaca no NorteShopping. DAE utilizado.' },
  { cat: 'traffic', sev: 'high', title: 'Acidente na Ponte do Freixo', desc: 'Colisão entre camião e ligeiro. Uma faixa cortada no sentido Gaia.' },
  { cat: 'other', sev: 'low', title: 'Grafiti ofensivo na escola', desc: 'Pichações com conteúdo ofensivo nos muros da escola secundária.' },
  { cat: 'flood', sev: 'low', title: 'Esgoto entupido na Rua de Passos Manuel', desc: 'Água a transbordar de tampa de esgoto após chuva moderada.' },
  { cat: 'injured_animal', sev: 'high', title: 'Cavalo solto na estrada', desc: 'Cavalo sem dono a vaguear pela EN15. Risco de acidente.' },
  { cat: 'building_risk', sev: 'medium', title: 'Andaime instável em obra', desc: 'Andaime de construção civil a balançar com o vento na Rua do Bonjardim.' },
  { cat: 'robbery', sev: 'low', title: 'Tentativa de furto em bicicleta', desc: 'Indivíduo a tentar cortar cadeado de bicicleta junto ao Parque da Cidade.' },
  { cat: 'accident', sev: 'low', title: 'Choque ligeiro no parque', desc: 'Dois veículos chocaram a baixa velocidade no estacionamento do Bessa.' },
  { cat: 'suspicious', sev: 'medium', title: 'Drone sobrevoando zona residencial', desc: 'Drone não autorizado a sobrevoar jardins privados na zona do Amial.' },
  { cat: 'hazard', sev: 'critical', title: 'Derrame químico na zona industrial', desc: 'Líquido de cor esverdeada a escorrer de armazém em Perafita.' },
  { cat: 'police', sev: 'medium', title: 'Manifestação no centro', desc: 'Manifestação pacífica na Avenida dos Aliados. Algumas ruas cortadas.' },
  { cat: 'fire', sev: 'low', title: 'Churrasco fora de controlo', desc: 'Churrasco num terraço provocou alarme de incêndio no edifício.' },
  { cat: 'medical', sev: 'low', title: 'Pessoa com mal-estar no jardim', desc: 'Mulher com tonturas no Jardim de São Lázaro. Já está acompanhada.' },
  { cat: 'traffic', sev: 'low', title: 'Semáforos desligados na Constituição', desc: 'Cruzamento da Constituição com António Bernardino sem semáforos.' },
  { cat: 'noise', sev: 'medium', title: 'Obras ilegais durante a noite', desc: 'Barulho de obras de construção às 23h num prédio em Lordelo.' },
  { cat: 'other', sev: 'medium', title: 'Falta de iluminação pública', desc: 'Rua inteira sem candeeiros a funcionar na zona de Paranhos.' },
  { cat: 'robbery', sev: 'critical', title: 'Assalto com faca na Ribeira', desc: 'Turista agredido com faca e roubado junto ao cais da Ribeira.' },
  { cat: 'accident', sev: 'critical', title: 'Autocarro saiu da estrada', desc: 'Autocarro da STCP embateu em muro na descida da Batalha. Feridos.' },
  { cat: 'suspicious', sev: 'high', title: 'Grupo a forçar entrada em garagem', desc: 'Três indivíduos a tentar forçar portão de garagem com ferramentas.' },
  { cat: 'hazard', sev: 'medium', title: 'Árvore caída bloqueia estrada', desc: 'Árvore de grande porte caiu e bloqueia completamente a via.' },
];

function generateGradualIncidents(
  userLat: number,
  userLng: number,
  count: number,
): Incident[] {
  const MIN_DIST_FROM_USER_KM = 0.15;
  const MIN_DIST_BETWEEN_KM = 0.08;
  const SPREAD_KM = 3.5;

  const placed: { lat: number; lng: number }[] = [];
  const result: Incident[] = [];

  const distKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  };

  const reporters = [
    { name: 'Carlos M.', level: 8 }, { name: 'Ana R.', level: 12 }, { name: 'João P.', level: 5 },
    { name: 'Maria S.', level: 15 }, { name: 'Pedro L.', level: 3 }, { name: 'Sofia T.', level: 9 },
    { name: 'Miguel F.', level: 7 }, { name: 'Inês C.', level: 11 }, { name: 'Rui V.', level: 6 },
    { name: 'Beatriz G.', level: 4 }, { name: 'Tiago A.', level: 10 }, { name: 'Laura D.', level: 14 },
  ];

  for (let i = 0; i < count; i++) {
    let lat = 0, lng = 0, attempts = 0;
    const ok = () => {
      if (distKm({ lat, lng }, { lat: userLat, lng: userLng }) < MIN_DIST_FROM_USER_KM) return false;
      for (const p of placed) {
        if (distKm({ lat, lng }, p) < MIN_DIST_BETWEEN_KM) return false;
      }
      return true;
    };

    do {
      const angle = Math.random() * 2 * Math.PI;
      const r = MIN_DIST_FROM_USER_KM + Math.random() * SPREAD_KM;
      lat = userLat + (r / 110.574) * Math.cos(angle);
      lng = userLng + (r / (111.32 * Math.cos((userLat * Math.PI) / 180))) * Math.sin(angle);
      attempts++;
    } while (!ok() && attempts < 200);

    placed.push({ lat, lng });

    const tmpl = GRADUAL_CATEGORIES[i % GRADUAL_CATEGORIES.length];
    const reporter = reporters[i % reporters.length];
    const timeOffset = Math.random() * 3600000;

    result.push({
      id: `gradual-${i}-${Date.now()}`,
      reporterUid: `grad-user-${i}`,
      reporterName: reporter.name,
      reporterLevel: reporter.level,
      reporterBadge: reporter.level >= 10 ? 'Sentinela' : 'Observador',
      category: tmpl.cat,
      severity: tmpl.sev,
      title: tmpl.title,
      description: tmpl.desc,
      location: { latitude: lat, longitude: lng },
      geohash: 'gradual',
      address: null,
      photoURLs: [],
      confirmCount: Math.floor(Math.random() * 8),
      denyCount: Math.floor(Math.random() * 3),
      credibilityScore: 40 + Math.floor(Math.random() * 50),
      status: 'active',
      isVerified: Math.random() > 0.7,
      isFakeReport: false,
      verifiedByUid: null,
      verifiedByName: null,
      views: Math.floor(Math.random() * 100),
      commentCount: Math.floor(Math.random() * 5),
      comments: [],
      source: 'community',
      createdAt: Date.now() - timeOffset,
      expiresAt: Date.now() + 86400000,
    });
  }

  return result;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatNavDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function fetchRoute(from: { lat: number; lng: number }, to: { lat: number; lng: number }): Promise<{ coordinates: [number, number][]; distance: number; duration: number } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetchWithTimeout(url, {}, 12000);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) return null;
    const route = data.routes[0];
    return { coordinates: route.geometry.coordinates as [number, number][], distance: route.distance, duration: route.duration };
  } catch { return null; }
}

async function geocodePlace(query: string): Promise<{ lat: number; lng: number; name: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetchWithTimeout(url, { headers: { 'User-Agent': 'AlertIO/2.0' } }, 8000);
    const data = await res.json();
    if (!data?.[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), name: data[0].display_name.split(',')[0] };
  } catch { return null; }
}

async function fetchSpeedCameras(lat: number, lng: number, radius = 5000): Promise<SpeedCamera[]> {
  try {
    const query = `[out:json][timeout:10];(node["highway"="speed_camera"](around:${radius},${lat},${lng});node["enforcement"="maxspeed"](around:${radius},${lat},${lng}););out body;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const res = await fetchWithTimeout(url, {}, 15000);
    const data = await res.json();
    return (data.elements || []).map((e: any) => ({
      id: `osm-cam-${e.id}`,
      lat: e.lat,
      lng: e.lon,
      speedLimit: e.tags?.maxspeed ? parseInt(e.tags.maxspeed) : null,
    }));
  } catch {
    return [];
  }
}

const FALLBACK_CAMERAS: SpeedCamera[] = [
  { id: 'cam-1', lat: 41.2380, lng: -8.6215, speedLimit: 50 },
  { id: 'cam-2', lat: 41.2330, lng: -8.6170, speedLimit: 60 },
  { id: 'cam-3', lat: 41.2400, lng: -8.6250, speedLimit: 40 },
  { id: 'cam-4', lat: 41.2310, lng: -8.6140, speedLimit: 50 },
  { id: 'cam-5', lat: 41.2365, lng: -8.6280, speedLimit: 70 },
  { id: 'cam-6', lat: 41.2420, lng: -8.6190, speedLimit: 50 },
  { id: 'cam-7', lat: 41.2290, lng: -8.6230, speedLimit: 50 },
];

// Cameras now fully managed by cameraService.ts with verified embeddable streams


const RADIUS_OPTIONS = [
  { label: '1km', value: 1000 },
  { label: '2km', value: 2000 },
  { label: '5km', value: 5000 },
  { label: '10km', value: 10000 },
  { label: '25km', value: 25000 },
];

function haversineDistance(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const R = 6371000;
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLon = (b.longitude - a.longitude) * Math.PI / 180;
  const lat1 = a.latitude * Math.PI / 180;
  const lat2 = b.latitude * Math.PI / 180;
  const x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function MapFab({ icon, color, label, onPress, active, style }: {
  icon: string; color: string; label: string; onPress: () => void; active?: boolean; style?: any;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <View style={[fabStyles.wrapper, style]}>
      {hovered && (
        <View style={[fabStyles.tooltip, { backgroundColor: 'rgba(20,20,35,0.95)', borderColor: color + '40' }]}>
          <NeonText variant="caption" color="#fff" style={{ fontSize: 10, fontWeight: '600' }}>{label}</NeonText>
        </View>
      )}
      <Pressable
        onPress={onPress}
        // @ts-ignore web-only
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={({ pressed }) => [fabStyles.btn, {
          backgroundColor: active ? color + '18' : pressed ? color + '25' : hovered ? color + '10' : 'rgba(14,14,28,0.85)',
          borderColor: active ? color + '60' : hovered ? color + '40' : 'rgba(255,255,255,0.06)',
          shadowColor: color,
          shadowOpacity: active ? 0.5 : hovered ? 0.4 : 0,
          shadowRadius: active ? 16 : hovered ? 12 : 0,
          shadowOffset: { width: 0, height: 0 },
          transform: [{ scale: pressed ? 0.88 : hovered ? 1.08 : 1 }],
          ...(Platform.OS === 'web' ? {
            boxShadow: hovered || active ? `0 0 ${active ? 16 : 12}px ${color}50` : 'none',
            transition: 'all 0.25s ease',
          } as any : {}),
        }]}
        accessible accessibilityLabel={label} accessibilityRole="button"
      >
        <MaterialCommunityIcons name={icon as any} size={20} color={active || hovered ? color : color + '80'} />
      </Pressable>
    </View>
  );
}

function TopBarIcon({ icon, label, active, onPress, color, badge, compact }: {
  icon: string; label: string; active: boolean; onPress: () => void; color: string; badge?: boolean; compact?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <View style={{ position: 'relative' as const, flex: compact ? 1 : undefined, alignItems: 'center' as const }}>
      {compact && hovered && (
        <View style={{
          position: 'absolute' as const, bottom: -22, zIndex: 100,
          backgroundColor: 'rgba(16,16,30,0.96)', paddingHorizontal: 7, paddingVertical: 2,
          borderRadius: 5, borderWidth: 1, borderColor: color + '30',
          ...(Platform.OS === 'web' ? { whiteSpace: 'nowrap', pointerEvents: 'none' } as any : {}),
        }}>
          <NeonText variant="caption" color={color} style={{ fontSize: 8, fontWeight: '700', letterSpacing: 0.3 }}>{label}</NeonText>
        </View>
      )}
      <Pressable
        onPress={onPress}
        // @ts-ignore web-only
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={({ pressed }) => ({
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          gap: compact ? 0 : 6,
          height: compact ? 32 : 34,
          paddingHorizontal: compact ? 0 : active ? 12 : hovered ? 10 : 8,
          borderRadius: compact ? 8 : 10,
          backgroundColor: active
            ? color + '18'
            : hovered
              ? color + '0C'
              : 'transparent',
          borderWidth: 1,
          borderColor: active
            ? color + '45'
            : hovered
              ? color + '25'
              : 'rgba(255,255,255,0.04)',
          transform: [{ scale: pressed ? 0.90 : hovered ? 1.06 : 1 }],
          shadowColor: color,
          shadowOpacity: active ? 0.5 : hovered ? 0.3 : 0,
          shadowRadius: active ? 14 : hovered ? 10 : 0,
          shadowOffset: { width: 0, height: 0 } as any,
          ...(Platform.OS === 'web'
            ? {
                transition: 'all 0.25s cubic-bezier(0.25,0.8,0.25,1)',
                cursor: 'pointer',
                width: compact ? '100%' : 'auto',
              } as any
            : {}),
          position: 'relative' as const,
        })}
        accessible accessibilityLabel={label} accessibilityRole="button"
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={compact ? 16 : 16}
          color={active ? color : hovered ? color : '#8A8AAA'}
        />
        {!compact && (
          <NeonText
            variant="caption"
            color={active ? color : hovered ? color : '#8A8AAA'}
            style={{
              fontSize: 10,
              fontWeight: active ? '800' : '600',
              letterSpacing: 0.4,
              ...(Platform.OS === 'web' ? { transition: 'color 0.2s ease' } as any : {}),
            }}
          >
            {label}
          </NeonText>
        )}
        {badge && (
          <View style={{
            position: 'absolute' as const, top: 2, right: 2, width: 6, height: 6,
            borderRadius: 3, backgroundColor: Colors.primary,
            ...(Platform.OS === 'web'
              ? { boxShadow: `0 0 3px ${Colors.primary}CC` }
              : { shadowColor: Colors.primary, shadowOpacity: 0.8, shadowRadius: 3 }),
          } as any} />
        )}
      </Pressable>
    </View>
  );
}

const fabStyles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  tooltip: {
    position: 'absolute', top: -28,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1, zIndex: 100,
    ...(Platform.OS === 'web' ? { whiteSpace: 'nowrap', pointerEvents: 'none' } as any : {}),
  },
  btn: {
    width: 46, height: 46, borderRadius: 14, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
    minWidth: 46, minHeight: 46,
    ...(Platform.OS === 'web' ? { transition: 'all 0.28s cubic-bezier(0.25,0.8,0.25,1)', cursor: 'pointer' } as any : {}),
  },
});

export default function MapScreen() {
  const { colors } = useA11y();
  const haptics = useHaptics();
  const { showSidebar, sidebarWidth, isPhone, width: screenWidth } = useResponsive();
  const { incidents, selectedIncident, isLoading, loadIncidents, loadPublicData, refreshPublicData, selectIncident, addIncidentDirect } = useIncidentStore();
  const user = useAuthStore((s) => s.user);
  const familyMembers = useFamilyStore((s) => s.members);
  const loadFamily = useFamilyStore((s) => s.loadFamily);
  const lightTheme = useAccessibilityStore((s) => s.lightTheme);
  const searchParams = useLocalSearchParams<{ focusLat?: string; focusLng?: string; focusName?: string }>();

  const [navRoute, setNavRoute] = useState<NavigationRoute | null>(null);
  const [navInput, setNavInput] = useState('');
  const [navLoading, setNavLoading] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanRadius, setScanRadius] = useState(5000);
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [foundIncidents, setFoundIncidents] = useState<(Incident & { distance: number })[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [activeOverlay, setActiveOverlay] = useState<'family' | 'profile' | 'chain' | null>(null);
  const [driveMode, setDriveMode] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [speedLimit, setSpeedLimit] = useState<number | null>(60);
  const [speedCameras, setSpeedCameras] = useState<SpeedCamera[]>([]);
  const speedCamerasRef = useRef<SpeedCamera[]>([]);
  const [radarAlert, setRadarAlert] = useState<string | null>(null);
  const speedAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [navRemaining, setNavRemaining] = useState<{ time: number; dist: number } | null>(null);
  const [focusLocation, setFocusLocation] = useState<{ latitude: number; longitude: number; zoom?: number } | null>(null);
  const [publicCameras, setPublicCameras] = useState<PublicCamera[]>([]);
  const [viewingCamera, setViewingCamera] = useState<PublicCamera | null>(null);
  const [showCameras, setShowCameras] = useState(true);
  const [camerasLoading, setCamerasLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (!localStorage.getItem('alertio_tutorial_done')) setShowTutorial(true);
    } else {
      (async () => {
        try {
          const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
          const done = await AsyncStorage.getItem('alertio_tutorial_done');
          if (!done) setShowTutorial(true);
        } catch { setShowTutorial(true); }
      })();
    }
  }, []);
  const [feedPage, setFeedPage] = useState(0);
  const [hoveredIncidentId, setHoveredIncidentId] = useState<string | null>(null);
  const [hoverPreviewIncident, setHoverPreviewIncident] = useState<Incident | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startHoverPreview = useCallback((inc: Incident) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoverPreviewIncident(inc);
    }, 800);
  }, []);

  const cancelHoverPreview = useCallback(() => {
    if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
    setHoverPreviewIncident(null);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('sidebar-detail-css')) {
      const style = document.createElement('style');
      style.id = 'sidebar-detail-css';
      style.textContent = `
        @keyframes sidebarDetailSlideIn {
          0% { opacity: 0; transform: translateY(-12px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (searchParams.focusLat && searchParams.focusLng) {
      const lat = parseFloat(searchParams.focusLat);
      const lng = parseFloat(searchParams.focusLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setActiveOverlay(null);
        setFocusLocation({ latitude: lat, longitude: lng, zoom: 17 });
      }
    }
  }, [searchParams.focusLat, searchParams.focusLng]);

  useEffect(() => {
    seedDatabase().then(async () => {
      const ptInc = generatePortugalIncidents();
      for (const inc of ptInc) {
        try { await IncidentDB.create(inc); } catch { /* skip duplicates */ }
      }
      const worldInc = generateWorldIncidents();
      for (const inc of worldInc) {
        try { await IncidentDB.create(inc); } catch { /* skip duplicates */ }
      }
      await loadIncidents();
      loadFamily();
      loadPublicData(USER_LOCATION.latitude, USER_LOCATION.longitude);
      fetchAllCameras()
        .then((cams) => setPublicCameras(cams))
        .catch(() => {});
      announce(`Mapa carregado com incidentes de Portugal e do mundo`);
    });
  }, []);

  // Auto-refresh public security data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPublicData(USER_LOCATION.latitude, USER_LOCATION.longitude);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Gradually spawn 50 new incidents, one every 10 seconds
  const gradualSpawnedRef = useRef(false);
  useEffect(() => {
    if (gradualSpawnedRef.current || incidents.length === 0) return;
    gradualSpawnedRef.current = true;

    const batch = generateGradualIncidents(USER_LOCATION.latitude, USER_LOCATION.longitude, 50);
    let idx = 0;
    const timer = setInterval(() => {
      if (idx >= batch.length) { clearInterval(timer); return; }
      addIncidentDirect(batch[idx]);
      idx++;
    }, 10000);
    return () => clearInterval(timer);
  }, [incidents.length > 0]);

  // Cycle live feed items every 8 seconds
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(incidents.length / 5));
    const interval = setInterval(() => {
      setFeedPage((prev) => (prev + 1) % totalPages);
    }, 8000);
    return () => clearInterval(interval);
  }, [incidents.length]);

  useEffect(() => {
    if (scanning) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])).start();
    } else { pulseAnim.stopAnimation(); pulseAnim.setValue(1); }
  }, [scanning]);

  // Keep speedCameras ref in sync with state
  useEffect(() => { speedCamerasRef.current = speedCameras; }, [speedCameras]);

  // Drive mode: simulate speed, fetch cameras, update nav remaining
  useEffect(() => {
    if (driveMode) {
      fetchSpeedCameras(USER_LOCATION.latitude, USER_LOCATION.longitude).then((cams) => {
        const resolved = cams.length > 0 ? cams : FALLBACK_CAMERAS;
        setSpeedCameras(resolved);
        speedCamerasRef.current = resolved;
      });

      let speed = 0;
      let direction = 1;
      speedAnimRef.current = setInterval(() => {
        speed += direction * (Math.random() * 8 + 1);
        if (speed > 75) direction = -1;
        if (speed < 5) direction = 1;
        speed = Math.max(0, Math.min(90, speed));
        setCurrentSpeed(Math.round(speed));

        setNavRemaining((prev) => {
          if (!prev || prev.dist <= 0) return prev;
          const metersTraveled = speed * 1.2 / 3.6;
          const newDist = Math.max(0, prev.dist - metersTraveled);
          const newTime = Math.max(0, prev.time - 1.2);
          if (newDist <= 50 && prev.dist > 50) {
            setTimeout(() => announce('Chegou ao destino!'), 0);
          }
          return { time: newTime, dist: newDist };
        });

        const cams = speedCamerasRef.current.length > 0 ? speedCamerasRef.current : FALLBACK_CAMERAS;
        const nearest = cams
          .map((c) => ({
            ...c,
            dist: haversineDistance(USER_LOCATION, { latitude: c.lat, longitude: c.lng }),
          }))
          .sort((a, b) => a.dist - b.dist)[0];

        if (nearest && nearest.dist < 800) {
          setRadarAlert(`Radar a ${Math.round(nearest.dist)}m${nearest.speedLimit ? ` — Limite ${nearest.speedLimit} km/h` : ''}`);
          if (nearest.speedLimit) setSpeedLimit(nearest.speedLimit);
        } else {
          setRadarAlert(null);
          setSpeedLimit(60);
        }
      }, 1200);

      announce('Modo Condução ativado');
      return () => { if (speedAnimRef.current) clearInterval(speedAnimRef.current); };
    } else {
      if (speedAnimRef.current) clearInterval(speedAnimRef.current);
      setCurrentSpeed(0);
      setSpeedCameras([]);
      setRadarAlert(null);
      setSpeedLimit(60);
    }
  }, [driveMode]);

  useEffect(() => {
    if (navRoute) {
      setNavRemaining({ time: navRoute.duration, dist: navRoute.distance });
    } else {
      setNavRemaining(null);
    }
  }, [navRoute]);

  const guardScan: GuardScanConfig | null = (scanOpen || scanning || scanDone)
    ? { active: true, scanning, radiusMeters: scanRadius, center: USER_LOCATION }
    : null;

  const mapMarkers: MapMarker[] = incidents.map((inc) => ({
    id: inc.id, coordinate: inc.location, incident: inc,
  }));

  const handleMarkerPress = useCallback((marker: MapMarker) => {
    haptics.light();
    selectIncident(marker.incident);
    setNavOpen(false);
    setScanOpen(false);
    announce(`Selecionado: ${getCategoryMeta(marker.incident.category).label}, ${marker.incident.title}`);
  }, []);

  const handleMapPress = useCallback(() => {
    if (selectedIncident) selectIncident(null);
    cancelHoverPreview();
  }, [selectedIncident]);

  const handleReportPress = () => { haptics.medium(); router.push('/incident/report'); };

  const startNavigation = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setNavLoading(true);
    announce(`Procurando ${query}`);
    const dest = await geocodePlace(query);
    if (!dest) { announce('Local não encontrado'); setNavLoading(false); return; }
    const route = await fetchRoute({ lat: USER_LOCATION.latitude, lng: USER_LOCATION.longitude }, { lat: dest.lat, lng: dest.lng });
    if (!route) { announce('Não foi possível calcular a rota'); setNavLoading(false); return; }
    const routeIncidents = incidents.filter((inc) => {
      for (const coord of route.coordinates) {
        const dlat = inc.location.latitude - coord[1];
        const dlng = inc.location.longitude - coord[0];
        if (Math.sqrt(dlat * dlat + dlng * dlng) < 0.003) return true;
      }
      return false;
    }).map((inc) => ({ id: inc.id, coordinate: inc.location, incident: inc }));
    setNavRoute({ coordinates: route.coordinates, distance: route.distance, duration: route.duration, destinationName: dest.name, incidents: routeIncidents });
    setNavLoading(false);
    setNavOpen(false);
    const voiceMsg = `Navegando para ${dest.name}. ${formatNavDistance(route.distance)}, aproximadamente ${formatDuration(route.duration)}.${routeIncidents.length > 0 ? ` Atenção: ${routeIncidents.length} incidentes na rota.` : ' Rota livre.'}`;
    announce(voiceMsg);
    if (Platform.OS === 'web' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(voiceMsg);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }, [incidents]);

  const stopNavigation = useCallback(() => { setNavRoute(null); setNavInput(''); setNavRemaining(null); announce('Navegação parada'); }, []);

  const startVoiceInput = useCallback(() => {
    if (Platform.OS !== 'web' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      announce('Entrada de voz não suportada');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => { setVoiceListening(true); announce('Ouvindo...'); };
    recognition.onresult = (event: any) => { const t = event.results[0][0].transcript; setNavInput(t); setVoiceListening(false); startNavigation(t); };
    recognition.onerror = () => { setVoiceListening(false); announce('Voz não reconhecida'); };
    recognition.onend = () => { setVoiceListening(false); };
    recognition.start();
  }, [startNavigation]);

  const startScan = useCallback(async () => {
    haptics.medium();
    setScanning(true);
    setScanDone(false);
    setFoundIncidents([]);
    announce(`Escaneando ${formatDistance(scanRadius)}`);
    await loadIncidents();
    const fresh = useIncidentStore.getState().incidents;
    setTimeout(() => {
      const found = fresh
        .map((inc) => ({ ...inc, distance: haversineDistance(USER_LOCATION, inc.location) }))
        .filter((inc) => inc.distance <= scanRadius)
        .sort((a, b) => a.distance - b.distance);
      setFoundIncidents(found);
      setScanning(false);
      setScanDone(true);
      haptics.success();
      announce(`${found.length} incidentes encontrados em ${formatDistance(scanRadius)}`);
    }, 2000);
  }, [scanRadius]);

  const completeTutorial = useCallback(() => {
    setShowTutorial(false);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.setItem('alertio_tutorial_done', '1');
    } else {
      import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
        AsyncStorage.setItem('alertio_tutorial_done', '1');
      }).catch(() => {});
    }
  }, []);

  const toggleCameras = useCallback(async () => {
    haptics.light();
    if (showCameras) {
      setShowCameras(false);
      return;
    }
    if (publicCameras.length > 0) {
      setShowCameras(true);
      return;
    }
    setCamerasLoading(true);
    try {
      const cams = await fetchAllCameras();
      setPublicCameras(cams);
      setShowCameras(true);
    } catch {
      setShowCameras(false);
    } finally {
      setCamerasLoading(false);
    }
  }, [showCameras, publicCameras.length]);

  const toggleDriveMode = useCallback(() => {
    haptics.medium();
    setDriveMode((prev) => !prev);
    setActiveOverlay(null);
  }, []);

  const openOverlay = useCallback((panel: 'family' | 'profile' | 'chain') => {
    haptics.light();
    setActiveOverlay((prev) => prev === panel ? null : panel);
    setDriveMode(false);
  }, []);

  if (isLoading && incidents.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <LoadingRadar size={140} message="Carregando mapa..." />
      </View>
    );
  }

  const incidentDetail = selectedIncident ? (() => {
    const dtCatColor = Colors.category[selectedIncident.category] || '#8A8A9A';
    const dtSevColor = Colors.severity[selectedIncident.severity] || '#FFB800';
    const dtCatMeta = getCategoryMeta(selectedIncident.category);
    const isMobileView = !showSidebar;

    return (
      <View style={[showSidebar ? styles.detailPanelDesktop : styles.detailPanelMobile, { backgroundColor: showSidebar ? 'transparent' : 'transparent' }]}>
        {/* Mobile: Swipe handle + close */}
        {isMobileView && (
          <View style={styles.mobileDetailTopRow}>
            <View style={[styles.sheetHandle, { backgroundColor: dtCatColor + '50' }]} />
            <Pressable
              onPress={() => selectIncident(null)}
              style={({ pressed }) => [styles.mobileCloseBtn, {
                backgroundColor: pressed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                borderColor: pressed ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
              }]}
              accessible accessibilityLabel="Fechar" accessibilityRole="button"
            >
              <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}

        {/* Severity + Status badges row */}
        {isMobileView && (
          <View style={styles.mobileBadgeRow}>
            <View style={[styles.mobileSeverityBadge, {
              backgroundColor: dtSevColor + '18',
              borderColor: dtSevColor + '40',
            }]}>
              <View style={[styles.mobileSeverityDot, {
                backgroundColor: dtSevColor,
                shadowColor: dtSevColor,
              }]} />
              <NeonText variant="caption" color={dtSevColor} style={{ fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                {selectedIncident.severity}
              </NeonText>
            </View>
            {selectedIncident.isVerified && (
              <View style={[styles.mobileSeverityBadge, {
                backgroundColor: Colors.success + '15',
                borderColor: Colors.success + '35',
              }]}>
                <MaterialCommunityIcons name="shield-check" size={12} color={Colors.success} />
                <NeonText variant="caption" color={Colors.success} style={{ fontSize: 10, fontWeight: '800' }}>Verificado</NeonText>
              </View>
            )}
            {selectedIncident.isFakeReport && (
              <View style={[styles.mobileSeverityBadge, {
                backgroundColor: Colors.error + '15',
                borderColor: Colors.error + '35',
              }]}>
                <MaterialCommunityIcons name="alert-circle" size={12} color={Colors.error} />
                <NeonText variant="caption" color={Colors.error} style={{ fontSize: 10, fontWeight: '800' }}>Falso</NeonText>
              </View>
            )}
          </View>
        )}

        {/* Category header */}
        <View style={[styles.detailHeader, isMobileView && { marginBottom: Spacing.md + 2 }]}>
          <View style={[styles.detailCatIcon, {
            backgroundColor: dtCatColor + '20',
            width: isMobileView ? 48 : 42,
            height: isMobileView ? 48 : 42,
            borderRadius: isMobileView ? 14 : 12,
            borderWidth: isMobileView ? 1.5 : 0,
            borderColor: dtCatColor + '30',
            shadowColor: dtCatColor,
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
            elevation: 4,
          }]}>
            <MaterialCommunityIcons name={dtCatMeta.icon as any} size={isMobileView ? 26 : 24} color={dtCatColor} />
          </View>
          <View style={styles.detailHeaderText}>
            <NeonText variant="label" color={dtCatColor} style={isMobileView ? { fontSize: 14, fontWeight: '700' } : undefined}>
              {dtCatMeta.label}
            </NeonText>
            <NeonText variant="caption" color={colors.textTertiary} style={isMobileView ? { fontSize: 12, marginTop: 2 } : undefined}>
              {timeAgo(selectedIncident.createdAt)}{selectedIncident.address ? ` • ${selectedIncident.address}` : ''}
            </NeonText>
          </View>
          {!isMobileView && selectedIncident.isVerified && (
            <NeonText variant="caption" color={Colors.success} glow={Colors.success} style={{ fontWeight: '800', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>Verificado</NeonText>
          )}
        </View>

        {/* Title */}
        <View style={styles.detailTitleRow}>
          <NeonText variant="h4" style={[styles.detailTitle, isMobileView && { fontSize: 17, lineHeight: 23 }]}>
            {selectedIncident.title}
          </NeonText>
        </View>

        {/* Description */}
        <NeonText variant="bodySm" color={colors.textSecondary} numberOfLines={isMobileView ? 6 : 4} style={isMobileView ? { fontSize: 14, lineHeight: 20, marginBottom: Spacing.sm } : undefined}>
          {selectedIncident.description}
        </NeonText>

        {/* Action buttons — larger touch targets on mobile */}
        <View style={[styles.detailStats, { flexWrap: 'wrap', gap: isMobileView ? 8 : 6 }]}>
          <Pressable
            onPress={() => { haptics.success(); useIncidentStore.getState().confirmIncident(selectedIncident.id); announce('Confirmado'); }}
            style={({ pressed }) => [styles.detailStat, {
              backgroundColor: pressed ? Colors.success + '30' : Colors.success + '10',
              borderWidth: 1, borderColor: pressed ? Colors.success + '60' : Colors.success + '25',
              borderRadius: isMobileView ? 10 : 8,
              paddingHorizontal: isMobileView ? 16 : 10,
              paddingVertical: isMobileView ? 10 : 5,
              minHeight: isMobileView ? 44 : undefined,
              transform: [{ scale: pressed ? 0.92 : 1 }],
              ...(Platform.OS === 'web' ? { transition: 'transform 0.15s, background 0.15s, border-color 0.15s' } as any : {}),
            }]}
            accessible accessibilityLabel="Confirmar" accessibilityRole="button">
            <MaterialCommunityIcons name="thumb-up" size={isMobileView ? 18 : 14} color={Colors.success} />
            <NeonText variant="bodySm" color={Colors.success} style={{ fontWeight: '700', fontSize: isMobileView ? 14 : 12 }}>{selectedIncident.confirmCount}</NeonText>
          </Pressable>
          <Pressable
            onPress={() => { haptics.warning(); useIncidentStore.getState().denyIncident(selectedIncident.id); announce('Negado'); }}
            style={({ pressed }) => [styles.detailStat, {
              backgroundColor: pressed ? Colors.error + '30' : Colors.error + '10',
              borderWidth: 1, borderColor: pressed ? Colors.error + '60' : Colors.error + '25',
              borderRadius: isMobileView ? 10 : 8,
              paddingHorizontal: isMobileView ? 16 : 10,
              paddingVertical: isMobileView ? 10 : 5,
              minHeight: isMobileView ? 44 : undefined,
              transform: [{ scale: pressed ? 0.92 : 1 }],
              ...(Platform.OS === 'web' ? { transition: 'transform 0.15s, background 0.15s, border-color 0.15s' } as any : {}),
            }]}
            accessible accessibilityLabel="Negar" accessibilityRole="button">
            <MaterialCommunityIcons name="thumb-down" size={isMobileView ? 18 : 14} color={Colors.error} />
            <NeonText variant="bodySm" color={Colors.error} style={{ fontWeight: '700', fontSize: isMobileView ? 14 : 12 }}>{selectedIncident.denyCount}</NeonText>
          </Pressable>
          <View style={[styles.detailStat, isMobileView && { paddingHorizontal: 12, paddingVertical: 8 }]}>
            <MaterialCommunityIcons name="eye-outline" size={isMobileView ? 18 : 14} color={Colors.warning} />
            <NeonText variant="bodySm" color={Colors.warning} style={isMobileView ? { fontSize: 14 } : undefined}>{selectedIncident.views}</NeonText>
          </View>
        </View>

        {/* Guardian verify button */}
        {user?.isGuardian && !selectedIncident.isVerified && (
          <Pressable onPress={() => { haptics.heavy(); useIncidentStore.getState().verifyIncident(selectedIncident.id, user.uid, user.displayName); announce('Verificado!'); }}
            style={({ pressed }) => [styles.actionBtn, {
              backgroundColor: pressed ? Colors.primary + '25' : Colors.primary + '12',
              borderColor: Colors.primary + '40',
              marginBottom: Spacing.md,
              minHeight: isMobileView ? 52 : 48,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            }]}
            accessible accessibilityLabel="Verificar como Guardião" accessibilityRole="button">
            <MaterialCommunityIcons name="shield-check" size={isMobileView ? 22 : 18} color={Colors.primary} />
            <NeonText variant="buttonSm" color={Colors.primary} style={isMobileView ? { fontSize: 15 } : undefined}>Verificar como Guardião</NeonText>
          </Pressable>
        )}

        {/* Verified by info */}
        {selectedIncident.isVerified && selectedIncident.verifiedByName && (
          <NeonText variant="caption" color={colors.textTertiary} style={{ marginBottom: Spacing.xs, fontSize: isMobileView ? 12 : undefined }}>
            Verificado por {selectedIncident.verifiedByName}
          </NeonText>
        )}

        {/* Reporter info */}
        <View style={[styles.detailReporter, isMobileView && { paddingTop: Spacing.xs, marginTop: Spacing.xs, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
          <BadgeIcon level={selectedIncident.reporterLevel} size={isMobileView ? 'md' : 'sm'} />
          <NeonText variant="bodySm" color={colors.textSecondary} style={{ marginLeft: Spacing.sm, fontSize: isMobileView ? 13 : undefined }}>
            por {selectedIncident.reporterName}
          </NeonText>
        </View>
      </View>
    );
  })() : null;

  const navPanel = (navOpen || navRoute) ? (
    <View style={[styles.navPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {!navRoute && (
        <>
          <View style={styles.navSearchRow}>
            <View style={[styles.navSearchInput, { borderColor: colors.border, backgroundColor: colors.glass.background }]}>
              <MaterialCommunityIcons name="map-search" size={16} color={colors.primary} />
              <TextInput
                value={navInput}
                onChangeText={setNavInput}
                placeholder="Para onde?"
                placeholderTextColor={colors.textTertiary}
                style={[styles.navTextInput, { color: colors.textPrimary }]}
                onSubmitEditing={() => startNavigation(navInput)}
                returnKeyType="go"
                autoFocus
              />
              {navInput.length > 0 && (
                <Pressable onPress={() => setNavInput('')} style={{ padding: 2 }}>
                  <MaterialCommunityIcons name="close-circle" size={14} color={colors.textTertiary} />
                </Pressable>
              )}
            </View>
            <Pressable onPress={startVoiceInput}
              style={({ pressed }) => [styles.navVoiceBtn, {
                backgroundColor: voiceListening ? Colors.error + '20' : pressed ? colors.primary + '20' : 'transparent',
                borderColor: voiceListening ? Colors.error : colors.border,
              }]}>
              <MaterialCommunityIcons name={voiceListening ? 'microphone' : 'microphone-outline'} size={18}
                color={voiceListening ? Colors.error : colors.primary} />
            </Pressable>
          </View>
          {navLoading && (
            <View style={styles.navLoading}>
              <MaterialCommunityIcons name="loading" size={16} color={colors.primary} />
              <NeonText variant="caption" color={colors.primary} style={{ marginLeft: 6 }}>A calcular rota...</NeonText>
            </View>
          )}
          <Pressable onPress={() => startNavigation(navInput)} disabled={!navInput.trim() || navLoading}
            style={({ pressed }) => [styles.navGoBtn, { backgroundColor: !navInput.trim() ? colors.border : pressed ? colors.primaryDim : colors.primary, opacity: !navInput.trim() ? 0.4 : 1 }]}>
            <MaterialCommunityIcons name="navigation" size={16} color={colors.background} />
            <NeonText variant="caption" color={colors.background} style={{ fontWeight: '700', marginLeft: 4 }}>Navegar</NeonText>
          </Pressable>
        </>
      )}

      {navRoute && (
        <View style={styles.navActivePanel}>
          <View style={styles.navActiveHeader}>
            <View style={{ flex: 1 }}>
              <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>A navegar para</NeonText>
              <NeonText variant="label" color={colors.textPrimary} numberOfLines={1}>{navRoute.destinationName}</NeonText>
            </View>
            <Pressable onPress={stopNavigation} style={({ pressed }) => [styles.navStopBtn, { backgroundColor: pressed ? Colors.error + '30' : Colors.error + '15', borderColor: Colors.error + '40' }]}>
              <MaterialCommunityIcons name="close" size={14} color={Colors.error} />
              <NeonText variant="caption" color={Colors.error} style={{ fontWeight: '700', fontSize: 9, marginLeft: 2 }}>Parar</NeonText>
            </Pressable>
          </View>
          <View style={styles.navStats}>
            <View style={styles.navStatItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#00AAFF" />
              <NeonText variant="h4" color="#00AAFF" style={{ marginTop: 2 }}>{formatDuration(navRoute.duration)}</NeonText>
              <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 9 }}>Chegada</NeonText>
            </View>
            <View style={[styles.navStatDivider, { backgroundColor: colors.border }]} />
            <View style={styles.navStatItem}>
              <MaterialCommunityIcons name="map-marker-distance" size={20} color={Colors.primary} />
              <NeonText variant="h4" color={Colors.primary} style={{ marginTop: 2 }}>{formatNavDistance(navRoute.distance)}</NeonText>
              <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 9 }}>Distância</NeonText>
            </View>
            <View style={[styles.navStatDivider, { backgroundColor: colors.border }]} />
            <View style={styles.navStatItem}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20}
                color={navRoute.incidents.length > 0 ? Colors.warning : Colors.success} />
              <NeonText variant="h4" color={navRoute.incidents.length > 0 ? Colors.warning : Colors.success} style={{ marginTop: 2 }}>
                {navRoute.incidents.length}
              </NeonText>
              <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 9 }}>Incidentes</NeonText>
            </View>
          </View>
          {navRoute.incidents.length > 0 && (
            <View style={styles.navIncidents}>
              <NeonText variant="caption" color={Colors.warning} style={{ fontWeight: '700', marginBottom: 4 }}>⚠ Incidentes na rota:</NeonText>
              {navRoute.incidents.slice(0, 3).map((inc) => (
                <View key={inc.id} style={styles.navIncidentRow}>
                  <NeonText variant="caption" color={Colors.category[inc.incident.category]} style={{ fontSize: 10 }}>{getCategoryMeta(inc.incident.category).label}</NeonText>
                  <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 10 }} numberOfLines={1}>{inc.incident.title}</NeonText>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  ) : null;

  const guardScanPanel = scanOpen ? (
    <View style={[styles.scanPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.scanPanelHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="radar" size={18} color={colors.primary} />
          <NeonText variant="label" color={colors.primary} style={{ marginLeft: 6 }}>GuardScan</NeonText>
        </View>
        <Pressable onPress={() => { setScanOpen(false); setScanDone(false); }} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1, padding: 4 }]}>
          <MaterialCommunityIcons name="close" size={16} color={colors.textTertiary} />
        </Pressable>
      </View>
      <View style={styles.scanRadiusRow}>
        {RADIUS_OPTIONS.map((opt) => (
          <Pressable key={opt.value} onPress={() => { haptics.selection(); setScanRadius(opt.value); setScanDone(false); }}
            style={({ pressed }) => [styles.scanRadiusChip, {
              backgroundColor: scanRadius === opt.value ? colors.primary + '20' : 'transparent',
              borderColor: scanRadius === opt.value ? colors.primary : colors.border,
              transform: [{ scale: pressed ? 0.9 : 1 }],
            }]}>
            <NeonText variant="caption" color={scanRadius === opt.value ? colors.primary : colors.textSecondary} style={{ fontSize: 10 }}>{opt.label}</NeonText>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={startScan} disabled={scanning}
        style={({ pressed }) => [styles.scanBtn, { backgroundColor: scanning ? colors.primary + '20' : pressed ? colors.primaryDim : colors.primary }]}>
        <Animated.View style={{ transform: [{ scale: scanning ? pulseAnim : 1 }], flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name="radar" size={16} color={scanning ? colors.primary : colors.background} />
          <NeonText variant="caption" color={scanning ? colors.primary : colors.background} style={{ fontWeight: '700' }}>{scanning ? 'A escanear...' : 'Escanear Área'}</NeonText>
        </Animated.View>
      </Pressable>
      {scanDone && (
        <View style={styles.scanResults}>
          <NeonText variant="caption" color={colors.primary} style={{ fontWeight: '700' }}>{foundIncidents.length} encontrados num raio de {formatDistance(scanRadius)}</NeonText>
          {foundIncidents.slice(0, 3).map((inc) => (
            <View key={inc.id} style={styles.scanResultRow}>
              <NeonText variant="caption" color={Colors.category[inc.category]} style={{ fontSize: 12 }}>{getCategoryMeta(inc.category).label}</NeonText>
              <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 10 }}>{formatDistance(inc.distance)}</NeonText>
            </View>
          ))}
          {foundIncidents.length === 0 && <NeonText variant="caption" color={Colors.success}>Área limpa!</NeonText>}
        </View>
      )}
    </View>
  ) : null;

  const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
    community: { label: 'Comunidade', color: Colors.primary },
    uk_police: { label: 'UK Police', color: '#3B7AFF' },
    dc_gov: { label: 'DC Gov', color: '#FF9800' },
    dados_gov: { label: 'Dados.gov.pt', color: '#00BCD4' },
  };

  const sortedFeedItems = incidents
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt);
  const liveFeedItems = sortedFeedItems.slice(feedPage * 5, feedPage * 5 + 5);

  const nearbyIncidents = incidents
    .filter((inc) => {
      const dist = haversineDistance(USER_LOCATION, inc.location);
      return dist <= 25000;
    })
    .sort((a, b) => haversineDistance(USER_LOCATION, a.location) - haversineDistance(USER_LOCATION, b.location))
    .slice(0, 20);

  const feedSection = (
    <View style={styles.feedSection}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingVertical: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {Platform.OS === 'web' && (
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#FF3B30', boxShadow: '0 0 6px #FF3B30, 0 0 12px #FF3B3050', animation: 'pulse-live 1.5s ease-in-out infinite' } as any} />
          )}
          {Platform.OS !== 'web' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30' }} />}
          <NeonText variant="caption" color="#FF3B30" style={{ fontWeight: '900', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' }}>LIVE</NeonText>
          <NeonText variant="caption" color={colors.primary} style={{ fontWeight: '700', fontSize: 10, letterSpacing: 0.5 }}>Feed ao Vivo</NeonText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 8 }}>{feedPage + 1}/{Math.max(1, Math.ceil(sortedFeedItems.length / 5))}</NeonText>
          <View style={{ width: 1, height: 8, backgroundColor: colors.border }} />
          <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 8 }}>{incidents.length} total</NeonText>
        </View>
      </View>
      {Platform.OS === 'web' && <style>{`@keyframes pulse-live { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }`}</style>}
      {liveFeedItems.map((inc) => {
        const catMeta = getCategoryMeta(inc.category);
        const catColor = Colors.category[inc.category] || '#8A8A9A';
        const src = SOURCE_LABELS[(inc as any).source || 'community'] || SOURCE_LABELS.community;
        return (
          <Pressable key={inc.id} onPress={() => { haptics.light(); selectIncident(inc); cancelHoverPreview(); setFocusLocation({ latitude: inc.location.latitude, longitude: inc.location.longitude, zoom: 16 }); }}
            // @ts-ignore web-only
            onMouseEnter={() => { setHoveredIncidentId(inc.id); startHoverPreview(inc); }}
            onMouseLeave={() => { setHoveredIncidentId(null); cancelHoverPreview(); }}
            style={({ pressed }) => [styles.feedItem, {
              borderBottomColor: colors.border,
              backgroundColor: hoverPreviewIncident?.id === inc.id ? catColor + '0C' : pressed ? catColor + '08' : 'transparent',
              borderRadius: 8, paddingHorizontal: 4,
              ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'background-color 0.2s ease' } as any : {}),
            }]}>
            <View style={[styles.feedDot, { backgroundColor: catColor }]} />
            <View style={styles.feedBody}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <NeonText variant="caption" color={catColor} style={{ fontWeight: '700', fontSize: 9, textTransform: 'uppercase' }}>{catMeta.label}</NeonText>
                <View style={{ width: 1, height: 10, backgroundColor: colors.border }} />
                <NeonText variant="caption" color={src.color} style={{ fontSize: 8, fontWeight: '600' }}>{src.label}</NeonText>
                {inc.isVerified && <NeonText variant="caption" color={Colors.success} style={{ fontSize: 8, fontWeight: '800' }}>✓ Verificado</NeonText>}
              </View>
              <NeonText variant="caption" numberOfLines={2} style={{ lineHeight: 16 }}>{inc.title}</NeonText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 10 }}>{timeAgo(inc.createdAt)}</NeonText>
                <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 10 }}>👍 {inc.confirmCount} · 👎 {inc.denyCount} · 👁 {inc.views}</NeonText>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  // Drive Mode HUD overlay
  const isOverspeed = currentSpeed > (speedLimit || 999);
  const glassWeb = (blur = 40) => Platform.OS === 'web' ? { backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` } as any : {};
  const driveHUD = driveMode ? (
    <View style={[styles.driveHudContainer, { pointerEvents: 'box-none' }]}>

      {/* ── Top-left: Mode pill + destination ── */}
      <View style={[styles.driveTopLeftBar, { pointerEvents: 'auto' as const }]}>
        <View style={[styles.driveModePill, {
          backgroundColor: lightTheme ? 'rgba(255,255,255,0.15)' : 'rgba(10,10,26,0.18)',
          borderColor: 'rgba(0,170,255,0.2)',
          ...glassWeb(32),
          ...(Platform.OS === 'web' ? { boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)' } as any : {}),
        }]}>
          <MaterialCommunityIcons name="steering" size={14} color="#00AAFF" />
          <NeonText variant="caption" color="#00AAFF" style={{ fontWeight: '800', fontSize: 9, letterSpacing: 1.5, marginLeft: 5 }}>CONDUÇÃO</NeonText>
          <Pressable onPress={toggleDriveMode} style={({ pressed }) => ({
            marginLeft: 8, padding: 4, borderRadius: 12,
            backgroundColor: pressed ? 'rgba(255,68,68,0.2)' : 'rgba(255,68,68,0.08)',
            transform: [{ scale: pressed ? 0.9 : 1 }],
            ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } as any : {}),
          })}>
            <MaterialCommunityIcons name="close" size={12} color="#FF6666" />
          </Pressable>
        </View>
        {navRoute && navRemaining && (
          <View style={[styles.driveDestBadge, {
            backgroundColor: lightTheme ? 'rgba(255,255,255,0.12)' : 'rgba(10,10,26,0.15)',
            ...glassWeb(28),
            ...(Platform.OS === 'web' ? { boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)' } as any : {}),
          }]}>
            <MaterialCommunityIcons name="navigation" size={11} color={Colors.primary} />
            <NeonText variant="caption" color={colors.textPrimary} numberOfLines={1} style={{ fontSize: 10, fontWeight: '700', marginLeft: 4, maxWidth: 140 }}>
              {navRoute.destinationName}
            </NeonText>
          </View>
        )}
      </View>

      {/* ── Top-right: Control buttons (vertical stack) ── */}
      <View style={[styles.driveTopRightControls, { pointerEvents: 'auto' as const }]}>
        <Pressable onPress={() => { haptics.medium(); setNavOpen(!navOpen); setScanOpen(false); }}
          style={({ pressed }) => [styles.driveControlBtn, {
            backgroundColor: navOpen ? 'rgba(0,170,255,0.12)' : lightTheme ? 'rgba(255,255,255,0.15)' : 'rgba(10,10,26,0.18)',
            borderColor: navOpen ? 'rgba(0,170,255,0.3)' : 'rgba(255,255,255,0.06)',
            transform: [{ scale: pressed ? 0.9 : 1 }],
            ...glassWeb(28),
            ...(Platform.OS === 'web' ? { boxShadow: navOpen ? '0 0 16px rgba(0,170,255,0.2)' : '0 4px 16px rgba(0,0,0,0.12)' } as any : {}),
          }]}>
          <MaterialCommunityIcons name="navigation-variant" size={20} color="#00AAFF" />
          <NeonText variant="caption" color="#00AAFF" style={{ fontSize: 7, fontWeight: '700', marginTop: 2, letterSpacing: 0.4 }}>Navegar</NeonText>
        </Pressable>
        <Pressable onPress={() => { haptics.medium(); setScanOpen(!scanOpen); setNavOpen(false); }}
          style={({ pressed }) => [styles.driveControlBtn, {
            backgroundColor: scanOpen ? 'rgba(0,255,170,0.1)' : lightTheme ? 'rgba(255,255,255,0.15)' : 'rgba(10,10,26,0.18)',
            borderColor: scanOpen ? 'rgba(0,255,170,0.3)' : 'rgba(255,255,255,0.06)',
            transform: [{ scale: pressed ? 0.9 : 1 }],
            ...glassWeb(28),
            ...(Platform.OS === 'web' ? { boxShadow: scanOpen ? '0 0 16px rgba(0,255,170,0.2)' : '0 4px 16px rgba(0,0,0,0.12)' } as any : {}),
          }]}>
          <MaterialCommunityIcons name="radar" size={20} color={Colors.primary} />
          <NeonText variant="caption" color={Colors.primary} style={{ fontSize: 7, fontWeight: '700', marginTop: 2, letterSpacing: 0.4 }}>Escanear</NeonText>
        </Pressable>
        <Pressable onPress={handleReportPress}
          style={({ pressed }) => [styles.driveControlBtn, {
            backgroundColor: lightTheme ? 'rgba(255,255,255,0.15)' : 'rgba(10,10,26,0.18)',
            borderColor: 'rgba(255,255,255,0.06)',
            transform: [{ scale: pressed ? 0.9 : 1 }],
            ...glassWeb(28),
            ...(Platform.OS === 'web' ? { boxShadow: '0 4px 16px rgba(0,0,0,0.12)' } as any : {}),
          }]}>
          <MaterialCommunityIcons name="plus-circle" size={20} color={Colors.warning} />
          <NeonText variant="caption" color={Colors.warning} style={{ fontSize: 7, fontWeight: '700', marginTop: 2, letterSpacing: 0.4 }}>Reportar</NeonText>
        </Pressable>
        {navRoute && (
          <Pressable onPress={stopNavigation}
            style={({ pressed }) => [styles.driveControlBtn, {
              backgroundColor: pressed ? 'rgba(255,68,68,0.12)' : lightTheme ? 'rgba(255,255,255,0.15)' : 'rgba(10,10,26,0.18)',
              borderColor: 'rgba(255,68,68,0.15)',
              transform: [{ scale: pressed ? 0.9 : 1 }],
              ...glassWeb(28),
              ...(Platform.OS === 'web' ? { boxShadow: pressed ? '0 0 16px rgba(255,68,68,0.15)' : '0 4px 16px rgba(0,0,0,0.12)' } as any : {}),
            }]}>
            <MaterialCommunityIcons name="stop-circle" size={20} color="#FF5555" />
            <NeonText variant="caption" color="#FF5555" style={{ fontSize: 7, fontWeight: '700', marginTop: 2, letterSpacing: 0.4 }}>Parar</NeonText>
          </Pressable>
        )}
      </View>

      {/* ── Center: Alert banners ── */}
      <View style={styles.driveAlertArea}>
        {radarAlert && (
          <View style={[styles.driveAlertBanner, {
            backgroundColor: 'rgba(255,50,50,0.06)',
            borderColor: 'rgba(255,60,60,0.12)',
            ...glassWeb(28),
            ...(Platform.OS === 'web' ? { boxShadow: '0 4px 24px rgba(255,60,60,0.1), inset 0 1px 0 rgba(255,120,120,0.06)' } as any : {}),
          }, { pointerEvents: 'auto' as const }]}>
            <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(255,68,68,0.08)', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="camera" size={16} color="#FF5555" />
            </View>
            <NeonText variant="bodySm" color="#FF7777" style={{ fontWeight: '700', marginLeft: 8, flex: 1, fontSize: 11 }}>{radarAlert}</NeonText>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF4444' }} />
          </View>
        )}
        {navRoute && navRoute.incidents.length > 0 && (
          <View style={[styles.driveAlertBanner, {
            backgroundColor: 'rgba(255,170,0,0.04)',
            borderColor: 'rgba(255,170,0,0.1)',
            ...glassWeb(28),
            ...(Platform.OS === 'web' ? { boxShadow: '0 4px 24px rgba(255,170,0,0.08), inset 0 1px 0 rgba(255,200,100,0.05)' } as any : {}),
          }, { pointerEvents: 'auto' as const }]}>
            <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: Colors.warning + '0A', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={Colors.warning} />
            </View>
            <NeonText variant="bodySm" color={Colors.warning} style={{ fontWeight: '700', marginLeft: 8, flex: 1, fontSize: 11 }}>
              {navRoute.incidents.length} incidente{navRoute.incidents.length > 1 ? 's' : ''} na rota
            </NeonText>
          </View>
        )}
      </View>

      {/* ── Bottom-left: Speed limit sign ── */}
      {speedLimit != null && (
        <View style={[styles.driveBottomLeft, { pointerEvents: 'auto' as const }]}>
          <View style={[styles.driveSpeedLimitSign, {
            borderColor: isOverspeed ? '#FF4444' : '#FF6633',
            backgroundColor: lightTheme ? 'rgba(255,255,255,0.18)' : 'rgba(20,20,30,0.2)',
            ...glassWeb(32),
            ...(Platform.OS === 'web' ? {
              boxShadow: isOverspeed
                ? '0 0 24px rgba(255,68,68,0.35), inset 0 0 12px rgba(255,68,68,0.06)'
                : '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
            } as any : {}),
          }]}>
            <NeonText variant="h4" color={isOverspeed ? '#FF4444' : colors.textPrimary} style={{ fontSize: 22, fontWeight: '900' }}>
              {speedLimit}
            </NeonText>
          </View>
        </View>
      )}

      {/* ── Bottom-right: Speedometer + nav stats ── */}
      <View style={[styles.driveBottomRight, { pointerEvents: 'auto' as const }]}>
        {/* Nav stats (when navigating) */}
        {navRoute && navRemaining && (
          <View style={styles.driveNavStatsRow}>
            <View style={[styles.driveNavStatCard, {
              backgroundColor: 'rgba(0,170,255,0.04)',
              borderColor: 'rgba(0,170,255,0.1)',
              ...glassWeb(20),
              ...(Platform.OS === 'web' ? { boxShadow: '0 2px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(0,170,255,0.06)' } as any : {}),
            }]}>
              <MaterialCommunityIcons name="clock-outline" size={13} color="#00AAFF" />
              <NeonText variant="label" color="#00AAFF" style={{ fontSize: 14, fontWeight: '900', marginTop: 1 }}>
                {formatDuration(navRemaining.time)}
              </NeonText>
              <NeonText variant="caption" color="#6A7A9A" style={{ fontSize: 7, letterSpacing: 0.6 }}>Chegada</NeonText>
            </View>
            <View style={[styles.driveNavStatCard, {
              backgroundColor: 'rgba(0,255,170,0.03)',
              borderColor: 'rgba(0,255,170,0.1)',
              ...glassWeb(20),
              ...(Platform.OS === 'web' ? { boxShadow: '0 2px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(0,255,170,0.06)' } as any : {}),
            }]}>
              <MaterialCommunityIcons name="map-marker-distance" size={13} color={Colors.primary} />
              <NeonText variant="label" color={Colors.primary} style={{ fontSize: 14, fontWeight: '900', marginTop: 1 }}>
                {formatNavDistance(navRemaining.dist)}
              </NeonText>
              <NeonText variant="caption" color="#6A7A9A" style={{ fontSize: 7, letterSpacing: 0.6 }}>Distância</NeonText>
            </View>
            <View style={[styles.driveNavStatCard, {
              backgroundColor: navRoute.incidents.length > 0 ? 'rgba(255,170,0,0.04)' : 'rgba(52,199,89,0.03)',
              borderColor: navRoute.incidents.length > 0 ? 'rgba(255,170,0,0.1)' : 'rgba(52,199,89,0.1)',
              ...glassWeb(20),
              ...(Platform.OS === 'web' ? { boxShadow: '0 2px 12px rgba(0,0,0,0.1)' } as any : {}),
            }]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={13}
                color={navRoute.incidents.length > 0 ? Colors.warning : Colors.success} />
              <NeonText variant="label" color={navRoute.incidents.length > 0 ? Colors.warning : Colors.success}
                style={{ fontSize: 14, fontWeight: '900', marginTop: 1 }}>
                {navRoute.incidents.length}
              </NeonText>
              <NeonText variant="caption" color="#6A7A9A" style={{ fontSize: 7, letterSpacing: 0.6 }}>Alertas</NeonText>
            </View>
          </View>
        )}
        {/* Speed gauge */}
        <View style={[styles.driveSpeedGauge, {
          borderColor: isOverspeed ? 'rgba(255,68,68,0.2)' : 'rgba(0,255,170,0.1)',
          backgroundColor: isOverspeed ? 'rgba(255,50,50,0.04)' : lightTheme ? 'rgba(255,255,255,0.12)' : 'rgba(8,8,22,0.15)',
          ...glassWeb(48),
          ...(Platform.OS === 'web' ? {
            boxShadow: isOverspeed
              ? '0 4px 32px rgba(255,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 24px rgba(255,68,68,0.03)'
              : '0 4px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 24px rgba(0,255,170,0.015)',
          } as any : {}),
        }]}>
          <NeonText variant="caption" color={isOverspeed ? '#FF8888' : '#6A6A8A'} style={{ fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 2 }}>Velocidade</NeonText>
          <NeonText variant="h3" color={isOverspeed ? '#FF4444' : '#fff'} style={{ fontSize: 48, fontWeight: '900', lineHeight: 52 }} glow={isOverspeed ? '#FF4444' : Colors.primary}>
            {currentSpeed}
          </NeonText>
          <NeonText variant="caption" color="#6A6A8A" style={{ fontSize: 10, marginTop: -3, letterSpacing: 1 }}>km/h</NeonText>
        </View>
      </View>

    </View>
  ) : null;

  const overlayMeta: Record<string, { title: string; icon: string; color: string }> = {
    family: { title: 'Família', icon: 'account-group', color: Colors.secondary },
    chain: { title: 'Chain', icon: 'link-variant', color: '#FF9800' },
    profile: { title: 'Perfil', icon: 'account-circle', color: Colors.primary },
  };

  const overlayPanel = activeOverlay ? (
    <View style={styles.overlayContainer}>
      <Pressable style={styles.overlayBackdrop} onPress={() => setActiveOverlay(null)} />
      <View style={[styles.overlaySheet, isPhone && styles.overlaySheetMobile, {
        backgroundColor: lightTheme ? 'rgba(250,252,255,0.94)' : 'rgba(14,16,28,0.94)',
        borderColor: lightTheme ? 'rgba(0,0,0,0.06)' : overlayMeta[activeOverlay].color + '18',
        ...(Platform.OS === 'web' ? {
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          animation: 'overlay-slide-in 0.3s cubic-bezier(0.16,1,0.3,1) both',
        } as any : {}),
      }]}>
        <View style={[styles.overlayHeader, isPhone && { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 }, {
          borderBottomColor: lightTheme ? 'rgba(0,0,0,0.06)' : overlayMeta[activeOverlay].color + '15',
        }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{
              width: isPhone ? 28 : 30, height: isPhone ? 28 : 30, borderRadius: 8,
              backgroundColor: overlayMeta[activeOverlay].color + '15',
              borderWidth: 1, borderColor: overlayMeta[activeOverlay].color + '30',
              justifyContent: 'center', alignItems: 'center',
            }}>
              <MaterialCommunityIcons name={overlayMeta[activeOverlay].icon as any} size={isPhone ? 14 : 16} color={overlayMeta[activeOverlay].color} />
            </View>
            <NeonText variant={isPhone ? 'body' : 'h4'} color={colors.textPrimary} glow={overlayMeta[activeOverlay].color + '40'} style={isPhone ? { fontWeight: '700' } : undefined}>
              {overlayMeta[activeOverlay].title}
            </NeonText>
          </View>
          <Pressable onPress={() => setActiveOverlay(null)} hitSlop={8}
            style={({ pressed }) => [styles.overlayCloseBtn, {
              transform: [{ scale: pressed ? 0.88 : 1 }],
              backgroundColor: pressed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
              borderColor: pressed ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
              ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease' } as any : {}),
            }]}>
            <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: isPhone ? 40 : 24 }}>
          {activeOverlay === 'family' ? <FamilyScreen /> : activeOverlay === 'chain' ? <ChainScreen /> : <ProfileScreen />}
        </ScrollView>
      </View>
    </View>
  ) : null;

  // ── DESKTOP LAYOUT ──
  if (showSidebar) {
    return (
      <View style={[styles.desktopContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.sidebar, {
          width: sidebarWidth,
          backgroundColor: lightTheme ? '#F4F6FB' : '#0C0E18',
          borderColor: lightTheme ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
          ...(Platform.OS === 'web' ? {
            boxShadow: lightTheme
              ? '4px 0 24px rgba(0,0,0,0.06)'
              : '4px 0 32px rgba(0,0,0,0.45), inset -1px 0 0 rgba(255,255,255,0.03)',
          } as any : {}),
        }]}>
          <View style={styles.sidebarHeader}>
            <View style={[styles.appNameBox, {
              backgroundColor: lightTheme ? 'rgba(255,255,255,0.6)' : 'rgba(0,255,170,0.04)',
              borderColor: lightTheme ? 'rgba(0,0,0,0.06)' : 'rgba(0,255,170,0.10)',
              shadowColor: Colors.primary,
            }]}>
              <LogoMark size={24} color={Colors.primary} />
              <NeonText variant="h3" glow={colors.primaryGlow} style={{ fontFamily: Platform.OS === 'web' ? "'Courier New', monospace" : 'monospace', letterSpacing: 2, fontWeight: '700' }}>ALERT<NeonText variant="h3" color={Colors.primary} style={{ fontFamily: Platform.OS === 'web' ? "'Courier New', monospace" : 'monospace', fontWeight: '400' }}>.IO</NeonText></NeonText>
            </View>
            <NeonText variant="caption" color={colors.textSecondary} style={{ marginTop: 6, letterSpacing: 0.3 }}>{incidents.length} incidentes ativos por perto</NeonText>
            <View style={[styles.navButtonRow, { marginTop: 10, gap: 4 }]}>
              <TopBarIcon icon="link-variant" label="Chain" active={activeOverlay === 'chain'} color="#FF9800" onPress={() => openOverlay('chain')} compact />
              <TopBarIcon icon="account-group" label="Família" active={activeOverlay === 'family'} color={Colors.secondary} onPress={() => openOverlay('family')} compact />
              <TopBarIcon icon="account-circle" label="Perfil" active={activeOverlay === 'profile'} color={Colors.primary} onPress={() => openOverlay('profile')} badge={user?.isGuardian} compact />
              <TopBarIcon icon="steering" label="Condução" active={driveMode} color="#00AAFF" onPress={toggleDriveMode} compact />
              <TopBarIcon icon="web" label="alert.io" active={false} color="#9C27B0" onPress={() => {
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                  window.open(LANDING_PAGE_URL, '_blank');
                }
              }} compact />
            </View>
          </View>

          {/* ── Compact Profile Card ── */}
          {user && (() => {
            const badge = getBadgeForReputation(user.reputation);
            return (
              <View style={{
                marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
                flexDirection: 'row', alignItems: 'center', gap: 10,
                paddingVertical: 10, paddingHorizontal: 12,
                borderRadius: Radius.lg, borderWidth: 1,
                borderColor: badge.color + '20',
                backgroundColor: badge.color + '06',
                ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease' } as any : {}),
              }}>
                <View style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: badge.color + '18', borderWidth: 1.5, borderColor: badge.color + '40',
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <NeonText style={{ fontSize: 18 }}>{badge.icon}</NeonText>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <NeonText variant="bodySm" color={colors.textPrimary} style={{ fontWeight: '700', fontSize: 12 }} numberOfLines={1}>
                    {user.displayName}
                  </NeonText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <NeonText variant="caption" color={badge.color} style={{ fontSize: 8, fontWeight: '700', letterSpacing: 0.3 }}>
                      LV.{badge.level}
                    </NeonText>
                    <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: colors.textTertiary }} />
                    <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 8 }} numberOfLines={1}>
                      {badge.name}
                    </NeonText>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <MaterialCommunityIcons name="file-document-edit-outline" size={10} color={Colors.primary} />
                    <NeonText variant="caption" color={Colors.primary} style={{ fontSize: 10, fontWeight: '800' }}>
                      {user.totalReports}
                    </NeonText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <MaterialCommunityIcons name="star" size={10} color={badge.color} />
                    <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 8 }}>
                      {user.reputation.toLocaleString()} pts
                    </NeonText>
                  </View>
                </View>
              </View>
            );
          })()}

          {/* Stacked layout: Feed on top, Nearby below */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: Spacing['4xl'] }}>

            {/* ── ATIVIDADE (Live Feed) ── */}
            <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm }}>
              {feedSection}
            </View>

            {/* ── POR PERTO (Nearby Reports) ── */}
            <View style={{ paddingHorizontal: Spacing.md, marginTop: Spacing.md }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8,
                paddingVertical: 4, paddingHorizontal: 4,
                borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
              }}>
                <MaterialCommunityIcons name="map-marker-radius" size={13} color={colors.primary} />
                <NeonText variant="caption" color={colors.primary} style={{ fontWeight: '800', fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase' }}>Por Perto</NeonText>
                <View style={{ flex: 1 }} />
                <View style={{ backgroundColor: colors.primary + '15', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 }}>
                  <NeonText variant="caption" color={colors.primary} style={{ fontSize: 8, fontWeight: '700' }}>{nearbyIncidents.length}</NeonText>
                </View>
              </View>
              {nearbyIncidents.map((item, idx) => {
                const catColor = Colors.category[item.category] || '#8A8A9A';
                const sevColor = Colors.severity[item.severity] || '#FFB800';
                const catMeta = getCategoryMeta(item.category);
                const dist = haversineDistance(USER_LOCATION, item.location);
                const distLabel = dist < 1000 ? `${Math.round(dist)}m` : `${(dist / 1000).toFixed(1)}km`;
                const isHovered = hoveredIncidentId === item.id;
                const isSelected = selectedIncident?.id === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => { haptics.light(); selectIncident(item); cancelHoverPreview(); setFocusLocation({ latitude: item.location.latitude, longitude: item.location.longitude, zoom: 16 }); }}
                    // @ts-ignore web-only
                    onMouseEnter={() => { setHoveredIncidentId(item.id); startHoverPreview(item); }}
                    onMouseLeave={() => { setHoveredIncidentId(null); cancelHoverPreview(); }}
                    style={({ pressed }) => ({
                      flexDirection: 'row', alignItems: 'center', gap: 6,
                      flexWrap: hoverPreviewIncident?.id === item.id ? 'wrap' as const : 'nowrap' as const,
                      paddingVertical: 7, paddingHorizontal: 8,
                      borderRadius: 10, marginBottom: 2,
                      backgroundColor: isSelected
                        ? catColor + '1E'
                        : hoverPreviewIncident?.id === item.id ? catColor + '0A'
                        : isHovered ? catColor + '08' : pressed ? catColor + '06' : 'transparent',
                      borderLeftWidth: 3,
                      borderLeftColor: isSelected ? catColor : hoverPreviewIncident?.id === item.id ? catColor : isHovered ? catColor + '60' : 'transparent',
                      ...(Platform.OS === 'web' ? {
                        transition: 'all 0.2s cubic-bezier(0.25,0.8,0.25,1)',
                        cursor: 'pointer',
                        ...(isSelected ? { boxShadow: `0 2px 12px ${catColor}15, inset 0 0 0 1px ${catColor}12` } : {}),
                      } as any : {}),
                    })}
                  >
                    <View style={{
                      width: 28, height: 28, borderRadius: 8,
                      backgroundColor: catColor + '18', borderWidth: 1, borderColor: catColor + '30',
                      justifyContent: 'center', alignItems: 'center', flexShrink: 0,
                    }}>
                      <MaterialCommunityIcons name={catMeta.icon as any} size={14} color={catColor} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <NeonText variant="caption" color={catColor} style={{ fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }} numberOfLines={1}>{catMeta.label}</NeonText>
                        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: sevColor }} />
                        {item.isVerified && <NeonText variant="caption" color={Colors.success} style={{ fontSize: 7, fontWeight: '800' }}>✓</NeonText>}
                      </View>
                      <NeonText variant="caption" numberOfLines={1} style={{ fontSize: 10, lineHeight: 13, marginTop: 1 }}>{item.title}</NeonText>
                    </View>
                    <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                      <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 9, fontWeight: '700' }}>{distLabel}</NeonText>
                      <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 7, marginTop: 1 }}>{timeAgo(item.createdAt)}</NeonText>
                    </View>
                    {/* Inline expanded detail on hover */}
                    {hoverPreviewIncident?.id === item.id && (
                      <View style={{
                        width: '100%', paddingTop: 6, marginTop: 4,
                        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: catColor + '20',
                        ...(Platform.OS === 'web' ? { animation: 'sidebarDetailSlideIn 0.2s ease forwards' } as any : {}),
                      }}>
                        <NeonText variant="caption" color={colors.textSecondary} numberOfLines={2} style={{ fontSize: 10, lineHeight: 14, marginBottom: 4 }}>{item.description}</NeonText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <NeonText variant="caption" color={Colors.success} style={{ fontSize: 9, fontWeight: '700' }}>👍 {item.confirmCount}</NeonText>
                          <NeonText variant="caption" color={Colors.error} style={{ fontSize: 9, fontWeight: '700' }}>👎 {item.denyCount}</NeonText>
                          <NeonText variant="caption" color={Colors.warning} style={{ fontSize: 9, fontWeight: '700' }}>👁 {item.views}</NeonText>
                          <View style={{ flex: 1 }} />
                          <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 8 }}>{item.reporterName}</NeonText>
                        </View>
                      </View>
                    )}
                  </Pressable>
                );
              })}
              {nearbyIncidents.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: Spacing.lg }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.success + '12', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                    <MaterialCommunityIcons name="shield-check" size={24} color={Colors.success} />
                  </View>
                  <NeonText variant="caption" color={Colors.success} style={{ fontWeight: '700', fontSize: 10 }}>Área Segura</NeonText>
                  <NeonText variant="caption" color={colors.textTertiary} style={{ marginTop: 2, textAlign: 'center', fontSize: 9 }}>Nenhum incidente reportado por perto</NeonText>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Branded landing page link */}
          <Pressable
            onPress={() => { if (Platform.OS === 'web' && typeof window !== 'undefined') window.open(LANDING_PAGE_URL, '_blank'); }}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: lightTheme ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
              backgroundColor: pressed ? Colors.primary + '08' : 'transparent',
              ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'background 0.2s ease' } as any : {}),
            })}
            accessibilityLabel="Visitar www.alert.io" accessibilityRole="link"
          >
            <LogoMark size={16} color={Colors.primary} spinning={false} />
            <NeonText variant="caption" color={Colors.primary} style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>www.alert.io</NeonText>
            <MaterialCommunityIcons name="open-in-new" size={12} color={Colors.primary + '80'} />
          </Pressable>
        </View>

        {/* ── Floating Hover Preview Popup ── */}
        <View style={styles.mapArea}>
          <AttentionMap markers={mapMarkers} userLocation={USER_LOCATION} familyMembers={familyMembers}
            onMarkerPress={handleMarkerPress} onMapPress={handleMapPress}
            onMapReady={() => {}} selectedMarkerId={selectedIncident?.id}
            highlightedMarkerId={hoveredIncidentId}
            lightTheme={lightTheme} guardScan={guardScan} navigation={navRoute}
            driveMode={driveMode} speedCameras={speedCameras} focusLocation={focusLocation}
            cameras={publicCameras} onCameraPress={(cam) => setViewingCamera(cam)}
            showCameras={showCameras} onToggleCameras={toggleCameras} />

          {viewingCamera && (
            <CameraViewer
              camera={viewingCamera}
              onClose={() => setViewingCamera(null)}
              onReportIncident={(lat, lng) => {
                setViewingCamera(null);
                setFocusLocation({ latitude: lat, longitude: lng, zoom: 17 });
              }}
            />
          )}

          {!driveMode && (
            <View style={[styles.desktopControls, {
              backgroundColor: lightTheme ? 'rgba(255,255,255,0.75)' : 'rgba(8,8,20,0.6)',
              ...(Platform.OS === 'web' ? { backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' } as any : {}),
            }]}>
              <MapFab icon="plus" color={Colors.warning} label="Reportar" onPress={handleReportPress} />
              <MapFab icon="navigation-variant" color="#00AAFF" label="Navegar" active={navOpen} onPress={() => { haptics.medium(); setNavOpen(!navOpen); setScanOpen(false); }} />
              <MapFab icon="radar" color={colors.primary} label="GuardScan" active={scanOpen} onPress={() => { haptics.medium(); setScanOpen(!scanOpen); setNavOpen(false); }} />
              <MapFab icon="cctv" color="#00BCD4" label={camerasLoading ? 'A carregar...' : `Câmeras (${publicCameras.length})`} active={showCameras} onPress={toggleCameras} />
            </View>
          )}

          {navPanel && <View style={[styles.navPanelPos, driveMode && { zIndex: 30 }]}>{navPanel}</View>}
          {guardScanPanel && <View style={[styles.scanPanelPos, driveMode && { zIndex: 30 }]}>{guardScanPanel}</View>}

          {scanning && (
            <View style={styles.scanLabel}>
              <GlassCard style={styles.scanLabelCard}>
                <MaterialCommunityIcons name="radar" size={14} color={colors.primary} />
                <NeonText variant="caption" color={colors.primary} style={{ marginLeft: 4 }}>A escanear {formatDistance(scanRadius)}...</NeonText>
              </GlassCard>
            </View>
          )}

          {driveHUD}
          {overlayPanel}
        </View>

        {showTutorial && (
          <TutorialOverlay sidebarWidth={sidebarWidth} isDesktop onComplete={completeTutorial} />
        )}
      </View>
    );
  }

  // ── MOBILE LAYOUT ──
  return (
    <View style={[styles.mobileContainer, { backgroundColor: colors.background }]}>
      <AttentionMap markers={mapMarkers} userLocation={USER_LOCATION} familyMembers={familyMembers}
        onMarkerPress={handleMarkerPress} onMapPress={handleMapPress}
        onMapReady={() => {}} selectedMarkerId={selectedIncident?.id}
        highlightedMarkerId={hoveredIncidentId}
        lightTheme={lightTheme} guardScan={guardScan} navigation={navRoute}
        driveMode={driveMode} speedCameras={speedCameras} focusLocation={focusLocation}
        cameras={publicCameras} onCameraPress={(cam) => setViewingCamera(cam)}
        showCameras={showCameras} onToggleCameras={toggleCameras} />

      {viewingCamera && (
        <CameraViewer
          camera={viewingCamera}
          onClose={() => setViewingCamera(null)}
          onReportIncident={(lat, lng) => {
            setViewingCamera(null);
            setFocusLocation({ latitude: lat, longitude: lng, zoom: 17 });
          }}
        />
      )}

      {!driveMode && (
        <View style={[styles.mobileTopBar, {
          backgroundColor: lightTheme ? 'rgba(255,255,255,0.75)' : 'rgba(8,8,20,0.7)',
          ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any : {}),
          flexDirection: 'column', alignItems: 'stretch',
        }]}>
          <View style={[styles.appNameBoxMobile, {
            backgroundColor: lightTheme ? 'rgba(255,255,255,0.6)' : 'rgba(0,255,170,0.04)',
            borderColor: lightTheme ? 'rgba(0,0,0,0.06)' : 'rgba(0,255,170,0.10)',
            shadowColor: Colors.primary,
            alignSelf: 'flex-start',
          }]}>
            <LogoMark size={20} color={Colors.primary} />
            <NeonText variant="h4" glow={colors.primaryGlow} style={{ fontFamily: Platform.OS === 'web' ? "'Courier New', monospace" : 'monospace', letterSpacing: 2, fontWeight: '700' }}>ALERT<NeonText variant="h4" color={Colors.primary} style={{ fontFamily: Platform.OS === 'web' ? "'Courier New', monospace" : 'monospace', fontWeight: '400' }}>.IO</NeonText></NeonText>
          </View>
          <View style={[styles.navButtonRow, { marginTop: 6, gap: isPhone ? 3 : 4 }]}>
            <TopBarIcon icon="link-variant" label="Chain" active={activeOverlay === 'chain'} color="#FF9800" onPress={() => openOverlay('chain')} compact />
            <TopBarIcon icon="account-group" label="Família" active={activeOverlay === 'family'} color={Colors.secondary} onPress={() => openOverlay('family')} compact />
            <TopBarIcon icon="account-circle" label="Perfil" active={activeOverlay === 'profile'} color={Colors.primary} onPress={() => openOverlay('profile')} badge={user?.isGuardian} compact />
            <TopBarIcon icon="steering" label="Condução" active={driveMode} color="#00AAFF" onPress={toggleDriveMode} compact />
            <TopBarIcon icon="web" label="alert.io" active={false} color="#9C27B0" onPress={() => {
              if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.open(LANDING_PAGE_URL, '_blank');
              }
            }} compact />
          </View>
        </View>
      )}

      {!driveMode && (
        <View style={[styles.mobileBottomFabs, {
          backgroundColor: lightTheme ? 'rgba(255,255,255,0.75)' : 'rgba(8,8,20,0.65)',
          ...(Platform.OS === 'web' ? { backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' } as any : {}),
        }]}>
          <MapFab icon="plus" color={Colors.warning} label="Reportar" onPress={handleReportPress} />
          <MapFab icon="navigation-variant" color="#00AAFF" label="Navegar" active={navOpen} onPress={() => { haptics.medium(); setNavOpen(!navOpen); setScanOpen(false); }} />
          <MapFab icon="radar" color={colors.primary} label="Scan" active={scanOpen} onPress={() => { haptics.medium(); setScanOpen(!scanOpen); setNavOpen(false); }} />
          <MapFab icon="cctv" color="#00BCD4" label={camerasLoading ? '...' : `📷${publicCameras.length > 0 ? ' ' + publicCameras.length : ''}`} active={showCameras} onPress={toggleCameras} />
        </View>
      )}

      {navPanel && <View style={[styles.navPanelPosMobile, driveMode && { zIndex: 30, top: 60 }]}>{navPanel}</View>}
      {guardScanPanel && <View style={[styles.scanPanelPosMobile, driveMode && { zIndex: 30, top: 60 }]}>{guardScanPanel}</View>}

      {selectedIncident && (() => {
        const mobCatColor = Colors.category[selectedIncident.category] || '#8A8A9A';
        const mobSevColor = Colors.severity[selectedIncident.severity] || '#FFB800';
        return (
          <View style={[styles.mobileSheet, {
            backgroundColor: lightTheme ? 'rgba(245,247,252,0.97)' : 'rgba(10,10,22,0.96)',
            borderTopColor: mobCatColor + '30',
            borderLeftColor: mobCatColor + '15',
            borderRightColor: mobCatColor + '15',
            ...(Platform.OS === 'web' ? {
              backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
              boxShadow: `0 -8px 32px rgba(0,0,0,0.45), 0 -2px 0 ${mobCatColor}20`,
            } as any : {
              shadowColor: mobSevColor,
              shadowOpacity: 0.25,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: -6 },
              elevation: 24,
            }),
          }]}>
            {/* Severity color accent */}
            <View style={[styles.mobileSheetAccent, { backgroundColor: mobSevColor }]} />
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.mobileSheetScroll}
              contentContainerStyle={{ paddingBottom: Spacing['3xl'] }}
            >
              {incidentDetail}
            </ScrollView>
          </View>
        );
      })()}

      {driveHUD}
      {overlayPanel}

      {showTutorial && (
        <TutorialOverlay sidebarWidth={0} isDesktop={false} onComplete={completeTutorial} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  desktopContainer: { flex: 1, flexDirection: 'row' },
  sidebar: {
    flexShrink: 0,
    borderRightWidth: 1,
    ...(Platform.OS === 'web' ? {
      transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
    } as any : {
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 2, height: 0 },
      elevation: 8,
    }),
  },
  sidebarHeader: { paddingTop: Platform.OS === 'web' ? 20 : 60, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  sidebarDetailWrapper: {
    marginHorizontal: Spacing.md, marginBottom: Spacing.md,
    borderLeftWidth: 3, borderRadius: Radius.lg,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.35s cubic-bezier(0.25,0.8,0.25,1)',
    } as any : {}),
  },
  sidebarDetailAccent: {
    height: 3, width: '100%',
    ...(Platform.OS === 'web' ? { transition: 'background-color 0.3s ease' } as any : {}),
  },
  sidebarDetailAccentGlow: {
    height: '100%', width: '60%', borderRadius: 2,
  },
  sidebarDetail: { padding: Spacing.lg, paddingTop: Spacing.sm },
  sidebarDetailTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sidebarDetailSeverityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1,
  },
  sidebarDetailSeverityDot: {
    width: 7, height: 7, borderRadius: 4,
  },
  sidebarDetailCloseBtn: {
    width: 28, height: 28, borderRadius: 8, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } as any : {}),
  },
  sidebarDetailClose: { alignItems: 'flex-end', marginBottom: Spacing.xs },
  sidebarTabs: {
    flexDirection: 'row', borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
  },
  sidebarTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  sidebarList: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing['4xl'], gap: Spacing.sm },
  mapArea: { flex: 1, position: 'relative' },

  desktopControls: {
    position: 'absolute', top: 16, right: 16,
    flexDirection: 'row', gap: Spacing.sm, zIndex: 10,
    paddingHorizontal: 10, paddingVertical: 10,
    borderRadius: 18, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 20px rgba(0,0,0,0.4)' } as any
      : { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 4 }, elevation: 14 }),
  },
  appNameBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1,
    ...(Platform.OS === 'web'
      ? { transition: 'all 0.3s ease', boxShadow: '0 1px 10px rgba(0,0,0,0.15)' } as any
      : { shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 1 }, elevation: 3 }),
  },
  appNameBoxMobile: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
    ...(Platform.OS === 'web'
      ? { transition: 'all 0.3s ease', boxShadow: '0 1px 8px rgba(0,0,0,0.15)' } as any
      : { shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 1 }, elevation: 3 }),
  },
  navButtonRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 5,
  },

  navPanelPos: { position: 'absolute', top: 76, right: 16, zIndex: 16 },
  navPanelPosMobile: { position: 'absolute', top: Platform.OS === 'ios' ? 100 : 80, left: 10, right: 10, zIndex: 16 },
  navPanel: {
    borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md,
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(14px)', boxShadow: '0 4px 14px rgba(0,0,0,0.3)' } as any
      : { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 14, elevation: 12 }),
    minWidth: 280,
  },
  navSearchRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.sm },
  navSearchInput: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: 10, height: 36,
  },
  navTextInput: {
    flex: 1, fontSize: 13, marginLeft: 6, height: 36,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  navVoiceBtn: {
    width: 36, height: 36, borderRadius: Radius.md, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  navLoading: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  navGoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, borderRadius: Radius.md,
  },
  navActivePanel: {},
  navActiveHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  navStopBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.full, borderWidth: 1,
  },
  navStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: Spacing.sm },
  navStatItem: { alignItems: 'center', flex: 1 },
  navStatDivider: { width: 1, height: 36 },
  navIncidents: { marginTop: Spacing.xs, paddingTop: Spacing.xs, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.06)' },
  navIncidentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2, gap: 8 },

  scanPanelPos: { position: 'absolute', top: 76, right: 16, zIndex: 15 },
  scanPanelPosMobile: { position: 'absolute', top: Platform.OS === 'ios' ? 100 : 80, left: 10, right: 10, zIndex: 15 },
  scanPanel: {
    borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md,
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(12px)', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' } as any
      : { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, elevation: 10 }),
    minWidth: 240,
  },
  scanPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  scanRadiusRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.sm },
  scanRadiusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  scanBtn: {
    paddingVertical: 8, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  scanResults: { marginTop: Spacing.xs, gap: 4 },
  scanResultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  scanLabel: { position: 'absolute', top: 16, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  scanLabelCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: Spacing.md },

  feedSection: { gap: 0 },
  feedItem: { flexDirection: 'row', paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  feedDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, marginRight: Spacing.sm },
  feedBody: { flex: 1 },

  mobileContainer: { flex: 1, position: 'relative' },
  mobileTopBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingTop: Platform.OS === 'ios' ? 54 : Platform.OS === 'android' ? 36 : 12,
    paddingBottom: Spacing.sm, paddingHorizontal: Spacing.sm,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', zIndex: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 16px rgba(0,0,0,0.3)' } as any
      : { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 10 }),
  },
  mobileLeftFabs: { position: 'absolute', bottom: 90, left: 16, gap: Spacing.sm, zIndex: 20 },
  mobileBottomFabs: {
    position: 'absolute', bottom: Platform.OS === 'ios' ? 30 : 16, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm,
    alignSelf: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 18, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    zIndex: 20,
    ...(Platform.OS === 'web'
      ? { width: 'fit-content', marginLeft: 'auto', marginRight: 'auto', maxWidth: '96%', boxShadow: '0 8px 24px rgba(0,0,0,0.45)' } as any
      : { shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 16 }),
  },
  mobileFab: {
    display: 'none',
  },
  mobileSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '68%',
    borderTopLeftRadius: Radius['3xl'], borderTopRightRadius: Radius['3xl'],
    paddingTop: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    zIndex: 18,
    borderWidth: 1, borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 -8px 28px rgba(0,0,0,0.4)', transition: 'border-color 0.3s ease' } as any
      : {}),
  },
  mobileSheetAccent: {
    height: 4, width: '100%', marginBottom: Spacing.xs,
    borderTopLeftRadius: Radius['3xl'], borderTopRightRadius: Radius['3xl'],
  },
  mobileSheetScroll: { paddingHorizontal: Spacing.lg },
  sheetHandle: { width: 48, height: 5, borderRadius: 3, alignSelf: 'center' },
  closeBtn: { position: 'absolute', top: Spacing.md, right: Spacing.lg, padding: Spacing.sm, zIndex: 5 },
  mobileDetailTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: Spacing.sm, marginBottom: Spacing.xs,
  },
  mobileCloseBtn: {
    width: 34, height: 34, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  mobileBadgeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  mobileSeverityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1,
  },
  mobileSeverityDot: {
    width: 8, height: 8, borderRadius: 4,
    shadowOpacity: 0.5, shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },

  detailPanelDesktop: {},
  detailPanelMobile: { paddingBottom: Spacing['3xl'] },
  detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  detailCatIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  detailHeaderText: { flex: 1, marginLeft: Spacing.md },
  detailTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm, flexWrap: 'wrap' },
  detailTitle: { flexShrink: 1 },
  verifiedInline: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary + '10', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, gap: 2,
  },
  detailStats: { flexDirection: 'row', gap: Spacing.xl, marginTop: Spacing.lg, marginBottom: Spacing.lg },
  detailStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailActions: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, minHeight: 48,
    ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease', cursor: 'pointer' } as any : {}),
  },
  detailReporter: { flexDirection: 'row', alignItems: 'center' },

  // Drive Mode HUD
  driveHudContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 25,
  },
  driveTopLeftBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : Platform.OS === 'android' ? 36 : 16,
    left: 16,
    gap: 8, zIndex: 26,
  },
  driveModePill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 22, borderWidth: 1,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } as any
      : { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 }),
  },
  driveDestBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(0,255,170,0.15)',
    maxWidth: 200,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 3px 10px rgba(0,0,0,0.15)' } as any
      : { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 6 }),
  },
  driveTopRightControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : Platform.OS === 'android' ? 36 : 16,
    right: 16,
    gap: 8, zIndex: 26,
  },
  driveAlertArea: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : Platform.OS === 'android' ? 90 : 70,
    left: 0, right: 0,
    alignItems: 'center', zIndex: 26,
    pointerEvents: 'box-none' as const,
  },
  driveAlertBanner: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 16, borderWidth: 1,
    marginBottom: 6, maxWidth: 380,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } as any
      : { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 }),
  },
  driveBottomLeft: {
    position: 'absolute', bottom: 28, left: 20, zIndex: 26,
  },
  driveSpeedLimitSign: {
    width: 60, height: 60, borderRadius: 30, borderWidth: 3.5,
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 12px rgba(255,60,60,0.25)' } as any
      : { shadowColor: '#FF3C3C', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 10 }),
  },
  driveBottomRight: {
    position: 'absolute', bottom: 20, right: 16, zIndex: 26,
    alignItems: 'flex-end',
  },
  driveSpeedGauge: {
    alignItems: 'center',
    paddingHorizontal: 28, paddingVertical: 12,
    borderRadius: 22, borderWidth: 1.5,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 16px rgba(0,0,0,0.25)' } as any
      : { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 12 }),
  },
  driveNavStatsRow: {
    flexDirection: 'row', gap: 6,
    marginBottom: 8,
  },
  driveNavStatCard: {
    alignItems: 'center',
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 12, borderWidth: 1,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' } as any
      : { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 }),
  } as any,
  driveControlBtn: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, paddingHorizontal: 10,
    borderRadius: 16, borderWidth: 1, minWidth: 56,
    ...(Platform.OS === 'web'
      ? { cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)', boxShadow: '0 3px 10px rgba(0,0,0,0.15)' } as any
      : { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 6 }),
  },

  // Overlay for Family / Profile / Chain
  overlayContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30,
    justifyContent: 'center', alignItems: 'center',
  },
  overlayBackdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    } as any : {}),
  },
  overlaySheet: {
    width: '92%', maxWidth: 520, maxHeight: '85%',
    borderRadius: 18, borderWidth: 1,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' } as any
      : { shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 32, shadowOffset: { width: 0, height: 12 }, elevation: 28 }),
  },
  overlaySheetMobile: {
    width: '100%', maxWidth: '100%', maxHeight: '100%',
    borderRadius: 0,
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  overlayHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  overlayCloseBtn: {
    width: 32, height: 32, borderRadius: 8, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } as any : {}),
  },
});
