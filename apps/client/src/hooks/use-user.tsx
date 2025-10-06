import type { UserData } from '@repo/typesystem';
import { type Accessor, createContext, useContext } from 'solid-js';

export const UserContext = createContext<Accessor<UserData>>();

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserContext.Provider');
  return context;
}
