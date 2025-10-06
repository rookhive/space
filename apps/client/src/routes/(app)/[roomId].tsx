import { Title } from '@solidjs/meta';
import { useNavigate, useParams } from '@solidjs/router';
import { createSignal, Match, Show, Switch } from 'solid-js';
import { PreviewScreen } from '~/components/PreviewScreen';
import { VideoRoomScreen } from '~/components/VideoRoomScreen';
import { useUser } from '~/hooks/use-user';
import type { RoomData } from '~/types';

export default function RoomPage() {
  const user = useUser();
  const params = useParams();
  const [isReady, setIsReady] = createSignal(false);
  const [roomData, setRoomData] = createSignal<RoomData>();

  const navigate = useNavigate();

  function handleStart(roomData: RoomData) {
    navigate(`/${roomData.room.roomId}`, { replace: true });
    setRoomData(roomData);
    setIsReady(true);
  }

  return (
    <Show when={!!user()}>
      <Title>
        <Switch>
          <Match when={isReady()}>Room {roomData()?.room.roomId} | SPACE</Match>
          <Match when={params.roomId === 'new'}>Create Room | SPACE</Match>
          <Match when={!!params.roomId}>Join Room | SPACE</Match>
        </Switch>
      </Title>
      <Show when={isReady()} fallback={<PreviewScreen onStart={handleStart} />}>
        <VideoRoomScreen user={user()!} roomData={roomData()!} />
      </Show>
    </Show>
  );
}
