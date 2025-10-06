export function LoginButton() {
  return (
    <form class="inline-flex" action="/api/auth/google/login" method="post">
      <button type="submit" class="cursor-pointer overflow-hidden rounded-full shadow-lg">
        <img src="/google.png" class="h-[44px]" alt="Continue with Google" />
      </button>
    </form>
  );
}
