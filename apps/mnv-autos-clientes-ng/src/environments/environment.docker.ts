export const environment = {
	production: false,
	sso: {
		url: 'https://ssointe.caser.local/auth/',
		realm: 'integration',
		clientId: 'front-desktop'
	},
	versionTag: 'DOCKER',
	test: 'test-environment',
	configFile: 'assets/config/config.json',
	apiPaths: {
		login: '/mnv-seguridad-sb/auth/login',
		autos: '/mnv-autos-sb/autos'
	},
	technicalCredentials: {
		usuario: 'AC_ASIST_PYMES',
		password: 'Entra2026**'
	}
};
