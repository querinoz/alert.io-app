import { create } from 'zustand';
import type { FamilyGroup, FamilyMember } from '../types';
import { MOCK_FAMILY, MOCK_FAMILY_MEMBERS } from '../services/mockData';
import { getSocket } from '../services/socket';

interface FamilyState {
  groups: FamilyGroup[];
  activeGroup: FamilyGroup | null;
  members: FamilyMember[];
  isLoading: boolean;
  loadFamily: () => Promise<void>;
  selectGroup: (group: FamilyGroup | null) => void;
  sendCheckIn: () => void;
}

export const useFamilyStore = create<FamilyState>()((set) => ({
  groups: [],
  activeGroup: null,
  members: [],
  isLoading: false,

  loadFamily: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 400));
    set({
      groups: [MOCK_FAMILY],
      activeGroup: MOCK_FAMILY,
      members: MOCK_FAMILY_MEMBERS,
      isLoading: false,
    });
  },

  selectGroup: (group) => set({ activeGroup: group }),

  sendCheckIn: () => {
    // In production: write a "check-in" message to family chat
  },
}));

let familyWsCleanup: (() => void) | null = null;

export function subscribeFamilyToSocket(): void {
  if (familyWsCleanup) return;
  const socket = getSocket();
  const onLocation = (data: { userId: string; lat: number; lng: number }) => {
    useFamilyStore.setState((state) => ({
      members: state.members.map((m) =>
        m.uid === data.userId ? { ...m, location: { latitude: data.lat, longitude: data.lng } } : m
      ),
    }));
  };
  socket.on('location:update', onLocation);
  familyWsCleanup = () => {
    socket.off('location:update', onLocation);
    familyWsCleanup = null;
  };
}

export function unsubscribeFamilyFromSocket(): void {
  familyWsCleanup?.();
}
