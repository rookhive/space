import { makePersisted } from '@solid-primitives/storage';
import { createStore } from 'solid-js/store';

type State = {
  camera: string;
  cameraName: string;
  microphone: string;
  microphoneName: string;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isCameraPermissionGranted: boolean;
  isMicrophonePermissionGranted: boolean;
};

const store = makePersisted(
  createStore<State>({
    camera: '',
    cameraName: '',
    microphone: '',
    microphoneName: '',
    isCameraEnabled: true,
    isMicrophoneEnabled: true,
    isCameraPermissionGranted: false,
    isMicrophonePermissionGranted: false,
  }),
  {
    name: 'devices',
    storage: localStorage,
  }
);

const [state, setState] = store;

export const deviceStore = {
  state,
  setState,
  setIsCameraEnabled(isEnabled: boolean) {
    setState('isCameraEnabled', isEnabled);
  },
  setIsMicrophoneEnabled(isEnabled: boolean) {
    setState('isMicrophoneEnabled', isEnabled);
  },

  setIsCameraPermissionGranted(isGranted: boolean) {
    setState('isCameraPermissionGranted', isGranted);
  },
  setIsMicrophonePermissionGranted(isGranted: boolean) {
    setState('isMicrophonePermissionGranted', isGranted);
  },
};
