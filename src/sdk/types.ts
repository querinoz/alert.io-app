import type { GeoPosition, IncidentCategory, IncidentSeverity, ChainMemberType } from '../types';

export interface AttentionConfig {
  apiKey: string;
  projectId?: string;
  environment?: 'development' | 'staging' | 'production';
  theme?: 'dark' | 'light' | 'auto';
  language?: string;
  enableSOS?: boolean;
  enableIncidentAlerts?: boolean;
  enableLocationSharing?: boolean;
  enableChain?: boolean;
  enableDriveMode?: boolean;
  alertRadius?: number;
  sosContacts?: string[];
  geofences?: Geofence[];
  onEvent?: OnEventCallback;
  debug?: boolean;
}

export interface AttentionUser {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string | null;
  phone?: string;
  metadata?: Record<string, any>;
}

export interface Geofence {
  id: string;
  name: string;
  center: GeoPosition;
  radiusMeters: number;
  onEnter?: () => void;
  onExit?: () => void;
}

export type SafetyEventType =
  | 'sos_triggered'
  | 'sos_cancelled'
  | 'incident_nearby'
  | 'incident_reported'
  | 'alert_received'
  | 'geofence_enter'
  | 'geofence_exit'
  | 'location_updated'
  | 'chain_message'
  | 'chain_sos'
  | 'speed_alert'
  | 'radar_alert'
  | 'safety_score_changed'
  | 'sdk_ready'
  | 'sdk_error';

export interface SafetyEvent {
  type: SafetyEventType;
  timestamp: number;
  data: Record<string, any>;
  location?: GeoPosition;
  userId?: string;
}

export interface SOSPayload {
  location: GeoPosition;
  message?: string;
  contacts?: string[];
  chainIds?: string[];
  attachPhoto?: boolean;
}

export interface IncidentPayload {
  category: IncidentCategory;
  severity: IncidentSeverity;
  title: string;
  description?: string;
  location: GeoPosition;
  photoURLs?: string[];
}

export interface LocationPayload {
  location: GeoPosition;
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  timestamp?: number;
}

export interface AlertPayload {
  type: 'geofence_exit' | 'sos' | 'low_battery' | 'offline' | 'speed_alert' | 'custom';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  location?: GeoPosition;
  targetChainIds?: string[];
}

export type OnEventCallback = (event: SafetyEvent) => void;

export interface SafetyButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  color?: string;
  sosHoldDuration?: number;
  onSOSTrigger?: (payload: SOSPayload) => void;
  onPress?: () => void;
  features?: ('sos' | 'report' | 'alerts' | 'chain' | 'location')[];
  style?: any;
}

export interface AttentionProviderProps {
  config: AttentionConfig;
  user?: AttentionUser;
  children: React.ReactNode;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export interface SafetyOverlayProps {
  visible?: boolean;
  onClose?: () => void;
  initialView?: 'map' | 'incidents' | 'chain' | 'alerts';
  fullScreen?: boolean;
  style?: any;
}
