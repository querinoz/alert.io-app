export type POIType =
  | 'police_station'
  | 'hospital'
  | 'fire_brigade'
  | 'taxi_stand'
  | 'metro_station'
  | 'pharmacy'
  | 'embassy'
  | 'shelter'
  | 'coast_guard';

export interface POI {
  id: string;
  type: POIType;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export const POI_META: Record<POIType, { emoji: string; label: string; color: string }> = {
  police_station:  { emoji: '🚔', label: 'Police Station', color: '#3B82F6' },
  hospital:        { emoji: '🏥', label: 'Hospital',       color: '#EF4444' },
  fire_brigade:    { emoji: '🚒', label: 'Fire Brigade',   color: '#F97316' },
  taxi_stand:      { emoji: '🚕', label: 'Taxi Stand',     color: '#EAB308' },
  metro_station:   { emoji: '🚇', label: 'Metro Station',  color: '#8B5CF6' },
  pharmacy:        { emoji: '💊', label: 'Pharmacy',       color: '#10B981' },
  embassy:         { emoji: '🏛️', label: 'Embassy',        color: '#6366F1' },
  shelter:         { emoji: '🏠', label: 'Shelter',        color: '#14B8A6' },
  coast_guard:     { emoji: '⚓', label: 'Coast Guard',    color: '#0EA5E9' },
};

export const WORLD_POIS: POI[] = [
  // ─── PORTUGAL (Maia / Porto area — dense) ───
  { id: 'poi-pt-001', type: 'police_station', name: 'PSP Maia', city: 'Maia', country: 'PT', lat: 41.2360, lng: -8.6250 },
  { id: 'poi-pt-002', type: 'police_station', name: 'GNR Maia', city: 'Maia', country: 'PT', lat: 41.2285, lng: -8.6150 },
  { id: 'poi-pt-003', type: 'police_station', name: 'PSP Porto - Bonfim', city: 'Porto', country: 'PT', lat: 41.1510, lng: -8.5950 },
  { id: 'poi-pt-004', type: 'hospital', name: 'Hospital da Maia', city: 'Maia', country: 'PT', lat: 41.2375, lng: -8.6215 },
  { id: 'poi-pt-005', type: 'hospital', name: 'Hospital de São João', city: 'Porto', country: 'PT', lat: 41.1832, lng: -8.6020 },
  { id: 'poi-pt-006', type: 'hospital', name: 'Centro Hospitalar do Porto', city: 'Porto', country: 'PT', lat: 41.1465, lng: -8.6060 },
  { id: 'poi-pt-007', type: 'fire_brigade', name: 'Bombeiros Voluntários da Maia', city: 'Maia', country: 'PT', lat: 41.2520, lng: -8.6200 },
  { id: 'poi-pt-008', type: 'fire_brigade', name: 'Bombeiros Sapadores do Porto', city: 'Porto', country: 'PT', lat: 41.1555, lng: -8.6280 },
  { id: 'poi-pt-009', type: 'taxi_stand', name: 'Taxi Praça Maia', city: 'Maia', country: 'PT', lat: 41.2345, lng: -8.6190 },
  { id: 'poi-pt-010', type: 'taxi_stand', name: 'Taxi Aliados', city: 'Porto', country: 'PT', lat: 41.1486, lng: -8.6107 },
  { id: 'poi-pt-011', type: 'metro_station', name: 'Metro Forum Maia', city: 'Maia', country: 'PT', lat: 41.2335, lng: -8.6195 },
  { id: 'poi-pt-012', type: 'metro_station', name: 'Metro Zona Industrial', city: 'Maia', country: 'PT', lat: 41.2250, lng: -8.6080 },
  { id: 'poi-pt-013', type: 'metro_station', name: 'Metro Trindade', city: 'Porto', country: 'PT', lat: 41.1520, lng: -8.6095 },
  { id: 'poi-pt-014', type: 'pharmacy', name: 'Farmácia Central Maia', city: 'Maia', country: 'PT', lat: 41.2358, lng: -8.6205 },
  { id: 'poi-pt-015', type: 'pharmacy', name: 'Farmácia São Roque', city: 'Porto', country: 'PT', lat: 41.1475, lng: -8.6135 },
  { id: 'poi-pt-016', type: 'shelter', name: 'Centro de Acolhimento da Maia', city: 'Maia', country: 'PT', lat: 41.2300, lng: -8.6260 },

  // ─── SPAIN ───
  { id: 'poi-es-001', type: 'police_station', name: 'Comisaría Policía Nacional', city: 'Madrid', country: 'ES', lat: 40.4215, lng: -3.6880 },
  { id: 'poi-es-002', type: 'hospital', name: 'Hospital La Paz', city: 'Madrid', country: 'ES', lat: 40.4810, lng: -3.6870 },
  { id: 'poi-es-003', type: 'fire_brigade', name: 'Parque de Bomberos Chamartín', city: 'Madrid', country: 'ES', lat: 40.4600, lng: -3.6830 },
  { id: 'poi-es-004', type: 'metro_station', name: 'Sol Metro', city: 'Madrid', country: 'ES', lat: 40.4168, lng: -3.7038 },
  { id: 'poi-es-005', type: 'taxi_stand', name: 'Taxi Puerta del Sol', city: 'Madrid', country: 'ES', lat: 40.4166, lng: -3.7039 },
  { id: 'poi-es-006', type: 'police_station', name: 'Mossos d\'Esquadra Les Corts', city: 'Barcelona', country: 'ES', lat: 41.3855, lng: 2.1340 },
  { id: 'poi-es-007', type: 'hospital', name: 'Hospital Clínic de Barcelona', city: 'Barcelona', country: 'ES', lat: 41.3885, lng: 2.1520 },
  { id: 'poi-es-008', type: 'metro_station', name: 'Passeig de Gràcia Metro', city: 'Barcelona', country: 'ES', lat: 41.3920, lng: 2.1646 },

  // ─── FRANCE ───
  { id: 'poi-fr-001', type: 'police_station', name: 'Commissariat Central Paris', city: 'Paris', country: 'FR', lat: 48.8620, lng: 2.3450 },
  { id: 'poi-fr-002', type: 'hospital', name: 'Hôpital Pitié-Salpêtrière', city: 'Paris', country: 'FR', lat: 48.8378, lng: 2.3658 },
  { id: 'poi-fr-003', type: 'fire_brigade', name: 'Caserne Pompiers Sévigné', city: 'Paris', country: 'FR', lat: 48.8565, lng: 2.3620 },
  { id: 'poi-fr-004', type: 'metro_station', name: 'Châtelet Metro', city: 'Paris', country: 'FR', lat: 48.8584, lng: 2.3476 },
  { id: 'poi-fr-005', type: 'pharmacy', name: 'Pharmacie des Champs-Élysées', city: 'Paris', country: 'FR', lat: 48.8698, lng: 2.3076 },
  { id: 'poi-fr-006', type: 'taxi_stand', name: 'Taxi Gare du Nord', city: 'Paris', country: 'FR', lat: 48.8809, lng: 2.3553 },

  // ─── UNITED KINGDOM ───
  { id: 'poi-gb-001', type: 'police_station', name: 'Met Police Westminster', city: 'London', country: 'GB', lat: 51.5010, lng: -0.1340 },
  { id: 'poi-gb-002', type: 'hospital', name: 'St Thomas\' Hospital', city: 'London', country: 'GB', lat: 51.4987, lng: -0.1175 },
  { id: 'poi-gb-003', type: 'fire_brigade', name: 'London Fire Brigade HQ', city: 'London', country: 'GB', lat: 51.4969, lng: -0.1120 },
  { id: 'poi-gb-004', type: 'metro_station', name: 'Westminster Tube', city: 'London', country: 'GB', lat: 51.5010, lng: -0.1247 },
  { id: 'poi-gb-005', type: 'taxi_stand', name: 'Taxi Rank King\'s Cross', city: 'London', country: 'GB', lat: 51.5320, lng: -0.1240 },

  // ─── GERMANY ───
  { id: 'poi-de-001', type: 'police_station', name: 'Polizei Berlin Mitte', city: 'Berlin', country: 'DE', lat: 52.5200, lng: 13.4050 },
  { id: 'poi-de-002', type: 'hospital', name: 'Charité – Universitätsmedizin', city: 'Berlin', country: 'DE', lat: 52.5255, lng: 13.3785 },
  { id: 'poi-de-003', type: 'fire_brigade', name: 'Feuerwache Mitte', city: 'Berlin', country: 'DE', lat: 52.5190, lng: 13.3980 },
  { id: 'poi-de-004', type: 'metro_station', name: 'Alexanderplatz U-Bahn', city: 'Berlin', country: 'DE', lat: 52.5215, lng: 13.4130 },

  // ─── ITALY ───
  { id: 'poi-it-001', type: 'police_station', name: 'Questura di Roma', city: 'Rome', country: 'IT', lat: 41.8948, lng: 12.5085 },
  { id: 'poi-it-002', type: 'hospital', name: 'Policlinico Umberto I', city: 'Rome', country: 'IT', lat: 41.9050, lng: 12.5105 },
  { id: 'poi-it-003', type: 'fire_brigade', name: 'Vigili del Fuoco Roma', city: 'Rome', country: 'IT', lat: 41.8970, lng: 12.5020 },
  { id: 'poi-it-004', type: 'metro_station', name: 'Metro Termini', city: 'Rome', country: 'IT', lat: 41.9010, lng: 12.5015 },

  // ─── UNITED STATES ───
  { id: 'poi-us-001', type: 'police_station', name: 'NYPD Midtown South', city: 'New York', country: 'US', lat: 40.7490, lng: -73.9930 },
  { id: 'poi-us-002', type: 'hospital', name: 'NYU Langone Hospital', city: 'New York', country: 'US', lat: 40.7424, lng: -73.9740 },
  { id: 'poi-us-003', type: 'fire_brigade', name: 'FDNY Engine 1', city: 'New York', country: 'US', lat: 40.7510, lng: -73.9880 },
  { id: 'poi-us-004', type: 'metro_station', name: 'Times Square Subway', city: 'New York', country: 'US', lat: 40.7580, lng: -73.9855 },
  { id: 'poi-us-005', type: 'taxi_stand', name: 'Taxi Grand Central', city: 'New York', country: 'US', lat: 40.7527, lng: -73.9772 },
  { id: 'poi-us-006', type: 'police_station', name: 'LAPD Hollywood', city: 'Los Angeles', country: 'US', lat: 34.0978, lng: -118.3348 },
  { id: 'poi-us-007', type: 'hospital', name: 'Cedars-Sinai Medical Center', city: 'Los Angeles', country: 'US', lat: 34.0756, lng: -118.3803 },
  { id: 'poi-us-008', type: 'police_station', name: 'Chicago PD 1st District', city: 'Chicago', country: 'US', lat: 41.8760, lng: -87.6298 },
  { id: 'poi-us-009', type: 'hospital', name: 'Rush University Medical Center', city: 'Chicago', country: 'US', lat: 41.8747, lng: -87.6700 },
  { id: 'poi-us-010', type: 'police_station', name: 'Miami PD Downtown', city: 'Miami', country: 'US', lat: 25.7770, lng: -80.1875 },
  { id: 'poi-us-011', type: 'hospital', name: 'Jackson Memorial Hospital', city: 'Miami', country: 'US', lat: 25.7900, lng: -80.2108 },

  // ─── BRAZIL ───
  { id: 'poi-br-001', type: 'police_station', name: 'Delegacia Central SP', city: 'São Paulo', country: 'BR', lat: -23.5489, lng: -46.6388 },
  { id: 'poi-br-002', type: 'hospital', name: 'Hospital das Clínicas', city: 'São Paulo', country: 'BR', lat: -23.5565, lng: -46.6705 },
  { id: 'poi-br-003', type: 'fire_brigade', name: 'Corpo de Bombeiros SP', city: 'São Paulo', country: 'BR', lat: -23.5470, lng: -46.6415 },
  { id: 'poi-br-004', type: 'metro_station', name: 'Metrô Sé', city: 'São Paulo', country: 'BR', lat: -23.5505, lng: -46.6340 },
  { id: 'poi-br-005', type: 'police_station', name: 'Delegacia Copacabana', city: 'Rio de Janeiro', country: 'BR', lat: -22.9650, lng: -43.1785 },
  { id: 'poi-br-006', type: 'hospital', name: 'Hospital Copa D\'Or', city: 'Rio de Janeiro', country: 'BR', lat: -22.9660, lng: -43.1810 },

  // ─── JAPAN ───
  { id: 'poi-jp-001', type: 'police_station', name: 'Shinjuku Police Station', city: 'Tokyo', country: 'JP', lat: 35.6910, lng: 139.7040 },
  { id: 'poi-jp-002', type: 'hospital', name: 'Tokyo Metropolitan Hospital', city: 'Tokyo', country: 'JP', lat: 35.6920, lng: 139.7655 },
  { id: 'poi-jp-003', type: 'fire_brigade', name: 'Tokyo Fire Dept HQ', city: 'Tokyo', country: 'JP', lat: 35.6750, lng: 139.7530 },
  { id: 'poi-jp-004', type: 'metro_station', name: 'Shibuya Station', city: 'Tokyo', country: 'JP', lat: 35.6580, lng: 139.7016 },
  { id: 'poi-jp-005', type: 'taxi_stand', name: 'Taxi Shinjuku Station', city: 'Tokyo', country: 'JP', lat: 35.6895, lng: 139.6998 },

  // ─── AUSTRALIA ───
  { id: 'poi-au-001', type: 'police_station', name: 'NSW Police Sydney City', city: 'Sydney', country: 'AU', lat: -33.8752, lng: 151.2068 },
  { id: 'poi-au-002', type: 'hospital', name: 'Royal Prince Alfred Hospital', city: 'Sydney', country: 'AU', lat: -33.8890, lng: 151.1840 },
  { id: 'poi-au-003', type: 'fire_brigade', name: 'Fire Rescue NSW City', city: 'Sydney', country: 'AU', lat: -33.8780, lng: 151.2070 },
  { id: 'poi-au-004', type: 'metro_station', name: 'Town Hall Station', city: 'Sydney', country: 'AU', lat: -33.8738, lng: 151.2065 },

  // ─── INDIA ───
  { id: 'poi-in-001', type: 'police_station', name: 'Mumbai Police HQ', city: 'Mumbai', country: 'IN', lat: 18.9408, lng: 72.8354 },
  { id: 'poi-in-002', type: 'hospital', name: 'Lilavati Hospital', city: 'Mumbai', country: 'IN', lat: 19.0500, lng: 72.8260 },
  { id: 'poi-in-003', type: 'fire_brigade', name: 'Mumbai Fire Brigade', city: 'Mumbai', country: 'IN', lat: 18.9610, lng: 72.8310 },
  { id: 'poi-in-004', type: 'police_station', name: 'Delhi Police HQ', city: 'Delhi', country: 'IN', lat: 28.6310, lng: 77.2168 },
  { id: 'poi-in-005', type: 'hospital', name: 'AIIMS Delhi', city: 'Delhi', country: 'IN', lat: 28.5672, lng: 77.2100 },
  { id: 'poi-in-006', type: 'metro_station', name: 'Rajiv Chowk Metro', city: 'Delhi', country: 'IN', lat: 28.6328, lng: 77.2197 },

  // ─── SOUTH AFRICA ───
  { id: 'poi-za-001', type: 'police_station', name: 'SAPS Cape Town Central', city: 'Cape Town', country: 'ZA', lat: -33.9256, lng: 18.4232 },
  { id: 'poi-za-002', type: 'hospital', name: 'Groote Schuur Hospital', city: 'Cape Town', country: 'ZA', lat: -33.9420, lng: 18.4630 },
  { id: 'poi-za-003', type: 'police_station', name: 'SAPS Johannesburg Central', city: 'Johannesburg', country: 'ZA', lat: -26.2035, lng: 28.0462 },
  { id: 'poi-za-004', type: 'hospital', name: 'Charlotte Maxeke Hospital', city: 'Johannesburg', country: 'ZA', lat: -26.1750, lng: 28.0480 },

  // ─── CANADA ───
  { id: 'poi-ca-001', type: 'police_station', name: 'Toronto Police 52 Division', city: 'Toronto', country: 'CA', lat: 43.6570, lng: -79.3850 },
  { id: 'poi-ca-002', type: 'hospital', name: 'Toronto General Hospital', city: 'Toronto', country: 'CA', lat: 43.6590, lng: -79.3880 },
  { id: 'poi-ca-003', type: 'metro_station', name: 'Union Station', city: 'Toronto', country: 'CA', lat: 43.6452, lng: -79.3806 },

  // ─── MEXICO ───
  { id: 'poi-mx-001', type: 'police_station', name: 'Policía CDMX Centro', city: 'Mexico City', country: 'MX', lat: 19.4326, lng: -99.1332 },
  { id: 'poi-mx-002', type: 'hospital', name: 'Hospital General de México', city: 'Mexico City', country: 'MX', lat: 19.4215, lng: -99.1520 },
  { id: 'poi-mx-003', type: 'metro_station', name: 'Metro Zócalo', city: 'Mexico City', country: 'MX', lat: 19.4326, lng: -99.1332 },

  // ─── SOUTH KOREA ───
  { id: 'poi-kr-001', type: 'police_station', name: 'Seoul Metropolitan Police', city: 'Seoul', country: 'KR', lat: 37.5758, lng: 126.9758 },
  { id: 'poi-kr-002', type: 'hospital', name: 'Severance Hospital', city: 'Seoul', country: 'KR', lat: 37.5615, lng: 126.9415 },
  { id: 'poi-kr-003', type: 'metro_station', name: 'Gangnam Station', city: 'Seoul', country: 'KR', lat: 37.4979, lng: 127.0276 },

  // ─── EGYPT ───
  { id: 'poi-eg-001', type: 'police_station', name: 'Cairo Police Downtown', city: 'Cairo', country: 'EG', lat: 30.0444, lng: 31.2357 },
  { id: 'poi-eg-002', type: 'hospital', name: 'Kasr Al Ainy Hospital', city: 'Cairo', country: 'EG', lat: 30.0300, lng: 31.2280 },

  // ─── UAE ───
  { id: 'poi-ae-001', type: 'police_station', name: 'Dubai Police HQ', city: 'Dubai', country: 'AE', lat: 25.2630, lng: 55.3078 },
  { id: 'poi-ae-002', type: 'hospital', name: 'Rashid Hospital', city: 'Dubai', country: 'AE', lat: 25.2310, lng: 55.3140 },
  { id: 'poi-ae-003', type: 'taxi_stand', name: 'Taxi Dubai Mall', city: 'Dubai', country: 'AE', lat: 25.1972, lng: 55.2795 },

  // ─── CHINA ───
  { id: 'poi-cn-001', type: 'police_station', name: 'Beijing Public Security Bureau', city: 'Beijing', country: 'CN', lat: 39.9190, lng: 116.4100 },
  { id: 'poi-cn-002', type: 'hospital', name: 'Peking Union Hospital', city: 'Beijing', country: 'CN', lat: 39.9080, lng: 116.4140 },
  { id: 'poi-cn-003', type: 'metro_station', name: 'Tiananmen East Station', city: 'Beijing', country: 'CN', lat: 39.9053, lng: 116.4030 },
  { id: 'poi-cn-004', type: 'police_station', name: 'Shanghai PSB Pudong', city: 'Shanghai', country: 'CN', lat: 31.2315, lng: 121.5060 },
  { id: 'poi-cn-005', type: 'hospital', name: 'Huashan Hospital', city: 'Shanghai', country: 'CN', lat: 31.2180, lng: 121.4450 },

  // ─── ARGENTINA ───
  { id: 'poi-ar-001', type: 'police_station', name: 'Policía Federal Argentina', city: 'Buenos Aires', country: 'AR', lat: -34.6083, lng: -58.3731 },
  { id: 'poi-ar-002', type: 'hospital', name: 'Hospital Italiano', city: 'Buenos Aires', country: 'AR', lat: -34.6140, lng: -58.4000 },
  { id: 'poi-ar-003', type: 'metro_station', name: 'Subte Obelisco', city: 'Buenos Aires', country: 'AR', lat: -34.6037, lng: -58.3816 },

  // ─── TURKEY ───
  { id: 'poi-tr-001', type: 'police_station', name: 'İstanbul Emniyet Müdürlüğü', city: 'Istanbul', country: 'TR', lat: 41.0082, lng: 28.9784 },
  { id: 'poi-tr-002', type: 'hospital', name: 'İstanbul Tıp Fakültesi', city: 'Istanbul', country: 'TR', lat: 41.0100, lng: 28.9400 },
  { id: 'poi-tr-003', type: 'metro_station', name: 'Taksim Metro', city: 'Istanbul', country: 'TR', lat: 41.0370, lng: 28.9850 },

  // ─── NIGERIA ───
  { id: 'poi-ng-001', type: 'police_station', name: 'Lagos State Police Command', city: 'Lagos', country: 'NG', lat: 6.4541, lng: 3.3947 },
  { id: 'poi-ng-002', type: 'hospital', name: 'Lagos University Teaching Hospital', city: 'Lagos', country: 'NG', lat: 6.5180, lng: 3.3680 },

  // ─── THAILAND ───
  { id: 'poi-th-001', type: 'police_station', name: 'Royal Thai Police HQ', city: 'Bangkok', country: 'TH', lat: 13.7563, lng: 100.5018 },
  { id: 'poi-th-002', type: 'hospital', name: 'Bumrungrad Hospital', city: 'Bangkok', country: 'TH', lat: 13.7443, lng: 100.5530 },
  { id: 'poi-th-003', type: 'metro_station', name: 'BTS Siam', city: 'Bangkok', country: 'TH', lat: 13.7455, lng: 100.5341 },

  // ─── RUSSIA ───
  { id: 'poi-ru-001', type: 'police_station', name: 'MVD Moscow City', city: 'Moscow', country: 'RU', lat: 55.7558, lng: 37.6173 },
  { id: 'poi-ru-002', type: 'hospital', name: 'Botkin Hospital', city: 'Moscow', country: 'RU', lat: 55.7868, lng: 37.5762 },
  { id: 'poi-ru-003', type: 'metro_station', name: 'Arbatskaya Metro', city: 'Moscow', country: 'RU', lat: 55.7522, lng: 37.6016 },

  // ─── KENYA ───
  { id: 'poi-ke-001', type: 'police_station', name: 'Central Police Station Nairobi', city: 'Nairobi', country: 'KE', lat: -1.2833, lng: 36.8219 },
  { id: 'poi-ke-002', type: 'hospital', name: 'Kenyatta National Hospital', city: 'Nairobi', country: 'KE', lat: -1.3010, lng: 36.8073 },

  // ─── COLOMBIA ───
  { id: 'poi-co-001', type: 'police_station', name: 'Policía Metropolitana de Bogotá', city: 'Bogotá', country: 'CO', lat: 4.7110, lng: -74.0721 },
  { id: 'poi-co-002', type: 'hospital', name: 'Fundación Santa Fe', city: 'Bogotá', country: 'CO', lat: 4.6965, lng: -74.0340 },

  // ─── MOROCCO ───
  { id: 'poi-ma-001', type: 'police_station', name: 'Sûreté Nationale Casablanca', city: 'Casablanca', country: 'MA', lat: 33.5940, lng: -7.6200 },
  { id: 'poi-ma-002', type: 'hospital', name: 'CHU Ibn Rochd', city: 'Casablanca', country: 'MA', lat: 33.5870, lng: -7.6040 },

  // ─── SINGAPORE ───
  { id: 'poi-sg-001', type: 'police_station', name: 'SPF Tanglin', city: 'Singapore', country: 'SG', lat: 1.3027, lng: 103.8195 },
  { id: 'poi-sg-002', type: 'hospital', name: 'Singapore General Hospital', city: 'Singapore', country: 'SG', lat: 1.2795, lng: 103.8358 },
  { id: 'poi-sg-003', type: 'metro_station', name: 'MRT Orchard', city: 'Singapore', country: 'SG', lat: 1.3043, lng: 103.8318 },

  // ─── NETHERLANDS ───
  { id: 'poi-nl-001', type: 'police_station', name: 'Politie Amsterdam Centrum', city: 'Amsterdam', country: 'NL', lat: 52.3676, lng: 4.9041 },
  { id: 'poi-nl-002', type: 'hospital', name: 'AMC Amsterdam', city: 'Amsterdam', country: 'NL', lat: 52.2937, lng: 4.9580 },
  { id: 'poi-nl-003', type: 'metro_station', name: 'Amsterdam Centraal Metro', city: 'Amsterdam', country: 'NL', lat: 52.3791, lng: 4.9003 },
];
