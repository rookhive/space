export function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return Date.now() > payload.exp * 1000;
  } catch {
    return true;
  }
}
