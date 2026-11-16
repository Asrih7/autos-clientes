import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { API_CONFIG_TOKEN } from '@mnv-autos-clientes/shared';
import { GooglePlacesAutocompleteService } from './google-places-autocomplete.service';

describe('GooglePlacesAutocompleteService', () => {
	const originalGoogle = (window as Window & { google?: unknown }).google;

	afterEach(() => {
		document.querySelector('script[data-google-maps]')?.remove();
		if (originalGoogle === undefined) {
			delete (window as Window & { google?: unknown }).google;
		} else {
			(window as Window & { google?: unknown }).google = originalGoogle;
		}
		vi.restoreAllMocks();
	});

	it('falls back to manual entry when no API key is configured', async () => {
		const service = createService('');

		await expect(service.conectarAutocomplete(document.createElement('input'), vi.fn())).resolves.toBeNull();
		expect(document.querySelector('script[data-google-maps]')).toBeNull();
	});

	it('uses the same Spanish address Autocomplete configuration as the reference application', async () => {
		let placeChanged: (() => void) | undefined;
		const remove = vi.fn();
		const unbindAll = vi.fn();
		const setFields = vi.fn();
		const autocomplete = {
			setFields,
			addListener: vi.fn((_eventName: string, callback: () => void) => {
				placeChanged = callback;
				return { remove };
			}),
			getPlace: vi.fn().mockReturnValue({
				address_components: [
					{ types: ['route'], long_name: 'Calle Mayor' },
					{ types: ['street_number'], long_name: '6' }
				],
				formatted_address: 'Calle Mayor, 6, 28013 Madrid, España'
			}),
			unbindAll
		};
		const Autocomplete = vi.fn().mockReturnValue(autocomplete);
		setGooglePlaces(Autocomplete);
		const service = createService('clave-de-prueba');
		const onAddressSelected = vi.fn();
		const input = document.createElement('input');

		const connection = await service.conectarAutocomplete(input, onAddressSelected);
		placeChanged?.();

		expect(Autocomplete).toHaveBeenCalledWith(input, {
			types: ['address'],
			componentRestrictions: { country: 'ES' }
		});
		expect(setFields).toHaveBeenCalledWith(['address_component', 'formatted_address', 'name']);
		expect(onAddressSelected).toHaveBeenCalledWith({ direccion: 'Calle Mayor', numero: '6', codigoPostal: '' });

		connection?.destroy();
		expect(remove).toHaveBeenCalledOnce();
		expect(unbindAll).toHaveBeenCalledOnce();
	});

	it('loads the Google Maps script only once and uses the active language', async () => {
		const Autocomplete = vi.fn().mockReturnValue(createAutocomplete());
		const appendChild = vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
			const script = node as HTMLScriptElement;
			setGooglePlaces(Autocomplete);
			const callbackName = new URL(script.src).searchParams.get('callback');
			queueMicrotask(() => {
				if (callbackName) getWindowCallbacks()[callbackName]?.();
			});
			return node;
		});
		const service = createService('clave-de-prueba');

		await Promise.all([
			service.conectarAutocomplete(document.createElement('input'), vi.fn()),
			service.conectarAutocomplete(document.createElement('input'), vi.fn())
		]);

		expect(appendChild).toHaveBeenCalledOnce();
		const script = document.querySelector<HTMLScriptElement>('script[data-google-maps]');
		expect(script?.src).toContain('libraries=places');
		expect(script?.src).toContain('language=es');
	});

	it('extracts the street number from formatted text when Google omits street_number', async () => {
		let placeChanged: (() => void) | undefined;
		const autocomplete = createAutocomplete({
			address_components: [{ types: ['route'], long_name: 'Avenida de América' }],
			formatted_address: 'Avenida de América, 12, 28028 Madrid, España'
		});
		autocomplete.addListener.mockImplementation((_eventName: string, callback: () => void) => {
			placeChanged = callback;
			return { remove: vi.fn() };
		});
		setGooglePlaces(vi.fn().mockReturnValue(autocomplete));
		const onAddressSelected = vi.fn();

		await createService('clave-de-prueba').conectarAutocomplete(document.createElement('input'), onAddressSelected);
		placeChanged?.();

		expect(onAddressSelected).toHaveBeenCalledWith({ direccion: 'Avenida de América', numero: '12', codigoPostal: '' });
	});

	function createService(googleMapsApiKey: string): GooglePlacesAutocompleteService {
		TestBed.configureTestingModule({
			providers: [
				GooglePlacesAutocompleteService,
				{
					provide: API_CONFIG_TOKEN,
					useValue: {
						googleMapsApiKey,
						apiPaths: { login: '', autos: '' },
						technicalCredentials: { usuario: '' }
					}
				},
				{ provide: TranslocoService, useValue: { getActiveLang: () => 'es' } }
			]
		});
		return TestBed.inject(GooglePlacesAutocompleteService);
	}

	function setGooglePlaces(Autocomplete: ReturnType<typeof vi.fn>): void {
		(window as Window & { google?: unknown }).google = { maps: { places: { Autocomplete } } };
	}

	function createAutocomplete(place: Record<string, unknown> = {}): {
		setFields: ReturnType<typeof vi.fn>;
		addListener: ReturnType<typeof vi.fn>;
		getPlace: ReturnType<typeof vi.fn>;
		unbindAll: ReturnType<typeof vi.fn>;
	} {
		return {
			setFields: vi.fn(),
			addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
			getPlace: vi.fn().mockReturnValue(place),
			unbindAll: vi.fn()
		};
	}

	function getWindowCallbacks(): Record<string, (() => void) | undefined> {
		return window as unknown as Record<string, (() => void) | undefined>;
	}
});
