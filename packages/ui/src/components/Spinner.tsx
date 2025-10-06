export function Spinner() {
  return (
    <div class="relative flex items-center justify-center">
      <div class="absolute h-7 w-7 animate-spin rounded-full border-2 border-transparent border-t-[var(--color-brand-light)] border-b-[var(--color-brand-light)]" />
      <div class="absolute h-5 w-5 animate-spin rounded-full border-2 border-transparent border-t-white border-b-white [animation-direction:reverse]" />
    </div>
  );
}
