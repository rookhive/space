import { Input } from '@repo/ui/input';
import { useNavigate } from '@solidjs/router';
import { createSignal } from 'solid-js';

export function RoomJoinInput() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = createSignal('');

  function handleChange(value: string) {
    setRoomId(value);
  }

  function handleSubmit() {
    navigate(`/${roomId()}`);
  }

  function handleValidate(value: string) {
    return /^([a-z0-9_-]{0,9})$/gi.test(value);
  }

  return (
    <div class="w-[240px]">
      <Input
        iconId="in"
        value={roomId()}
        placeholder="Enter room ID"
        onChange={handleChange}
        onSubmit={handleSubmit}
        onValidate={handleValidate}
      />
    </div>
  );
}
