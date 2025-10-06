import { env } from '~/env/client';

class HttpClient {
  #baseUrl: string;
  #refreshTokensUri: string;

  constructor(baseUrl: string, refreshTokensUri: string) {
    this.#baseUrl = baseUrl;
    this.#refreshTokensUri = refreshTokensUri;
  }

  async get(url: string, init?: RequestInit) {
    return this.#fetch(url, {
      method: 'GET',
      ...init,
    });
  }

  async post(url: string, init?: RequestInit) {
    return this.#fetch(url, {
      method: 'POST',
      ...init,
    });
  }

  async refreshTokens() {
    const response = await fetch(`${this.#baseUrl}${this.#refreshTokensUri}`, {
      method: 'POST',
      credentials: 'include',
    });
    const { success } = await response.json();
    return success;
  }

  async #fetch(url: string, init?: RequestInit, isRetry = false): Promise<Response> {
    const response = await fetch(`${this.#baseUrl}${url}`, init);
    if (response.status === 401) {
      if (isRetry) throw new Error(`Failed to fetch ${url}`);
      const areTokensRefreshed = await this.refreshTokens();
      if (areTokensRefreshed) return this.#fetch(url, init, true);
      throw new Error(`Failed to fetch ${url}`);
    }
    return response;
  }
}

export const httpClient = new HttpClient(env.VITE_API_URL, '/auth/refresh');
