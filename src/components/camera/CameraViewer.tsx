import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, ActivityIndicator, useWindowDimensions } from 'react-native';
import type { PublicCamera } from '../../types';
import { Colors } from '../../theme/colors';

interface CameraViewerProps {
  camera: PublicCamera;
  onClose: () => void;
  onReportIncident?: (lat: number, lng: number) => void;
}

const TYPE_META: Record<string, { label: string; color: string; icon: string }> = {
  traffic: { label: 'Trânsito', color: '#FF9800', icon: '🚦' },
  urban: { label: 'Urbana', color: '#00AAFF', icon: '🏙️' },
  coastal: { label: 'Costeira', color: '#00BCD4', icon: '🌊' },
  nature: { label: 'Natureza', color: '#4CAF50', icon: '🌿' },
  other: { label: 'Outra', color: '#9E9E9E', icon: '📷' },
};

function toEmbedUrl(url: string): string {
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&mute=1`;

  const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
  if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=1&mute=1`;

  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&mute=1`;

  if (url.includes('youtube.com/embed/') && !url.includes('autoplay')) {
    return url + (url.includes('?') ? '&' : '?') + 'autoplay=1&mute=1';
  }

  return url;
}

function isImageStream(url: string): boolean {
  return (
    url.endsWith('.jpg') ||
    url.endsWith('.jpeg') ||
    url.endsWith('.png') ||
    url.endsWith('.gif') ||
    url.includes('snapshot') ||
    url.includes('mjpg') ||
    url.includes('cgi-bin') ||
    url.includes('imgurl') ||
    url.includes('.php')
  );
}

function isYouTube(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function isHLS(url: string): boolean {
  return url.includes('.m3u8');
}

export function CameraViewer({ camera, onClose, onReportIncident }: CameraViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { width: winW, height: winH } = useWindowDimensions();
  const isMobile = winW < 600;

  const meta = TYPE_META[camera.type] || TYPE_META.other;
  const embedUrl = toEmbedUrl(camera.streamUrl);
  const imageMode = isImageStream(camera.streamUrl);
  const ytMode = isYouTube(camera.streamUrl);
  const hlsMode = isHLS(camera.streamUrl);

  useEffect(() => {
    if (imageMode) {
      refreshTimer.current = setInterval(() => {
        setImageKey((k) => k + 1);
      }, 5000);
    }
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [imageMode]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 6000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const handleReport = useCallback(() => {
    if (onReportIncident) onReportIncident(camera.lat, camera.lng);
  }, [camera, onReportIncident]);

  const openExternal = useCallback(() => {
    if (typeof window !== 'undefined') {
      const externalUrl = ytMode
        ? camera.streamUrl.replace('/embed/', '/watch?v=').split('?')[0]
        : camera.streamUrl;
      window.open(externalUrl, '_blank');
    }
  }, [camera.streamUrl, ytMode]);

  const streamHeight = fullscreen
    ? winH - 100
    : isMobile
      ? Math.min(winH * 0.45, 300)
      : Math.min(winH * 0.55, 480);

  if (Platform.OS !== 'web') {
    return (
      <View style={s.overlay}>
        <View style={[s.modal, { width: '94%' }]}>
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{meta.icon} {camera.name}</Text>
              <Text style={s.subtitle}>{camera.country} · {meta.label}</Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </Pressable>
          </View>
          <View style={[s.streamContainer, { height: 200 }]}>
            <Text style={s.nativeMsg}>
              Câmeras ao vivo requerem a versão web.{'\n'}
              Abra em localhost:8081 no seu navegador.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={s.overlay}>
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={[
        s.modal,
        fullscreen && s.modalFullscreen,
        isMobile && !fullscreen && s.modalMobile,
      ]}>
        {/* Header */}
        <View style={[s.header, isMobile && { padding: 12 }]}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={[s.title, isMobile && { fontSize: 13 }]} numberOfLines={1}>{meta.icon} {camera.name}</Text>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '1px 6px', borderRadius: 8,
                background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)',
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%', backgroundColor: '#FF3B30',
                  boxShadow: '0 0 6px #FF3B30',
                  animation: 'cam-live-pulse 1.5s ease-in-out infinite',
                } as any} />
                <span style={{ color: '#FF3B30', fontSize: 8, fontWeight: 800, letterSpacing: 1 }}>LIVE</span>
              </div>
            </View>
            <View style={[s.metaRow, { marginTop: 4 }]}>
              <View style={[s.typeBadge, { backgroundColor: meta.color + '22', borderColor: meta.color + '44' }]}>
                <Text style={[s.typeBadgeText, { color: meta.color }]}>{meta.label}</Text>
              </View>
              <Text style={s.subtitle}>{camera.country}</Text>
              <Text style={s.qualityText}>
                {camera.quality === 'high' ? '🟢 HD' : camera.quality === 'low' ? '🔴 SD' : '🟡 Std'}
              </Text>
              {(camera as any).source && (
                <Text style={{ color: '#555', fontSize: 9 }}>{(camera as any).source}</Text>
              )}
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Pressable onPress={() => setFullscreen(!fullscreen)} style={[s.closeBtn, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <Text style={s.closeBtnText}>{fullscreen ? '⊖' : '⊕'}</Text>
            </Pressable>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </Pressable>
          </View>
        </View>

        {/* Stream */}
        <View style={[s.streamContainer, { height: streamHeight }]}>
          {loading && !error && (
            <View style={s.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={s.loadingText}>Conectando à câmera...</Text>
              <Text style={{ color: '#555', fontSize: 10, marginTop: 4 }}>
                {ytMode ? 'YouTube Live' : imageMode ? 'Imagem MJPG' : hlsMode ? 'Stream HLS' : 'iframe'}
              </Text>
            </View>
          )}
          {error && (
            <View style={s.loadingOverlay}>
              <Text style={{ fontSize: 40 }}>📷</Text>
              <Text style={s.errorText}>Stream indisponível</Text>
              <Text style={s.errorSub}>A câmera pode estar offline ou bloqueada.</Text>
              <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 8, marginTop: 14, alignItems: 'stretch' }}>
                <Pressable style={s.retryBtn} onPress={() => { setError(false); setLoading(true); setImageKey((k) => k + 1); }}>
                  <Text style={s.retryBtnText}>↻ Tentar Novamente</Text>
                </Pressable>
                <Pressable style={[s.retryBtn, { backgroundColor: 'rgba(0,255,136,0.12)', borderColor: 'rgba(0,255,136,0.3)' }]} onPress={openExternal}>
                  <Text style={[s.retryBtnText, { color: Colors.primary }]}>↗ Abrir no Navegador</Text>
                </Pressable>
              </View>
            </View>
          )}
          {imageMode ? (
            <img
              key={imageKey}
              src={camera.streamUrl + (camera.streamUrl.includes('?') ? '&' : '?') + `_t=${imageKey}`}
              alt={camera.name}
              style={{
                width: '100%', height: '100%', objectFit: 'contain',
                display: error ? 'none' : 'block', background: '#000',
              }}
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setError(true); }}
            />
          ) : (
            <iframe
              src={embedUrl}
              title={camera.name}
              style={{
                width: '100%', height: '100%', border: 'none',
                display: error ? 'none' : 'block',
              }}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
              allowFullScreen
              referrerPolicy="no-referrer"
              onLoad={() => { setLoading(false); setError(false); }}
              onError={() => { setLoading(false); setError(true); }}
            />
          )}
          <style>{`@keyframes cam-live-pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }`}</style>

          {/* Image refresh indicator for MJPG streams */}
          {imageMode && !error && !loading && (
            <div style={{
              position: 'absolute', bottom: 8, right: 8,
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 6,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
              fontSize: 9, color: '#8A8A9A', fontFamily: "'Courier New', monospace",
            } as any}>
              <span style={{ color: Colors.primary }}>●</span> Auto-refresh 5s
            </div>
          )}
        </View>

        {/* Footer */}
        <View style={[s.footer, isMobile && { padding: 10 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
            <Text style={s.coordText}>📍 {camera.lat.toFixed(4)}, {camera.lng.toFixed(4)}</Text>
            {ytMode && <Text style={{ color: '#FF0000', fontSize: 9, fontWeight: '700' }}>▶ YouTube Live</Text>}
            {imageMode && <Text style={{ color: '#4CAF50', fontSize: 9, fontWeight: '700' }}>📸 MJPG</Text>}
          </View>
          <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 6 }}>
            {onReportIncident && (
              <Pressable style={[s.reportBtn, !isMobile && { flex: 1 }]} onPress={handleReport}>
                <Text style={s.reportBtnText}>🚨 Reportar Incidente</Text>
              </Pressable>
            )}
            <Pressable style={[s.externalBtn, !isMobile && { flex: 1 }]} onPress={openExternal}>
              <Text style={s.externalBtnText}>↗ Abrir em Nova Aba</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute' as any,
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute' as any,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(4px)' } as any : {}),
  },
  modal: {
    width: '92%',
    maxWidth: 780,
    maxHeight: '92%',
    backgroundColor: 'rgba(10,10,22,0.97)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    zIndex: 1,
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(20px)',
      boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
    } as any : {}),
  },
  modalMobile: {
    width: '96%',
    maxWidth: 480,
    borderRadius: 14,
  },
  modalFullscreen: {
    width: '98%',
    maxWidth: 1200,
    maxHeight: '96%',
    borderRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  subtitle: {
    color: '#8A8A9A',
    fontSize: 11,
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qualityText: {
    color: '#8A8A9A',
    fontSize: 10,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'background 0.2s ease' } as any : {}),
  },
  closeBtnText: {
    color: '#8A8A9A',
    fontSize: 14,
    fontWeight: '600',
  },
  streamContainer: {
    width: '100%',
    backgroundColor: '#000',
    position: 'relative' as any,
  },
  loadingOverlay: {
    position: 'absolute' as any,
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 2,
  },
  loadingText: {
    color: '#8A8A9A',
    fontSize: 11,
    marginTop: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  errorSub: {
    color: '#8A8A9A',
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: 'rgba(0,170,255,0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,170,255,0.3)',
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#00AAFF',
    fontSize: 11,
    fontWeight: '700',
  },
  nativeMsg: {
    color: '#8A8A9A',
    fontSize: 13,
    textAlign: 'center',
    padding: 32,
    lineHeight: 20,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  coordText: {
    color: '#8A8A9A',
    fontSize: 10,
    fontFamily: Platform.OS === 'web' ? "'Courier New', monospace" : 'monospace',
  },
  reportBtn: {
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: 'rgba(255,68,68,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.22)',
    alignItems: 'center',
  },
  reportBtnText: {
    color: '#FF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  externalBtn: {
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: 'rgba(0,170,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,170,255,0.18)',
    alignItems: 'center',
  },
  externalBtnText: {
    color: '#00AAFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
