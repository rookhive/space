import type { UserData } from '@repo/typesystem';
import { Button } from '@repo/ui/button';
import { A } from '@solidjs/router';
import { createSignal } from 'solid-js';
import { RoomJoinInput } from './RoomJoinInput';

type Props = {
  user: UserData;
};

export function MainScreen(props: Props) {
  function CreateRoomButton() {
    const [isLoading, setIsLoading] = createSignal(false);
    return (
      <A
        href="/new"
        class={isLoading() ? 'pointer-events-none' : ''}
        onClick={(e) => {
          if (isLoading()) {
            e.preventDefault();
            return;
          }
          setIsLoading(true);
        }}
      >
        <Button class="w-[240px]" iconId="add" variant="pulse" isLoading={isLoading()}>
          Create room
        </Button>
      </A>
    );
  }

  return (
    <div class="flex-col items-center justify-center">
      <div class="mb-6 flex flex-col items-start text-center">
        <span class="text-2xl">Hello,</span>
        <span class="bg-gradient-to-b from-white to-[#cccccc] bg-clip-text font-bold font-heading text-[52px] text-transparent leading-none">
          {props.user.name}
        </span>
      </div>
      <div class="flex items-center justify-center gap-6">
        <CreateRoomButton />
        <RoomJoinInput />
      </div>
    </div>
  );
}
