export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};
export const useRouter = () => router;
export const useSegments = () => [];
export const useLocalSearchParams = () => ({});
export const Stack = { Screen: 'Screen' };
export const Tabs = { Screen: 'Screen' };
export const Link = 'Link';
