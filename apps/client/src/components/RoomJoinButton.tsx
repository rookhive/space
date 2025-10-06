import type { VideoRoomState } from '@repo/colyseus-schema';
import { VIDEO_ROOM_NAME } from '@repo/constants';
import type { RoomJoinOptions } from '@repo/typesystem';
import { Button } from '@repo/ui/button';
import { useParams } from '@solidjs/router';
import type { Room } from 'colyseus.js';
import { createSignal } from 'solid-js';
import { colyseusClient } from '~/core/ColyseusClient';
import { preferencesStore } from '~/stores/preferences-store';

type Props = {
  isRoomCreating: boolean;
  onRoomCreated: (room: Room<VideoRoomState>) => void;
};

export function RoomJoinButton(props: Props) {
  const params = useParams();
  const [error, setError] = createSignal<string>();
  const [isLoading, setIsLoading] = createSignal(false);
  const [preferences] = preferencesStore;

  function handleCreateRoom() {
    return colyseusClient.createRoom<VideoRoomState, RoomJoinOptions>(VIDEO_ROOM_NAME, {
      userColor: preferences.color,
    });
  }

  function handleJoinRoom() {
    return colyseusClient.joinRoom<VideoRoomState, RoomJoinOptions>(params.roomId, {
      userColor: preferences.color,
    });
  }

  async function handleClick() {
    try {
      setError();
      setIsLoading(true);
      const room = await (props.isRoomCreating ? handleCreateRoom() : handleJoinRoom());
      props.onRoomCreated(room);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Something went wrong..');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div class="relative">
      {error() && (
        <div class="absolute right-0 bottom-[60px] max-w-full break-words text-[var(--color-brand-light)] first-letter:capitalize">
          {error()}
        </div>
      )}
      <Button
        type="button"
        class="w-[220px]"
        iconId={props.isRoomCreating ? 'right' : 'in'}
        iconPosition="end"
        variant="pulse"
        isLoading={isLoading()}
        onClick={handleClick}
      >
        {props.isRoomCreating ? 'Create room' : 'Join room'}
      </Button>
    </div>
  );
}
