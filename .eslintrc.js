module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	extends: ['plugin:n8n-nodes-base/community'],
	rules: {
		'n8n-nodes-base/node-filename-against-convention': 'error',
		'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'error',
		'n8n-nodes-base/node-class-description-outputs-wrong': 'error',
		'n8n-nodes-base/node-class-description-name-miscased': 'error',
		'n8n-nodes-base/cred-class-field-name-missing-api': 'error',
		'n8n-nodes-base/cred-class-field-display-name-missing-api': 'error',
		'n8n-nodes-base/cred-class-name-missing-oauth2-suffix': 'error',
		'n8n-nodes-base/node-class-description-missing-subtitle': 'error',
		'n8n-nodes-base/node-param-default-missing': 'error',
		'n8n-nodes-base/node-param-description-missing-final-period': 'error',
		'n8n-nodes-base/node-param-display-name-not-first-position': 'error',
		'n8n-nodes-base/node-param-name-not-second-position': 'error',
	},
};