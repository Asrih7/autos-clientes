import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { API_CONFIG_TOKEN } from '@mnv-autos-clientes/shared';

const GOOGLE_MAPS_SCRIPT_SELECTOR = 'script[data-google-maps]';

export interface DireccionGoogleSeleccionada {
	readonly direccion: string;
	readonly numero: string;
	readonly codigoPostal: string;
}

export interface GooglePlacesAutocompleteConnection {
	destroy(): void;
}

@Injectable({ providedIn: 'root' })
export class GooglePlacesAutocompleteService {
	private readonly document = inject(DOCUMENT);
	private readonly config = inject(API_CONFIG_TOKEN, { optional: true });
	private readonly transloco = inject(TranslocoService, { optional: true });
	private googleMapsLoader?: Promise<GooglePlacesLibrary | null>;

	async conectarAutocomplete(
		inputElement: HTMLInputElement,
		onAddressSelected: (direccion: DireccionGoogleSeleccionada) => void
	): Promise<GooglePlacesAutocompleteConnection | null> {
		const places = await this.loadGoogleMaps();
		if (!places) return null;

		const autocomplete = new places.Autocomplete(inputElement, {
			types: ['address'],
			componentRestrictions: { country: 'ES' }
		});
		autocomplete.setFields(['address_component', 'formatted_address', 'name']);
		const listener = autocomplete.addListener('place_changed', () => {
			const direccion = parsePlace(autocomplete.getPlace());
			if (direccion) onAddressSelected(direccion);
		});

		return {
			destroy: () => {
				listener.remove();
				autocomplete.unbindAll();
			}
		};
	}

	private loadGoogleMaps(): Promise<GooglePlacesLibrary | null> {
		this.googleMapsLoader ??= this.loadGoogleMapsInterno().catch(() => null);
		return this.googleMapsLoader;
	}

	private async loadGoogleMapsInterno(): Promise<GooglePlacesLibrary | null> {
		const window = this.document.defaultView;
		if (!window) return null;

		const placesExistente = getGooglePlaces(window);
		if (placesExistente?.Autocomplete) return placesExistente;

		const apiKey = this.config?.googleMapsApiKey?.trim();
		if (!apiKey) return null;

		await this.loadGoogleMapsScript(window, apiKey);
		return getGooglePlaces(window) ?? null;
	}

	private loadGoogleMapsScript(window: Window, apiKey: string): Promise<void> {
		const existingScript = this.document.querySelector<HTMLScriptElement>(GOOGLE_MAPS_SCRIPT_SELECTOR);
		if (existingScript) return waitForGoogleMapsScript(existingScript, window);

		return new Promise((resolve, reject) => {
			const callbackName = `googleMapsCallback_${Math.random().toString(36).slice(2)}`;
			const callbacks = getWindowCallbacks(window);
			const clearCallback = (): void => {
				delete callbacks[callbackName];
			};

			callbacks[callbackName] = () => {
				clearCallback();
				resolve();
			};

			const script = this.document.createElement('script');
			script.src = createGoogleMapsUrl(apiKey, this.transloco?.getActiveLang() || 'es', callbackName);
			script.async = true;
			script.defer = true;
			script.dataset['googleMaps'] = 'true';
			script.addEventListener(
				'error',
				() => {
					clearCallback();
					reject(new Error('No se ha podido cargar Google Maps Places.'));
				},
				{ once: true }
			);
			this.document.head.appendChild(script);
		});
	}
}

interface GooglePlacesLibrary {
	readonly Autocomplete: new (input: HTMLInputElement, options: GoogleAutocompleteOptions) => GoogleAutocomplete;
}

interface GoogleAutocompleteOptions {
	readonly types: readonly string[];
	readonly componentRestrictions: { readonly country: string };
}

interface GoogleAutocomplete {
	setFields(fields: readonly string[]): void;
	addListener(eventName: 'place_changed', callback: () => void): GoogleMapsListener;
	getPlace(): GooglePlaceResult;
	unbindAll(): void;
}

interface GoogleMapsListener {
	remove(): void;
}

interface GooglePlaceResult {
	readonly address_components?: readonly GoogleAddressComponent[];
	readonly formatted_address?: string;
	readonly name?: string;
}

interface GoogleAddressComponent {
	readonly types: readonly string[];
	readonly long_name?: string;
}

interface GoogleMapsGlobal {
	readonly maps?: {
		readonly places?: GooglePlacesLibrary;
	};
}

function getGooglePlaces(window: Window): GooglePlacesLibrary | undefined {
	return (window as Window & { google?: GoogleMapsGlobal }).google?.maps?.places;
}

function getWindowCallbacks(window: Window): Record<string, (() => void) | undefined> {
	return window as unknown as Record<string, (() => void) | undefined>;
}

function waitForGoogleMapsScript(script: HTMLScriptElement, window: Window): Promise<void> {
	if (getGooglePlaces(window)?.Autocomplete) return Promise.resolve();

	return new Promise((resolve, reject) => {
		script.addEventListener('load', () => resolve(), { once: true });
		script.addEventListener('error', () => reject(new Error('No se ha podido cargar Google Maps Places.')), {
			once: true
		});
	});
}

function createGoogleMapsUrl(apiKey: string, language: string, callbackName: string): string {
	const parameters = new URLSearchParams({
		key: apiKey,
		libraries: 'places',
		language,
		callback: callbackName
	});
	return `https://maps.googleapis.com/maps/api/js?${parameters.toString()}`;
}

function parsePlace(place: GooglePlaceResult | undefined): DireccionGoogleSeleccionada | null {
	if (!place || !Array.isArray(place.address_components)) return null;

	const getComponent = (type: string): string =>
		place.address_components?.find((component) => component.types.includes(type))?.long_name ?? '';
	const formattedAddress = String(place.formatted_address ?? place.name ?? '');
	const formattedParts = formattedAddress
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
	let direccion = (getComponent('route') || formattedParts[0] || '').trim();
	const numero =
		getComponent('street_number') ||
		getComponent('subpremise') ||
		getComponent('premise') ||
		getStreetNumberFromText(formattedAddress);

	if (numero) direccion = removeTrailingStreetNumber(direccion, numero);
	return { direccion, numero, codigoPostal: getComponent('postal_code') };
}

function getStreetNumberFromText(value: string): string {
	const candidates = Array.from(value.matchAll(/(?:^|[,\s])(\d+[A-Za-z]?)\b/g))
		.map((match) => match[1])
		.filter((candidate) => !/^\d{5}$/.test(candidate));
	return candidates[0] ?? '';
}

function removeTrailingStreetNumber(direccion: string, numero: string): string {
	const escapedNumber = numero.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return direccion.replace(new RegExp(`(?:,|\\s)+${escapedNumber}$`, 'i'), '').trim();
}
