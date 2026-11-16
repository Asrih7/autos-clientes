import { BalConfigService } from '@baloise/ds-angular';
import { BalConfigState, BalLanguage, onBalConfigChange } from '@baloise/ds-core';
import { TranslocoService } from '@jsverse/transloco';

export function initializeI18n(transloco: TranslocoService, balConfig: BalConfigService) {
	return (): Promise<void> => {
		const activeLanguage = transloco.getActiveLang() as BalLanguage;
		const allowedLanguages = transloco.getAvailableLangs() as BalLanguage[];

		balConfig.setLanguage(activeLanguage);
		balConfig.setAllowedLanguages(allowedLanguages);

		onBalConfigChange((config: BalConfigState) => {
			const available = transloco.getAvailableLangs() as string[];
			if (transloco.getActiveLang() !== config.language && available.includes(config.language)) {
				transloco.setActiveLang(config.language);
			}
		});

		transloco.langChanges$.subscribe((value) => {
			balConfig.setLanguage(value as BalLanguage);
		});

		return Promise.resolve();
	};
}
