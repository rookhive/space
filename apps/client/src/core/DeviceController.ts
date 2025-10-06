import type { DeviceID, RoomDevices } from '~/types';

export class DeviceController {
  #camera: DeviceID = 'default';
  #microphone: DeviceID = 'default';
  #videoTrack?: MediaStreamTrack;
  #audioTrack?: MediaStreamTrack;
  #isCameraEnabled = true;
  #isMicrophoneEnabled = true;

  dispose() {
    this.stopVideoTrack();
    this.stopAudioTrack();
  }

  get camera() {
    return this.#camera;
  }

  get microphone() {
    return this.#microphone;
  }

  get isCameraEnabled() {
    return this.#isCameraEnabled;
  }

  get isMicrophoneEnabled() {
    return this.#isMicrophoneEnabled;
  }

  get videoTrack() {
    return this.#videoTrack;
  }

  get audioTrack() {
    return this.#audioTrack;
  }

  setCamera(cameraId: DeviceID) {
    this.#camera = cameraId;
  }

  setMicrophone(microphoneId: DeviceID) {
    this.#microphone = microphoneId;
  }

  setDevices(devices: RoomDevices) {
    this.setCamera(devices.camera);
    this.setMicrophone(devices.microphone);
  }

  async startVideoTrack() {
    try {
      this.#isCameraEnabled = true;
      const selectedCamera = this.#camera;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera,
        },
      });
      if (selectedCamera !== this.#camera || !this.#isCameraEnabled) return;
      const [videoTrack] = stream.getVideoTracks();
      this.setVideoTrack(videoTrack);
      return videoTrack;
    } catch {
      this.stopVideoTrack();
    }
  }

  async startAudioTrack() {
    try {
      this.#isMicrophoneEnabled = true;
      const selectedMicrophone = this.#microphone;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedMicrophone,
        },
      });
      if (selectedMicrophone !== this.#microphone || !this.#isMicrophoneEnabled) return;
      const [audioTrack] = stream.getAudioTracks();
      this.setAudioTrack(audioTrack);
      return audioTrack;
    } catch {
      this.stopAudioTrack();
    }
  }

  setVideoTrack(track: MediaStreamTrack) {
    this.#videoTrack = track;
  }

  setAudioTrack(track: MediaStreamTrack) {
    this.#audioTrack = track;
  }

  stopVideoTrack() {
    this.#videoTrack?.stop();
    this.#videoTrack = undefined;
    this.#isCameraEnabled = false;
  }

  stopAudioTrack() {
    this.#audioTrack?.stop();
    this.#audioTrack = undefined;
    this.#isMicrophoneEnabled = false;
  }
}
