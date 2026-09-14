import { Subject } from 'rxjs';
import { initializeI18n } from './i18n.initialize';

// Mock @baloise/ds-core module to capture the onBalConfigChange callback
let balConfigChangeCallback: ((config: any) => void) | null = null;

vi.mock('@baloise/ds-core', () => ({
	onBalConfigChange: vi.fn((callback: (config: any) => void) => {
		balConfigChangeCallback = callback;
	})
}));

describe('initializeI18n', () => {
	let mockTransloco: {
		getActiveLang: ReturnType<typeof vi.fn>;
		getAvailableLangs: ReturnType<typeof vi.fn>;
		setActiveLang: ReturnType<typeof vi.fn>;
		langChanges$: Subject<string>;
	};

	let mockBalConfig: {
		setLanguage: ReturnType<typeof vi.fn>;
		setAllowedLanguages: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		balConfigChangeCallback = null;

		mockTransloco = {
			getActiveLang: vi.fn().mockReturnValue('es'),
			getAvailableLangs: vi.fn().mockReturnValue(['es', 'en']),
			setActiveLang: vi.fn(),
			langChanges$: new Subject<string>()
		};

		mockBalConfig = {
			setLanguage: vi.fn(),
			setAllowedLanguages: vi.fn()
		};
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Initialization', () => {
		it('should set the active Transloco language on Baloise DS', async () => {
			const init = initializeI18n(mockTransloco as any, mockBalConfig as any);
			await init();

			expect(mockBalConfig.setLanguage).toHaveBeenCalledWith('es');
		});

		it('should set the available Transloco languages on Baloise DS', async () => {
			const init = initializeI18n(mockTransloco as any, mockBalConfig as any);
			await init();

			expect(mockBalConfig.setAllowedLanguages).toHaveBeenCalledWith(['es', 'en']);
		});

		it('should return a resolved Promise', async () => {
			const init = initializeI18n(mockTransloco as any, mockBalConfig as any);
			await expect(init()).resolves.toBeUndefined();
		});
	});

	describe('Baloise DS → Transloco sync (onBalConfigChange)', () => {
		it('should change Transloco language when Baloise DS switches to an available language', async () => {
			mockTransloco.getActiveLang.mockReturnValue('es');
			const init = initializeI18n(mockTransloco as any, mockBalConfig as any);
			await init();

			// Simulate user clicking 'en' in the Baloise DS footer
			balConfigChangeCallback?.({ language: 'en' });

			expect(mockTransloco.setActiveLang).toHaveBeenCalledWith('en');
		});

		it('should NOT change Transloco language when Baloise DS proposes an unavailable language (e.g. "de")', async () => {
			const init = initializeI18n(mockTransloco as any, mockBalConfig as any);
			await init();

			// Simulate Baloise DS initializing with 'de' (default for CH region)
			balConfigChangeCallback?.({ language: 'de' });

			expect(mockTransloco.setActiveLang).not.toHaveBeenCalled();
		});

		it('should NOT change language if Transloco already has that language active', async () => {
			mockTransloco.getActiveLang.mockReturnValue('es');
			const init = initializeI18n(mockTransloco as any, mockBalConfig as any);
			await init();

			// Baloise DS notifies 'es' but it is already active in Transloco
			balConfigChangeCallback?.({ language: 'es' });

			expect(mockTransloco.setActiveLang).not.toHaveBeenCalled();
		});
	});

	describe('Transloco → Baloise DS sync (langChanges$)', () => {
		it('should update Baloise DS language when Transloco changes language', async () => {
			const init = initializeI18n(mockTransloco as any, mockBalConfig as any);
			await init();

			// Simulate Transloco switching to 'en'
			mockTransloco.langChanges$.next('en');

			expect(mockBalConfig.setLanguage).toHaveBeenCalledWith('en');
		});

		it('should sync any available language to Baloise DS', async () => {
			const init = initializeI18n(mockTransloco as any, mockBalConfig as any);
			await init();

			mockTransloco.langChanges$.next('es');

			expect(mockBalConfig.setLanguage).toHaveBeenCalledWith('es');
		});
	});
});
