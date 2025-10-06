import type { ChatMessage, User, UserData } from '@repo/typesystem';
import { useNavigate } from '@solidjs/router';
import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { Motion, Presence } from 'solid-motionone';
import { VideoRoomController } from '~/core/VideoRoomController';
import { useDevice } from '~/hooks/use-device';
import { deviceStore } from '~/stores/device-store';
import { roomStore } from '~/stores/room-store';
import type { RoomData } from '~/types';
import { VideoRoomGreeting } from './VideoRoomGreeting';
import { VideoRoomHUD } from './VideoRoomHUD';
import { VideoRoomOverlay } from './VideoRoomOverlay';

type Props = {
  user: UserData;
  roomData: RoomData;
};

export function VideoRoomScreen(props: Props) {
  let containerRef!: HTMLDivElement;
  let roomController: VideoRoomController;

  const navigate = useNavigate();
  const [isReady, setIsReady] = createSignal(false);
  const [isGreetingShown, setIsGreetingShown] = createSignal(true);

  onMount(async () => {
    roomController = new VideoRoomController(
      containerRef,
      {
        user: props.user,
        room: props.roomData.room,
        devices: {
          camera: deviceStore.state.camera,
          microphone: deviceStore.state.microphone,
        },
      },
      {
        onRoomDispose: handleRoomDispose,
        onUserJoin: handleUserJoin,
        onUserLeave: handleUserLeave,
        onChatMessageReceive: handleChatMessageReceive,
        onPointerLockToggle: handlePointerLockToggle,
        onLocalVideoTrackStart: (track) => roomStore.setLocalVideoTrack(track),
        onLocalVideoTrackStop: roomStore.setLocalVideoTrack,
      }
    );
    await roomController.ready();
    setIsReady(true);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
    roomController?.dispose();
    roomStore.dispose();
  });

  useDevice('camera', deviceStore.setIsCameraPermissionGranted);
  useDevice('microphone', deviceStore.setIsMicrophonePermissionGranted);

  createEffect(async () => {
    if (!isReady()) return;
    const { isCameraPermissionGranted, isCameraEnabled } = deviceStore.state;
    isCameraPermissionGranted && isCameraEnabled
      ? (await roomController.startVideoStream()) || deviceStore.setIsCameraEnabled(false)
      : roomController.stopVideoStream();
  });

  createEffect(async () => {
    if (!isReady()) return;
    const { isMicrophonePermissionGranted, isMicrophoneEnabled } = deviceStore.state;
    isMicrophonePermissionGranted && isMicrophoneEnabled
      ? (await roomController.startAudioStream()) || deviceStore.setIsMicrophoneEnabled(false)
      : roomController.stopAudioStream();
  });

  createEffect(() => {
    if (!isGreetingShown()) {
      document.addEventListener('keydown', handleKeyDown);
    }
  });

  function handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Escape':
        if (roomStore.state.isHUDChatInputOpen) {
          hideHUDChatInput();
          return;
        }
        roomStore.state.isOverlayOpen ? hideOverlay() : showOverlay();
        break;
      case 'Enter':
        if (roomStore.state.isOverlayOpen || roomStore.state.isHUDChatInputOpen) return;
        showHUDChatInput();
        break;
    }
  }

  function handleRoomDispose() {
    navigate('/');
  }

  function handleUserJoin(user: User) {
    const timestamp = Date.now();
    roomStore.addUser(user);
    const joinThreshold = 300; // In milliseconds
    const isSessionStart = Math.abs(roomController.joinTimestamp - timestamp) < joinThreshold;
    if (user.id !== props.user.id && isSessionStart) return;
    roomStore.addMessage({
      type: 'system',
      message: `${user.name} has joined the room`,
      timestamp: Date.now(),
    });
  }

  function handleUserLeave(userId: string) {
    const user = roomStore.getUserById(userId);
    if (!user) return;
    roomStore.addMessage({
      type: 'system',
      message: `${user.name} has left the room`,
      timestamp: Date.now(),
    });
    roomStore.removeUser(userId);
  }

  function handlePointerLockToggle(isLocked: boolean) {
    if (isLocked) {
      hideOverlay();
    } else {
      if (roomStore.state.isHUDChatInputOpen || isGreetingShown()) {
        hideHUDChatInput();
        return;
      }
      showOverlay();
    }
  }

  function handlePointerLock() {
    roomController.requestPointerLock();
  }

  function showOverlay() {
    roomStore.setOverlayOpen(true);
    roomController.disposeKeyboardListeners();
  }

  function hideOverlay() {
    roomStore.setOverlayOpen(false);
    roomController.setupKeyboardListeners();
  }

  function showHUDChatInput() {
    roomStore.setHUDChatInputOpen(true);
    roomController.disposeKeyboardListeners();
  }

  function hideHUDChatInput() {
    roomStore.setHUDChatInputOpen(false);
    roomController.setupKeyboardListeners();
  }

  function handleChatMessageSend() {
    const message = roomStore.state.chatMessage;
    if (!message.trim()) return;
    roomController.sendChatMessage(message);
    roomStore.setChatMessage('');
  }

  function handleChatMessageReceive(message: ChatMessage) {
    roomStore.addMessage(message);
  }

  function handleGreetingClose() {
    if (!isReady()) return;
    setIsGreetingShown(false);
    handlePointerLock();
    hideOverlay();
  }

  return (
    <div class="relative h-screen w-full overflow-hidden">
      <div ref={containerRef} class="absolute inset-0" />
      <Show when={roomStore.state.isOverlayOpen}>
        <VideoRoomOverlay
          onLeave={handleRoomDispose}
          onResume={() => {
            handlePointerLock();
            hideOverlay();
          }}
          onChatMessageSend={handleChatMessageSend}
        />
      </Show>
      <Show when={!roomStore.state.isOverlayOpen}>
        <VideoRoomHUD onChatMessageSend={handleChatMessageSend} />
      </Show>
      <Presence>
        {isGreetingShown() && (
          <Motion.div
            class="absolute inset-0 flex select-none items-center justify-center bg-black/15 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isReady() && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <VideoRoomGreeting onClose={handleGreetingClose} />
              </Motion.div>
            )}
          </Motion.div>
        )}
      </Presence>
    </div>
  );
}
