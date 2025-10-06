import { Title } from '@solidjs/meta';
import { createAsync, type RouteSectionProps, useParams } from '@solidjs/router';
import { Show } from 'solid-js';
import { Logo } from '~/components/Logo';
import { LogoutButton } from '~/components/LogoutButton';
import { SourceCodeButton } from '~/components/SourceCodeButton';
import { UserContext } from '~/hooks/use-user';
import { getAuthorizedUser } from '~/lib/auth/get-authorized-user';

export default function AppLayout(props: RouteSectionProps) {
  const user = createAsync(() => getAuthorizedUser(), { deferStream: true });
  const params = useParams();

  return (
    <UserContext.Provider value={() => user()!}>
      <Title>SPACE</Title>
      <div class="flex h-screen w-full flex-col">
        <header class="pointer-events-none fixed top-0 right-0 left-0 z-2 flex h-[82px] w-full items-center p-4">
          <Logo />
          <Show when={user() && (!params.roomId || params.roomId === 'new')}>
            <div class="pointer-events-auto ml-auto flex items-center gap-5">
              <SourceCodeButton />
              <LogoutButton />
            </div>
          </Show>
        </header>
        <main class="flex w-full grow">{props.children}</main>
      </div>
    </UserContext.Provider>
  );
}
