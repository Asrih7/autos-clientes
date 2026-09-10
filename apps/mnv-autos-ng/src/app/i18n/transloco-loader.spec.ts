import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { TranslocoHttpLoader } from './transloco-loader';

describe('TranslocoHttpLoader', () => {
	let loader: TranslocoHttpLoader;
	let mockHttpClient: { get: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		mockHttpClient = {
			get: vi.fn()
		};

		TestBed.configureTestingModule({
			providers: [TranslocoHttpLoader, { provide: HttpClient, useValue: mockHttpClient }]
		});

		loader = TestBed.inject(TranslocoHttpLoader);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should make a GET request to the Spanish translation file', () => {
		const mockTranslation = { welcome: { title: 'Versión Cero' } };
		mockHttpClient.get.mockReturnValue(of(mockTranslation));

		loader.getTranslation('es').subscribe((result) => {
			expect(result).toEqual(mockTranslation);
		});

		expect(mockHttpClient.get).toHaveBeenCalledWith('./assets/i18n/es.json');
	});

	it('should make a GET request to the English translation file', () => {
		const mockTranslation = { welcome: { title: 'Version Zero' } };
		mockHttpClient.get.mockReturnValue(of(mockTranslation));

		loader.getTranslation('en').subscribe((result) => {
			expect(result).toEqual(mockTranslation);
		});

		expect(mockHttpClient.get).toHaveBeenCalledWith('./assets/i18n/en.json');
	});

	it('should build the correct URL for any language code', () => {
		mockHttpClient.get.mockReturnValue(of({}));

		loader.getTranslation('ca').subscribe();

		expect(mockHttpClient.get).toHaveBeenCalledWith('./assets/i18n/ca.json');
	});
});
