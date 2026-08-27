# Changelog

## 1.1.1

### Patch Changes

- **core**: Migrate from zone.js to Zoneless change detection using `provideZonelessChangeDetection()`. Remove `zone.js` dependency from `package.json`, update all test setups to use `setupTestBed()` (zoneless by default).

## 1.1.0

### Minor Changes

- **Internationalization**: Add custom langs with transloco ( [#7](https://gitlab.caser.local/arquitectura-interno/helvetia/archit-versioncero-helvetiang/-/merge_requests/7))

### Patch Changes

- **tooling**: Integrate ESLint and Prettier with `eslint-config-prettier`, add lint/format scripts and configure NX defaultBase to `master`

- **core**: Remove custom schema from app.ts ( [#6](https://gitlab.caser.local/arquitectura-interno/helvetia/archit-versioncero-helvetiang/-/merge_requests/6))

- **chore**: add Husky integration with commitlint for conventional commit message validation

- **docs**: update README with Angular 20 and Baloise Design System details ( [#5](https://gitlab.caser.local/arquitectura-interno/helvetia/archit-versioncero-helvetiang/-/merge_requests/5))

## 1.0.0

### Major Changes

- Initial release
