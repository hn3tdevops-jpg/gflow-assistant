import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

const USER_KEY = 'gflow:studio:user';

function createUserId() {
  return `user-${crypto.randomUUID()}`;
}

export function useCurrentUser() {
  const [userId, setUserId] = useLocalStorage<string>(USER_KEY, '');

  const resolvedUserId = useMemo(() => {
    if (userId.trim()) return userId;
    const created = createUserId();
    setUserId(created);
    return created;
  }, [setUserId, userId]);

  return { userId: resolvedUserId };
}
