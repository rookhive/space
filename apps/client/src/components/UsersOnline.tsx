import { Avatar } from '@repo/ui/avatar';
import { For } from 'solid-js';
import { roomStore } from '~/stores/room-store';

export function UsersOnline() {
  return (
    <div class="flex grow justify-end gap-4 self-stretch overflow-hidden px-5">
      <For each={roomStore.state.users}>
        {(user) => (
          <div class="flex min-w-0 max-w-[200px] shrink grow basis-0 items-center gap-2">
            <Avatar
              size="m"
              color={`#${user.color.toString(16).padStart(6, '0')}`}
              name={user.name}
              url={user.avatarUrl}
            />
            <div class="flex min-w-0 shrink flex-col">
              <span class="truncate text-sm leading-tight">{user.name}</span>
              <span class="truncate font-thin text-sm leading-tight">{user.email}</span>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
