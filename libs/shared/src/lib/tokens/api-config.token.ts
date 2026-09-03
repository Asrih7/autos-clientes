import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  apiPaths: {
    login: string;
    autos: string;
  };
  technicalCredentials: {
    usuario: string;
    password?: string;
  };
}

export const API_CONFIG_TOKEN = new InjectionToken<ApiConfig>('API_CONFIG_TOKEN');
