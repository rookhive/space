import { useNavigate, useSearchParams } from '@solidjs/router';
import { createEffect, Show } from 'solid-js';
import { Motion } from 'solid-motionone';
import { MainScreen } from '~/components/MainScreen';
import { WelcomeScreen } from '~/components/WelcomeScreen';
import { useUser } from '~/hooks/use-user';

export default function MainPage() {
  const user = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  createEffect(() => {
    if (user() && searchParams.continue) {
      navigate(searchParams.continue as string);
    }
  });

  return (
    <Motion.div
      class="gradient-background flex h-screen w-full flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2 }}
    >
      <Show when={!!user()} fallback={<WelcomeScreen />}>
        <MainScreen user={user()!} />
      </Show>
    </Motion.div>
  );
}
