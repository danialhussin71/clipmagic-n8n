import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ClipMagicApi implements ICredentialType {
	name = 'clipMagicApi';
	displayName = 'ClipMagic API';
	documentationUrl = 'https://clipmagic.pro/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'The API key for ClipMagic API',
			required: true,
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.clipmagic.pro',
			description: 'Base URL for the ClipMagic API',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Api-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/convert',
			method: 'GET',
			qs: {
				url: 'https://www.w3schools.com/html/mov_bbb.mp4',
				output_format: 'mp3',
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'error',
					value: 'Invalid API key',
					message: 'Invalid API key provided',
				},
			},
		],
	};
}