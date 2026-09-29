import { InjectionToken } from '@angular/core';

export interface ApiConfig {
	/** Clave pública de Maps JavaScript API, restringida por HTTP referrer en Google Cloud. */
	googleMapsApiKey?: string;
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
