import { LoginButton } from './LoginButton';
import { Logo } from './Logo';
import { SourceCodeButton } from './SourceCodeButton';

export function WelcomeScreen() {
  return (
    <div class="flex h-screen flex-col items-center justify-center">
      <div class="-ml-4 mb-4">
        <Logo size="large" />
      </div>
      <p class="mt-4">Here you can talk, watch, and.. float around</p>
      <p class="mt-1 mb-8">Don't ask why 🤓</p>
      <div class="flex items-center justify-center space-x-4">
        <LoginButton />
        <SourceCodeButton withDescription />
      </div>
    </div>
  );
}
