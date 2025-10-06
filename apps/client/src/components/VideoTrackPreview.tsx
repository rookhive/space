import clsx from 'clsx';
import { createEffect, onCleanup } from 'solid-js';

type Props = {
  track?: MediaStreamTrack;
};

export function VideoTrackPreview(props: Props) {
  let videoRef!: HTMLVideoElement;

  createEffect(() => {
    if (!props.track || props.track.kind !== 'video') {
      handleCleanup();
      return;
    }
    videoRef.srcObject = new MediaStream([props.track]);
    videoRef.playsInline = true;
    videoRef.muted = true;
    videoRef.play();
  });

  onCleanup(handleCleanup);

  function handleCleanup() {
    videoRef.pause();
    videoRef.srcObject = null;
  }

  return (
    <>
      {!props.track && <span class="font-thin text-sm">Camera is disabled</span>}
      <video ref={videoRef} class={clsx('h-full w-full object-cover', !props.track && 'hidden')} />
    </>
  );
}
