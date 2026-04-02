# Attention SDK — Integration Guide

> Drop-in **security layer** for any mobile or web application. Add SOS alerts,
> incident monitoring, geofencing, chain messaging, and real-time safety scoring
> to your app in minutes.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [React Native Integration](#react-native-integration)
4. [Web Integration (Script Tag)](#web-integration-script-tag)
5. [Programmatic API](#programmatic-api)
6. [Components](#components)
7. [Configuration](#configuration)
8. [Events & Callbacks](#events--callbacks)
9. [Safety Score](#safety-score)
10. [Geofencing](#geofencing)
11. [Chain System](#chain-system)
12. [Examples](#examples)

---

## Quick Start

### React Native (3 lines)

```tsx
import { AttentionProvider, SafetyButton } from '@attention-app/sdk';

export default function App() {
  return (
    <AttentionProvider
      config={{ apiKey: 'YOUR_API_KEY' }}
      user={{ uid: '123', displayName: 'Alice' }}
    >
      <YourApp />
      <SafetyButton />
    </AttentionProvider>
  );
}
```

### Web (1 line)

```html
<script src="https://cdn.attention-app.com/widget.js" data-api-key="YOUR_API_KEY"></script>
```

---

## Installation

```bash
# npm
npm install @attention-app/sdk

# yarn
yarn add @attention-app/sdk
```

**Peer Dependencies** (React Native apps):
- `react >= 17.0.0`
- `react-native >= 0.70.0` (optional — web-only usage does not require it)
- `expo-location` (optional — for GPS tracking)

---

## React Native Integration

### 1. Wrap with AttentionProvider

The `<AttentionProvider>` initializes the SDK and makes safety features available
to every component in the tree via the `useAttention()` hook.

```tsx
import { AttentionProvider } from '@attention-app/sdk';

function Root() {
  return (
    <AttentionProvider
      config={{
        apiKey: 'YOUR_API_KEY',
        enableSOS: true,
        enableIncidentAlerts: true,
        enableLocationSharing: true,
        enableChain: true,
        enableDriveMode: true,
        alertRadius: 5000, // meters
        debug: true,
      }}
      user={{
        uid: 'user-123',
        displayName: 'Alice Smith',
        email: 'alice@example.com',
      }}
      onReady={() => console.log('Attention SDK ready')}
      onError={(err) => console.error('SDK error:', err)}
    >
      <App />
    </AttentionProvider>
  );
}
```

### 2. Add the Safety Button

```tsx
import { SafetyButton } from '@attention-app/sdk';

function MapScreen() {
  return (
    <View style={{ flex: 1 }}>
      <MyMap />
      <SafetyButton
        position="bottom-right"
        size="medium"
        features={['sos', 'report', 'alerts', 'chain', 'location']}
        sosHoldDuration={2000}
        onSOSTrigger={(payload) => {
          console.log('SOS!', payload);
        }}
      />
    </View>
  );
}
```

### 3. Use the Hook

```tsx
import { useAttention } from '@attention-app/sdk';

function SafetyBanner() {
  const { safetyScore, nearbyIncidents, triggerSOS } = useAttention();

  return (
    <View>
      <Text>Safety Score: {safetyScore?.score}/100 ({safetyScore?.level})</Text>
      <Text>{nearbyIncidents.length} incidents nearby</Text>
      <Button title="SOS" onPress={() => triggerSOS('I need help!')} />
    </View>
  );
}
```

### 4. Add the Safety Overlay (Optional)

```tsx
import { SafetyOverlay } from '@attention-app/sdk';

function App() {
  const [showSafety, setShowSafety] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <MainContent />
      <SafetyOverlay
        visible={showSafety}
        onClose={() => setShowSafety(false)}
        initialView="incidents"
        fullScreen={true}
      />
    </View>
  );
}
```

---

## Web Integration (Script Tag)

Add the Attention safety widget to **any website** with a single script tag:

```html
<script
  src="https://cdn.attention-app.com/widget.js"
  data-api-key="YOUR_API_KEY"
  data-position="bottom-right"
  data-theme="dark"
></script>
```

### Programmatic Web Initialization

```html
<script src="https://cdn.attention-app.com/widget.js"></script>
<script>
  AttentionWidget.init({
    apiKey: 'YOUR_API_KEY',
    position: 'bottom-right',
    theme: 'dark',
    user: { uid: '123', displayName: 'Alice' },
    onSOS: function(location) {
      console.log('SOS triggered at', location);
      // send to your backend, trigger push notifications, etc.
    },
    onEvent: function(event) {
      console.log('Safety event:', event.type, event.data);
    }
  });
</script>
```

### Remove Widget

```javascript
AttentionWidget.destroy();
```

---

## Programmatic API

Use `AttentionAPI` for headless integration (no UI). Works in any
JavaScript/TypeScript environment.

```typescript
import { AttentionAPI } from '@attention-app/sdk';

// Initialize
await AttentionAPI.init({ apiKey: 'YOUR_KEY' });
await AttentionAPI.setUser({ uid: '123', displayName: 'Alice' });

// SOS
const alertId = await AttentionAPI.sos({
  location: { latitude: 41.23, longitude: -8.62 },
  message: 'I need help!',
});

// Report Incident
const incidentId = await AttentionAPI.reportIncident({
  category: 'suspicious',
  severity: 'high',
  title: 'Suspicious activity near park',
  location: { latitude: 41.23, longitude: -8.62 },
});

// Get Nearby Incidents
const incidents = await AttentionAPI.getNearbyIncidents(
  { latitude: 41.23, longitude: -8.62 },
  5 // radius in km
);

// Chain
const chainId = await AttentionAPI.createChain('Family Safety');
await AttentionAPI.sendMessage(chainId, 'Everyone check in!');
await AttentionAPI.sendAlert(chainId, {
  type: 'custom',
  title: 'Stay Alert',
  message: 'Incident reported nearby',
  severity: 'warning',
});

// Location Tracking
AttentionAPI.startTracking(10000); // every 10 seconds
AttentionAPI.stopTracking();

// Safety Score
const score = await AttentionAPI.getSafetyScore();
console.log(`Score: ${score.score}/100 (${score.level})`);

// Events
AttentionAPI.on((event) => {
  if (event.type === 'incident_nearby') {
    showNotification(`${event.data.count} incidents nearby!`);
  }
  if (event.type === 'geofence_exit') {
    sendPushToParent(event.data.geofence.name);
  }
});

// Cleanup
await AttentionAPI.destroy();
```

---

## Components

### `<AttentionProvider>`

| Prop      | Type               | Required | Description                       |
|-----------|--------------------|----------|-----------------------------------|
| config    | `AttentionConfig`  | Yes      | SDK configuration                 |
| user      | `AttentionUser`    | No       | Current authenticated user        |
| children  | `ReactNode`        | Yes      | Your app tree                     |
| onReady   | `() => void`       | No       | Called when SDK is initialized     |
| onError   | `(Error) => void`  | No       | Called on initialization failure   |

### `<SafetyButton>`

| Prop             | Type                         | Default          | Description                     |
|------------------|------------------------------|------------------|---------------------------------|
| position         | `'bottom-right'` etc.        | `'bottom-right'` | Screen position                 |
| size             | `'small'\|'medium'\|'large'` | `'medium'`       | Button size                     |
| showLabel        | `boolean`                    | `false`          | Show "Safety" text label        |
| color            | `string`                     | dark theme       | Custom background color         |
| sosHoldDuration  | `number` (ms)                | `2000`           | Hold duration to trigger SOS    |
| onSOSTrigger     | `(SOSPayload) => void`       | —                | Called when SOS fires           |
| onPress          | `() => void`                 | —                | Override default tap behavior   |
| features         | `string[]`                   | all features     | Which actions to show           |
| style            | `ViewStyle`                  | —                | Additional styles               |

### `<SafetyOverlay>`

| Prop        | Type                              | Default       | Description                      |
|-------------|-----------------------------------|---------------|----------------------------------|
| visible     | `boolean`                         | `false`       | Show/hide the overlay            |
| onClose     | `() => void`                      | —             | Called when user closes overlay   |
| initialView | `'map'\|'incidents'\|'chain'\|'alerts'` | `'incidents'` | Initial tab                   |
| fullScreen  | `boolean`                         | `true`        | Full-screen or bottom sheet      |
| style       | `ViewStyle`                       | —             | Additional styles                |

---

## Configuration

```typescript
interface AttentionConfig {
  apiKey: string;               // Required
  projectId?: string;
  environment?: 'development' | 'staging' | 'production';
  theme?: 'dark' | 'light' | 'auto';
  language?: string;            // e.g. 'en', 'pt', 'es'
  enableSOS?: boolean;          // default: true
  enableIncidentAlerts?: boolean; // default: true
  enableLocationSharing?: boolean; // default: true
  enableChain?: boolean;        // default: true
  enableDriveMode?: boolean;    // default: true
  alertRadius?: number;         // meters, default: 5000
  sosContacts?: string[];       // phone numbers for SOS
  geofences?: Geofence[];       // predefined geofences
  onEvent?: OnEventCallback;    // global event listener
  debug?: boolean;              // enable console logging
}
```

---

## Events & Callbacks

Subscribe to real-time safety events:

```typescript
const unsubscribe = AttentionAPI.on((event) => {
  switch (event.type) {
    case 'sos_triggered':
      // User triggered SOS
      break;
    case 'incident_nearby':
      // New incident detected within alert radius
      // event.data.incidents, event.data.count
      break;
    case 'geofence_enter':
    case 'geofence_exit':
      // User entered/exited a geofence
      // event.data.geofence
      break;
    case 'speed_alert':
      // Speeding detected
      // event.data.speedKmh, event.data.limit
      break;
    case 'radar_alert':
      // Speed camera ahead
      break;
    case 'chain_sos':
      // Someone in your chain triggered SOS
      break;
    case 'safety_score_changed':
      // Safety score updated
      break;
    case 'sdk_ready':
      // SDK initialized successfully
      break;
    case 'sdk_error':
      // An error occurred
      break;
  }
});

// Cleanup
unsubscribe();
```

---

## Safety Score

The safety score (0-100) considers multiple factors:

| Factor     | Weight | Description                           |
|------------|--------|---------------------------------------|
| Incidents  | 50%    | Fewer nearby incidents = higher score |
| Chain      | 30%    | More chain connections = higher score |
| Location   | 20%    | Active location sharing = bonus       |

```typescript
const { score, level, factors } = await AttentionAPI.getSafetyScore();
// score: 0-100
// level: 'safe' (>=80) | 'moderate' (>=50) | 'caution' (<50)
// factors: { incidents: 85, chain: 50, location: 20 }
```

---

## Geofencing

Create virtual boundaries and get alerts when users enter/exit:

```typescript
import { AttentionSDK } from '@attention-app/sdk';

AttentionSDK.addGeofence({
  id: 'home',
  name: 'Home',
  center: { latitude: 41.2356, longitude: -8.6200 },
  radiusMeters: 200,
  onEnter: () => console.log('Arrived home'),
  onExit: () => {
    console.log('Left home zone');
    // Automatically alert parents/chain
  },
});

AttentionSDK.addGeofence({
  id: 'school',
  name: 'School Zone',
  center: { latitude: 41.2380, longitude: -8.6150 },
  radiusMeters: 500,
  onEnter: () => sendNotification('Child arrived at school'),
  onExit: () => sendNotification('Child left school area'),
});
```

---

## Chain System

Connect users, devices, pets, and vehicles:

```typescript
// Create a chain
const chainId = await AttentionAPI.createChain('Family Safety');

// Share the invite code
const chain = await AttentionAPI.getChain(chainId);
console.log('Invite code:', chain.inviteCode); // e.g. "ATN001"

// Join with code
await AttentionAPI.joinChain('ATN001');

// Add tracked members
await AttentionAPI.addChainMember({
  chainId,
  type: 'pet',
  name: 'Rex',
  ownerUid: 'user-123',
  avatar: null,
  locationSharingEnabled: true,
  isOnline: true,
  metadata: { species: 'Dog', breed: 'German Shepherd', trackerModel: 'GPS Collar' },
});

// Send messages
await AttentionAPI.sendMessage(chainId, 'Everyone safe?');

// Send alerts
await AttentionAPI.sendAlert(chainId, {
  type: 'custom',
  title: 'Speed Camera',
  message: 'Speed camera ahead on EN13',
  severity: 'info',
});

// Real-time subscriptions
const unsub = AttentionAPI.subscribeChainMessages(chainId, (messages) => {
  console.log('New messages:', messages);
});
```

---

## Examples

### E-commerce App — Safety Delivery Tracking

```tsx
import { AttentionProvider, SafetyButton, useAttention } from '@attention-app/sdk';

function DeliveryApp() {
  return (
    <AttentionProvider
      config={{
        apiKey: 'ECOM_KEY',
        enableSOS: true,
        enableLocationSharing: true,
        geofences: [{
          id: 'delivery-zone',
          name: 'Delivery Area',
          center: { latitude: 41.23, longitude: -8.62 },
          radiusMeters: 1000,
        }],
      }}
      user={deliveryDriver}
    >
      <DeliveryMap />
      <SafetyButton features={['sos', 'location']} position="bottom-left" />
    </AttentionProvider>
  );
}
```

### Rideshare App — Passenger Safety

```tsx
function RideScreen() {
  const { triggerSOS, safetyScore } = useAttention();

  return (
    <View>
      <Text>Trip Safety: {safetyScore?.level}</Text>
      <Button title="Feel Unsafe" onPress={() => triggerSOS('Passenger alert')} />
    </View>
  );
}
```

### Parental Control — Kid Tracker

```typescript
AttentionSDK.addGeofence({
  id: 'school', name: 'School',
  center: { latitude: 41.238, longitude: -8.615 },
  radiusMeters: 300,
  onExit: () => {
    AttentionAPI.sendAlert('family-chain', {
      type: 'geofence_exit',
      title: 'Left School',
      message: 'Your child left the school area',
      severity: 'warning',
    });
  },
});
```

### WordPress / Shopify — Script Tag

```html
<!-- Add to any page -->
<script
  src="https://cdn.attention-app.com/widget.js"
  data-api-key="YOUR_KEY"
  data-position="bottom-right"
></script>
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              YOUR APPLICATION               │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │       <AttentionProvider>           │    │
│  │                                     │    │
│  │  ┌────────────┐ ┌───────────────┐   │    │
│  │  │ SafetyButton│ │ SafetyOverlay │   │    │
│  │  └──────┬─────┘ └───────┬───────┘   │    │
│  │         │               │           │    │
│  │  ┌──────┴───────────────┴───────┐   │    │
│  │  │       AttentionSDK Core      │   │    │
│  │  │  ┌────┐ ┌─────┐ ┌────────┐  │   │    │
│  │  │  │SOS │ │Alerts│ │Location│  │   │    │
│  │  │  └────┘ └─────┘ └────────┘  │   │    │
│  │  │  ┌─────┐ ┌──────┐ ┌──────┐  │   │    │
│  │  │  │Chain│ │Fences│ │Score │  │   │    │
│  │  │  └─────┘ └──────┘ └──────┘  │   │    │
│  │  └──────────────┬───────────────┘   │    │
│  │                 │                   │    │
│  │  ┌──────────────┴───────────────┐   │    │
│  │  │       AttentionAPI           │   │    │
│  │  │  (Headless / Programmatic)   │   │    │
│  │  └──────────────────────────────┘   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │     Database Layer (Firebase)       │    │
│  │  Users · Incidents · Chains · Logs  │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## License

MIT — Attention App
