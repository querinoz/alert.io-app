import type { Badge } from '../types';

export const BADGES: Badge[] = [
  // Tier 0 — Newcomer
  { badgeId: '0', level: 0, name: 'Observador Iniciante', nameEN: 'Beginner observer', icon: '👀', minReputation: 0, maxReputation: 49, dailyReportLimit: 5, color: '#6B7280', glowColor: '#374151', perks: ['basic_map', 'create_reports'] },
  // Tier 1 — Awakened
  { badgeId: '1', level: 1, name: 'Vigia Desperto', nameEN: 'Awakened watcher', icon: '👁️‍🗨️', minReputation: 50, maxReputation: 99, dailyReportLimit: 5, color: '#9CA3AF', glowColor: '#4B5563', perks: ['confirm_deny'] },
  // Tier 2 — Scout
  { badgeId: '2', level: 2, name: 'Batedor Novato', nameEN: 'Rookie scout', icon: '🧭', minReputation: 100, maxReputation: 199, dailyReportLimit: 5, color: '#60A5FA', glowColor: '#2563EB', perks: ['comments'] },
  // Tier 3 — Reporter
  { badgeId: '3', level: 3, name: 'Repórter de Rua', nameEN: 'Street reporter', icon: '📰', minReputation: 200, maxReputation: 349, dailyReportLimit: 8, color: '#34D399', glowColor: '#059669', perks: ['photos', '8_reports'] },
  // Tier 4 — Observer
  { badgeId: '4', level: 4, name: 'Olheiro do Bairro', nameEN: 'Neighborhood lookout', icon: '🏘️', minReputation: 350, maxReputation: 499, dailyReportLimit: 8, color: '#A78BFA', glowColor: '#7C3AED', perks: ['view_profiles'] },
  // Tier 5 — Patroller
  { badgeId: '5', level: 5, name: 'Ronda Noturna', nameEN: 'Night patrol', icon: '🔦', minReputation: 500, maxReputation: 749, dailyReportLimit: 8, color: '#F59E0B', glowColor: '#D97706', perks: ['comments', 'public_profile'] },
  // Tier 6 — Informant
  { badgeId: '6', level: 6, name: 'Vigia de Sinais', nameEN: 'Signal watcher', icon: '📡', minReputation: 750, maxReputation: 999, dailyReportLimit: 12, color: '#10B981', glowColor: '#047857', perks: ['wider_radius'] },
  // Tier 7 — Watchman
  { badgeId: '7', level: 7, name: 'Guarda da Torre', nameEN: 'Tower guard', icon: '🗼', minReputation: 1000, maxReputation: 1499, dailyReportLimit: 12, color: '#3B82F6', glowColor: '#1D4ED8', perks: ['follow_users', 'feed'] },
  // Tier 8 — Sentinel
  { badgeId: '8', level: 8, name: 'Sentinela de Ferro', nameEN: 'Iron sentinel', icon: '🔩', minReputation: 1500, maxReputation: 1999, dailyReportLimit: 12, color: '#8B5CF6', glowColor: '#6D28D9', perks: ['12_reports'] },
  // Tier 9 — Street Guardian
  { badgeId: '9', level: 9, name: 'Intendente de Rua', nameEN: 'Street warden', icon: '🚧', minReputation: 2000, maxReputation: 2999, dailyReportLimit: 12, color: '#EC4899', glowColor: '#BE185D', perks: ['guardscan_3km'] },
  // Tier 10 — Watcher
  { badgeId: '10', level: 10, name: 'Vigia da Cidade', nameEN: 'City watchman', icon: '🌆', minReputation: 3000, maxReputation: 3999, dailyReportLimit: 12, color: '#14B8A6', glowColor: '#0D9488', perks: ['leaderboard'] },
  // Tier 11 — Enforcer
  { badgeId: '11', level: 11, name: 'Defensor da Lei', nameEN: 'Law enforcer', icon: '👮', minReputation: 4000, maxReputation: 4999, dailyReportLimit: 18, color: '#F97316', glowColor: '#EA580C', perks: ['18_reports'] },
  // Tier 12 — Agent
  { badgeId: '12', level: 12, name: 'Agente de Campo', nameEN: 'Field agent', icon: '🕵️', minReputation: 5000, maxReputation: 6499, dailyReportLimit: 18, color: '#06B6D4', glowColor: '#0891B2', perks: ['community_alerts'] },
  // Tier 13 — Vigilante
  { badgeId: '13', level: 13, name: 'Falcão Vigilante', nameEN: 'Vigilant hawk', icon: '🦅', minReputation: 6500, maxReputation: 7999, dailyReportLimit: 18, color: '#84CC16', glowColor: '#65A30D', perks: ['highlighted_markers'] },
  // Tier 14 — Fortress
  { badgeId: '14', level: 14, name: 'Protetor do Distrito', nameEN: 'District protector', icon: '🏛️', minReputation: 8000, maxReputation: 9999, dailyReportLimit: 18, color: '#EAB308', glowColor: '#CA8A04', perks: ['guardscan_4km'] },
  // Tier 15 — Blade
  { badgeId: '15', level: 15, name: 'Porta-Escudo', nameEN: 'Shield bearer', icon: '🛡️', minReputation: 10000, maxReputation: 12499, dailyReportLimit: 18, color: '#EF4444', glowColor: '#DC2626', perks: ['auto_boost_feed'] },
  // Tier 16 — Strategist
  { badgeId: '16', level: 16, name: 'Observador Tático', nameEN: 'Tactical observer', icon: '🎯', minReputation: 12500, maxReputation: 14999, dailyReportLimit: 25, color: '#8B5CF6', glowColor: '#7C3AED', perks: ['25_reports', 'area_analytics'] },
  // Tier 17 — Commander
  { badgeId: '17', level: 17, name: 'Comandante de Zona', nameEN: 'Zone commander', icon: '📯', minReputation: 15000, maxReputation: 17999, dailyReportLimit: 25, color: '#0EA5E9', glowColor: '#0284C7', perks: ['heatmap'] },
  // Tier 18 — Oracle
  { badgeId: '18', level: 18, name: 'Oráculo da Segurança', nameEN: 'Security oracle', icon: '🔮', minReputation: 18000, maxReputation: 21999, dailyReportLimit: 25, color: '#22D3EE', glowColor: '#06B6D4', perks: ['route_safety'] },
  // Tier 19 — Diamond
  { badgeId: '19', level: 19, name: 'Vigia de Elite', nameEN: 'Elite watcher', icon: '🔭', minReputation: 22000, maxReputation: 25999, dailyReportLimit: 25, color: '#A855F7', glowColor: '#9333EA', perks: ['priority_weight'] },
  // Tier 20 — Titan
  { badgeId: '20', level: 20, name: 'Guardião de Ouro', nameEN: 'Gold guardian', icon: '🥇', minReputation: 26000, maxReputation: 30999, dailyReportLimit: 25, color: '#FBBF24', glowColor: '#F59E0B', perks: ['guardscan_5km'] },
  // Tier 21 — Star
  { badgeId: '21', level: 21, name: 'Sentinela Estelar', nameEN: 'Star sentinel', icon: '⭐', minReputation: 31000, maxReputation: 35999, dailyReportLimit: 35, color: '#FCD34D', glowColor: '#FBBF24', perks: ['35_reports', 'mentor_badge'] },
  // Tier 22 — Phoenix
  { badgeId: '22', level: 22, name: 'Protetor Supremo', nameEN: 'Supreme protector', icon: '🦾', minReputation: 36000, maxReputation: 41999, dailyReportLimit: 35, color: '#FB923C', glowColor: '#F97316', perks: ['mentor_users'] },
  // Tier 23 — Crown
  { badgeId: '23', level: 23, name: 'Guardião da Coroa', nameEN: 'Crown warden', icon: '👑', minReputation: 42000, maxReputation: 49999, dailyReportLimit: 35, color: '#F472B6', glowColor: '#EC4899', perks: ['pinned_reports_8h'] },
  // Tier 24 — Warlord
  { badgeId: '24', level: 24, name: 'Chefe da Vigília', nameEN: 'Chief of watch', icon: '📜', minReputation: 50000, maxReputation: 57999, dailyReportLimit: 35, color: '#E879F9', glowColor: '#D946EF', perks: ['area_push_notifs'] },
  // Tier 25 — Legend
  { badgeId: '25', level: 25, name: 'Guardião Lendário', nameEN: 'Legendary guardian', icon: '🌟', minReputation: 58000, maxReputation: 65999, dailyReportLimit: 35, color: '#C084FC', glowColor: '#A855F7', perks: ['custom_marker'] },
  // Tier 26 — Mythic Shield
  { badgeId: '26', level: 26, name: 'Escudo Mítico', nameEN: 'Mythic shield', icon: '🧱', minReputation: 66000, maxReputation: 74999, dailyReportLimit: 50, color: '#818CF8', glowColor: '#6366F1', perks: ['50_reports'] },
  // Tier 27 — Thunderbolt
  { badgeId: '27', level: 27, name: 'Guardião do Trovão', nameEN: 'Thunder guardian', icon: '⚡', minReputation: 75000, maxReputation: 84999, dailyReportLimit: 50, color: '#38BDF8', glowColor: '#0EA5E9', perks: ['animated_badge'] },
  // Tier 28 — Inferno
  { badgeId: '28', level: 28, name: 'Sentinela Eterna', nameEN: 'Eternal sentinel', icon: '🕰️', minReputation: 85000, maxReputation: 92999, dailyReportLimit: 50, color: '#FB7185', glowColor: '#F43F5E', perks: ['custom_alert_sound'] },
  // Tier 29 — Cosmic
  { badgeId: '29', level: 29, name: 'Vigia Ômega', nameEN: 'Omega watcher', icon: '⭕', minReputation: 93000, maxReputation: 99999, dailyReportLimit: 50, color: '#FACC15', glowColor: '#EAB308', perks: ['all_standard_perks'] },
  // Tier 30 — Master
  { badgeId: '30', level: 30, name: 'Guardião Grão-Mestre', nameEN: 'Grand master guardian', icon: '🏆', minReputation: 100000, maxReputation: 199999, dailyReportLimit: 50, color: '#FFD700', glowColor: '#FFA500', perks: ['elite_marker', 'all_features', 'max_standard_level'] },
  // Tier 31 — Guardian (Max)
  { badgeId: 'guardian', level: 31, name: 'Guardião Supremo', nameEN: 'Supreme guardian', icon: '🔐', minReputation: 200000, maxReputation: null, dailyReportLimit: -1, color: '#00FFAA', glowColor: '#00FF88', perks: ['verify_incidents', 'review_reports', 'remove_incidents', 'moderation_dashboard', 'unlimited_reports', 'instant_verification', 'animated_guardian_badge', 'area_statistics'] },
];

export function getBadgeForLevel(level: number): Badge {
  return BADGES.find((b) => b.level === level) ?? BADGES[0];
}

export function getBadgeForReputation(reputation: number): Badge {
  if (reputation >= 200000) return BADGES[BADGES.length - 1];
  for (let i = BADGES.length - 2; i >= 0; i--) {
    if (reputation >= BADGES[i].minReputation) return BADGES[i];
  }
  return BADGES[0];
}

export function getProgressToNextLevel(reputation: number, currentBadge: Badge): number {
  if (currentBadge.maxReputation === null) return 1;
  const range = currentBadge.maxReputation - currentBadge.minReputation + 1;
  const progress = reputation - currentBadge.minReputation;
  return Math.min(progress / range, 1);
}
