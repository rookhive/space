import { Button } from '@repo/ui/button';
import { createSignal } from 'solid-js';
import { httpClient } from '~/core/HttpClient';

export function LogoutButton() {
  const [isLoading, setIsLoading] = createSignal(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await httpClient.post('/auth/logout', {
        credentials: 'include',
      });
      const result = await response.json();
      if (result.status === 'success') {
        window.location.reload();
      }
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <Button
      iconId="out"
      class="flex items-center gap-2"
      disabled={isLoading()}
      onClick={handleLogout}
      isLoading={isLoading()}
    >
      Logout
    </Button>
  );
}
