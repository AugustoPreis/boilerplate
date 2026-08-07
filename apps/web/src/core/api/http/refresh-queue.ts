import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { getAuthHandlers } from './auth-handlers';

interface IRetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

function refreshOnce(): Promise<boolean> {
  const authHandlers = getAuthHandlers();

  if (!authHandlers) {
    return Promise.resolve(false);
  }

  if (!refreshPromise) {
    refreshPromise = authHandlers.refresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function handleUnauthorized(
  error: AxiosError,
  retryRequest: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>,
): Promise<AxiosResponse> {
  const config = error.config as IRetryableConfig | undefined;

  if (error.response?.status !== 401 || !config || config._retried) {
    throw error;
  }

  config._retried = true;

  const refreshed = await refreshOnce();

  if (!refreshed) {
    getAuthHandlers()?.onSessionExpired();
    throw error;
  }

  return retryRequest(config);
}
