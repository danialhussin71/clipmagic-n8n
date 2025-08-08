
import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

export class ClipMagic implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Clipmagic Api',
		name: 'clipMagic',
		icon: 'file:clipmagic.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with ClipMagic API for video and audio processing',
		defaults: {
			name: 'ClipMagic',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'clipMagicApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				description: 'Extra settings for the request',
				default: {},
				options: [
					{
						displayName: 'Timeout (ms)',
						name: 'timeout',
						type: 'number',
						default: 600000,
						description: 'How long to wait before aborting the HTTP call. Set to 0 for no limit.',
					},
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Convert Media',
						value: 'convert',
						description: 'Convert video/audio to different formats',
						action: 'Convert media',
					},
					{
						name: 'Trim Media',
						value: 'trim',
						description: 'Trim segments from video/audio',
						action: 'Trim media',
					},
					{
						name: 'Compress Video',
						value: 'compress',
						description: 'Compress video to reduce file size',
						action: 'Compress video',
					},
					{
						name: 'Burn Captions',
						value: 'burnCaptions',
						description: 'Burn subtitles into video',
						action: 'Burn captions',
					},
					{
						name: 'Remove Silence',
						value: 'remove_silence',
						description: 'Detect and remove silent sections from video/audio',
						action: 'Remove silence from media',
					},
					{
						name: 'Stitch Videos',
						value: 'stitch',
						description: 'Stitch multiple videos sequentially',
						action: 'Stitch multiple videos',
					},
					{
						name: 'Generate AI Clips',
						value: 'generateClips',
						description: 'Generate AI clips with karaoke subtitles',
						action: 'Generate AI clips',
					},
					{
						name: 'Split Screen',
						value: 'splitScreen',
						description: 'Creates a split-screen video from two media sources',
						action: 'Create split-screen video',
					},
				],
				default: 'convert',
			},

			// Convert Media Parameters
			{
				displayName: 'Media URL',
				name: 'url',
				type: 'string',
				required: true,
				default: '',
				description: 'Direct file URL or Google Drive share link',
				displayOptions: {
					show: {
						operation: ['convert'],
					},
				},
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{ name: 'MP3', value: 'mp3' },
					{ name: 'WAV', value: 'wav' },
					{ name: 'AAC', value: 'aac' },
					{ name: 'MP4', value: 'mp4' },
					{ name: 'MOV', value: 'mov' },
				],
				default: 'mp3',
				description: 'Target container format',
				displayOptions: {
					show: {
						operation: ['convert'],
					},
				},
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				options: [
					{ name: 'Original', value: '' },
					{ name: '360p', value: '360p' },
					{ name: '480p', value: '480p' },
					{ name: '720p', value: '720p' },
					{ name: '1080p', value: '1080p' },
				],
				default: '',
				description: 'Scale video to specific height (ignored for audio)',
				displayOptions: {
					show: {
						operation: ['convert'],
					},
				},
			},
			{
				displayName: 'Bitrate (kbps)',
				name: 'bitrateKbps',
				type: 'number',
				default: 0,
				description: 'Target video bitrate in kbps (max 3000, 0 for automatic)',
				displayOptions: {
					show: {
						operation: ['convert'],
					},
				},
			},

			// Trim Media Parameters
			{
				displayName: 'Media URL',
				name: 'url',
				type: 'string',
				required: true,
				default: '',
				description: 'Input media URL to trim',
				displayOptions: {
					show: {
						operation: ['trim'],
					},
				},
			},
			{
				displayName: 'Trim Mode',
				name: 'trimMode',
				type: 'options',
				options: [
					{ name: 'Single Segment', value: 'single' },
					{ name: 'Multiple Segments', value: 'multiple' },
				],
				default: 'single',
				displayOptions: {
					show: {
						operation: ['trim'],
					},
				},
			},
			{
				displayName: 'Start Time',
				name: 'start',
				type: 'string',
				default: '00:00:00',
				description: 'Start time in HH:MM:SS format or seconds',
				displayOptions: {
					show: {
						operation: ['trim'],
						trimMode: ['single'],
					},
				},
			},
			{
				displayName: 'End Mode',
				name: 'endMode',
				type: 'options',
				options: [
					{ name: 'End Time', value: 'end' },
					{ name: 'Duration', value: 'duration' },
				],
				default: 'duration',
				displayOptions: {
					show: {
						operation: ['trim'],
						trimMode: ['single'],
					},
				},
			},
			{
				displayName: 'End Time',
				name: 'end',
				type: 'string',
				default: '00:00:10',
				description: 'End time in HH:MM:SS format',
				displayOptions: {
					show: {
						operation: ['trim'],
						trimMode: ['single'],
						endMode: ['end'],
					},
				},
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'string',
				default: '10',
				description: 'Duration in seconds or HH:MM:SS format',
				displayOptions: {
					show: {
						operation: ['trim'],
						trimMode: ['single'],
						endMode: ['duration'],
					},
				},
			},
			{
				displayName: 'Segments',
				name: 'segments',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Multiple segments to trim',
				displayOptions: {
					show: {
						operation: ['trim'],
						trimMode: ['multiple'],
					},
				},
				options: [
					{
						name: 'segment',
						displayName: 'Segment',
						values: [
							{
								displayName: 'Start',
								name: 'start',
								type: 'string',
								default: '00:00:00',
								description: 'Start time in HH:MM:SS format or seconds',
							},
							{
								displayName: 'End Mode',
								name: 'endMode',
								type: 'options',
								options: [
									{ name: 'End Time', value: 'end' },
									{ name: 'Duration', value: 'duration' },
								],
								default: 'duration',
							},
							{
								displayName: 'End Time',
								name: 'end',
								type: 'string',
								default: '00:00:10',
								description: 'End time in HH:MM:SS format',
								displayOptions: {
									show: {
										endMode: ['end'],
									},
								},
							},
							{
								displayName: 'Duration',
								name: 'duration',
								type: 'string',
								default: '10',
								description: 'Duration in seconds or HH:MM:SS format',
								displayOptions: {
									show: {
										endMode: ['duration'],
									},
								},
							},
						],
					},
				],
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{ name: 'MP4', value: 'mp4' },
					{ name: 'GIF', value: 'gif' },
					{ name: 'MOV', value: 'mov' },
					{ name: 'MP3', value: 'mp3' },
					{ name: 'WAV', value: 'wav' },
				],
				default: 'mp4',
				description: 'Target format for trimmed clips',
				displayOptions: {
					show: {
						operation: ['trim'],
					},
				},
			},
			{
				displayName: 'Output Filename',
				name: 'outputFilename',
				type: 'string',
				default: '',
				description: 'Custom filename for the output (optional)',
				displayOptions: {
					show: {
						operation: ['trim'],
					},
				},
			},

			// Compress Video Parameters
			{
				displayName: 'Video URL',
				name: 'url',
				type: 'string',
				required: true,
				default: '',
				description: 'URL of the input video',
				displayOptions: {
					show: {
						operation: ['compress'],
					},
				},
			},
			{
				displayName: 'Preset',
				name: 'preset',
				type: 'options',
				options: [
					{ name: 'Ultra Fast', value: 'ultrafast' },
					{ name: 'Super Fast', value: 'superfast' },
					{ name: 'Very Fast', value: 'veryfast' },
					{ name: 'Faster', value: 'faster' },
					{ name: 'Fast', value: 'fast' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'Slow', value: 'slow' },
					{ name: 'Slower', value: 'slower' },
					{ name: 'Very Slow', value: 'veryslow' },
					{ name: 'Placebo', value: 'placebo' },
				],
				default: 'medium',
				description: 'Encoding speed preset',
				displayOptions: {
					show: {
						operation: ['compress'],
					},
				},
			},
			{
				displayName: 'CRF (Quality)',
				name: 'crf',
				type: 'number',
				default: 23,
				description: 'Constant Rate Factor (18=nearly lossless, 23=default, 28=low quality)',
				displayOptions: {
					show: {
						operation: ['compress'],
					},
				},
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{ name: 'MP4', value: 'mp4' },
					{ name: 'MOV', value: 'mov' },
					{ name: 'AVI', value: 'avi' },
				],
				default: 'mp4',
				description: 'Output container format',
				displayOptions: {
					show: {
						operation: ['compress'],
					},
				},
			},

			// Burn Captions Parameters
			{
				displayName: 'Video URL',
				name: 'url',
				type: 'string',
				required: true,
				default: '',
				description: 'URL of the input video',
				displayOptions: {
					show: {
						operation: ['burnCaptions'],
					},
				},
			},
			{
				displayName: 'Subtitle URL',
				name: 'subtitleUrl',
				type: 'string',
				required: true,
				default: '',
				description: 'URL of the .srt or .ass subtitle file',
				displayOptions: {
					show: {
						operation: ['burnCaptions'],
					},
				},
			},
			{
				displayName: 'Font Size',
				name: 'fontSize',
				type: 'number',
				default: 24,
				description: 'Font size in pixels',
				displayOptions: {
					show: {
						operation: ['burnCaptions'],
					},
				},
			},
			{
				displayName: 'Font Color',
				name: 'fontColor',
				type: 'color',
				default: '#FFFFFF',
				description: 'Primary color of the subtitle text',
				displayOptions: {
					show: {
						operation: ['burnCaptions'],
					},
				},
			},
			{
				displayName: 'Font Name',
				name: 'fontName',
				type: 'string',
				default: '',
				description: 'Font name (system font or URL to font file)',
				displayOptions: {
					show: {
						operation: ['burnCaptions'],
					},
				},
			},
			{
				displayName: 'Outline Width',
				name: 'outline',
				type: 'number',
				default: 0,
				description: 'Width of text outline (0 for no outline)',
				displayOptions: {
					show: {
						operation: ['burnCaptions'],
					},
				},
			},
			{
				displayName: 'Boxed Subtitles',
				name: 'boxed',
				type: 'boolean',
				default: false,
				description: 'Whether subtitles should have a background box',
				displayOptions: {
					show: {
						operation: ['burnCaptions'],
					},
				},
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				options: [
					{ name: '480p', value: '480p' },
					{ name: '720p', value: '720p' },
					{ name: '1080p', value: '1080p' },
					{ name: '1440p', value: '1440p' },
					{ name: '4K', value: '4k' },
				],
				default: '720p',
				description: 'Resolution of the output video',
				displayOptions: {
					show: {
						operation: ['burnCaptions'],
					},
				},
			},
			{
				displayName: 'Orientation',
				name: 'orientation',
				type: 'options',
				options: [
					{ name: 'Landscape', value: 'landscape' },
					{ name: 'Portrait', value: 'portrait' },
					{ name: 'Square', value: 'square' },
				],
				default: 'landscape',
				description: 'Orientation of the output video',
				displayOptions: {
					show: {
						operation: ['burnCaptions'],
					},
				},
			},
			{
				displayName: 'Output Filename',
				name: 'outputFilename',
				type: 'string',
				default: '',
				description: 'Desired filename for the output file (without extension)',
				displayOptions: {
					show: {
						operation: ['burnCaptions'],
					},
				},
			},

			// Remove Silence Parameters
			{
				displayName: 'Video URL',
				name: 'url',
				type: 'string',
				required: true,
				default: '',
				description: 'Direct file URL or Google Drive link to the video file',
				displayOptions: {
					show: {
						operation: ['remove_silence'],
					},
				},
			},
			{
				displayName: 'Noise Threshold',
				name: 'noiseThreshold',
				type: 'string',
				default: '-45dB',
				description: 'Noise threshold passed to FFmpeg silencedetect filter, e.g. -45dB',
				displayOptions: {
					show: {
						operation: ['remove_silence'],
					},
				},
			},
			{
				displayName: 'Silence Duration (s)',
				name: 'duration',
				type: 'number',
				default: 0.35,
				description: 'Minimum duration (in seconds) that a section must stay below the threshold to be considered silence',
				displayOptions: {
					show: {
						operation: ['remove_silence'],
					},
				},
			},
			{
				displayName: 'Encoding Preset',
				name: 'preset',
				type: 'options',
				options: [
					{ name: 'Ultra Fast', value: 'ultrafast' },
					{ name: 'Super Fast', value: 'superfast' },
					{ name: 'Very Fast', value: 'veryfast' },
					{ name: 'Faster', value: 'faster' },
					{ name: 'Fast', value: 'fast' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'Slow', value: 'slow' },
					{ name: 'Slower', value: 'slower' },
					{ name: 'Very Slow', value: 'veryslow' },
				],
				default: 'fast',
				description: 'Encoding speed/quality trade-off preset',
				displayOptions: {
					show: {
						operation: ['remove_silence'],
					},
				},
			},
			{
				displayName: 'CRF (Quality)',
				name: 'crf',
				type: 'number',
				default: 20,
				description: 'Quality setting for libx264 (0-51, lower = better quality)',
				displayOptions: {
					show: {
						operation: ['remove_silence'],
					},
				},
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{ name: 'MP4', value: 'mp4' },
					{ name: 'MOV', value: 'mov' },
					{ name: 'MP3', value: 'mp3' },
					{ name: 'WAV', value: 'wav' },
				],
				default: 'mp4',
				description: 'The container format for the output video/audio',
				displayOptions: {
					show: {
						operation: ['remove_silence'],
					},
				},
			},
			{
				displayName: 'Output Filename',
				name: 'outputFilename',
				type: 'string',
				default: '',
				description: 'Desired filename for the output, without extension',
				displayOptions: {
					show: {
						operation: ['remove_silence'],
					},
				},
			},

			// Stitch Videos Parameters
            {
                displayName: 'Video URLs',
                name: 'urls',
                type: 'string',
                required: true,
                default: '',
                description: 'JSON array or comma-separated list of video URLs to stitch in order',
                displayOptions: {
                    show: {
                        operation: ['stitch'],
                    },
                },
            },
            {
                displayName: 'Output Format',
                name: 'outputFormat',
                type: 'options',
                options: [
                    { name: 'MP4', value: 'mp4' },
                    { name: 'MOV', value: 'mov' },
                ],
                default: 'mp4',
                description: 'Output container/codec',
                displayOptions: {
                    show: {
                        operation: ['stitch'],
                    },
                },
            },
            {
                displayName: 'Output Filename',
                name: 'outputFilename',
                type: 'string',
                default: '',
                description: 'Desired filename for the output video (without extension)',
                displayOptions: {
                    show: {
                        operation: ['stitch'],
                    },
                },
            },

            // Generate AI Clips Parameters
			{
				displayName: 'Video URL',
				name: 'url',
				type: 'string',
				required: true,
				default: '',
				description: 'Source video URL',
				displayOptions: {
					show: {
						operation: ['generateClips'],
					},
				},
			},
			{
				displayName: 'Generate Subtitles',
				name: 'subtitles',
				type: 'boolean',
				default: true,
				description: 'Whether to generate karaoke style subtitles',
				displayOptions: {
					show: {
						operation: ['generateClips'],
					},
				},
			},
			{
				displayName: 'Highlight Color',
				name: 'highlightColor',
				type: 'color',
				default: '#FFC000',
				description: 'Color of the highlighted text in karaoke mode',
				displayOptions: {
					show: {
						operation: ['generateClips'],
						subtitles: [true],
					},
				},
			},
			{
				displayName: 'Primary Color',
				name: 'primaryColor',
				type: 'color',
				default: '#FFFFFF',
				description: 'Primary color of the subtitle text',
				displayOptions: {
					show: {
						operation: ['generateClips'],
						subtitles: [true],
					},
				},
			},
			{
				displayName: 'Font Name',
				name: 'fontName',
				type: 'string',
				default: '',
				description: 'Font name to use for subtitles',
				displayOptions: {
					show: {
						operation: ['generateClips'],
						subtitles: [true],
					},
				},
			},
			{
				displayName: 'Font Size',
				name: 'fontSize',
				type: 'number',
				default: 32,
				description: 'Size of the subtitle text',
				displayOptions: {
					show: {
						operation: ['generateClips'],
						subtitles: [true],
					},
				},
			},
			{
				displayName: 'Font Weight',
				name: 'fontWeight',
				type: 'options',
				options: [
					{ name: 'Normal', value: 'normal' },
					{ name: 'Bold', value: 'bold' },
				],
				default: 'normal',
				description: 'Weight of the subtitle text',
				displayOptions: {
					show: {
						operation: ['generateClips'],
						subtitles: [true],
					},
				},
			},
			{
				displayName: 'Shadow Color',
				name: 'shadowColor',
				type: 'color',
				default: '#000000',
				description: 'Color of text shadow',
				displayOptions: {
					show: {
						operation: ['generateClips'],
						subtitles: [true],
					},
				},
			},
			{
				displayName: 'Shadow Intensity',
				name: 'shadowIntensity',
				type: 'number',
				default: 1,
				description: 'Intensity of the text shadow (0 for no shadow)',
				displayOptions: {
					show: {
						operation: ['generateClips'],
						subtitles: [true],
					},
				},
			},
			{
				displayName: 'Display Mode',
				name: 'displayMode',
				type: 'options',
				options: [
					{ name: 'Monoline', value: 'monoline' },
					{ name: 'Word by Word', value: 'word_by_word' },
				],
				default: 'monoline',
				description: 'Subtitle display style',
				displayOptions: {
					show: {
						operation: ['generateClips'],
						subtitles: [true],
					},
				},
			},
			{
				displayName: 'Subtitle Position',
				name: 'subtitlePosition',
				type: 'options',
				options: [
					{ name: 'Top', value: 'top' },
					{ name: 'Centre', value: 'centre' },
					{ name: 'Bottom', value: 'bottom' },
				],
				default: 'centre',
				description: 'Vertical alignment of subtitles',
				displayOptions: {
					show: {
						operation: ['generateClips'],
						subtitles: [true],
					},
				},
			},

			// Split Screen Parameters
			{
				displayName: 'Media URL A',
				name: 'urlA',
				type: 'string',
				required: true,
				default: '',
				description: 'First media source URL',
				displayOptions: {
					show: {
						operation: ['splitScreen'],
					},
				},
			},
			{
				displayName: 'Media URL B',
				name: 'urlB',
				type: 'string',
				required: true,
				default: '',
				description: 'Second media source URL',
				displayOptions: {
					show: {
						operation: ['splitScreen'],
					},
				},
			},
			{
				displayName: 'Orientation',
				name: 'orientation',
				type: 'options',
				options: [
					{ name: 'Horizontal (Side-by-side)', value: 'horizontal' },
					{ name: 'Vertical (Stacked)', value: 'vertical' },
				],
				default: 'horizontal',
				description: 'Split-screen orientation',
				displayOptions: {
					show: {
						operation: ['splitScreen'],
					},
				},
			},
			{
				displayName: 'Volume A',
				name: 'volumeA',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
					maxValue: 2,
					numberStepSize: 0.1,
				},
				default: 1,
				description: 'Volume level for media A (0-2, where 1 is original volume)',
				displayOptions: {
					show: {
						operation: ['splitScreen'],
					},
				},
			},
			{
				displayName: 'Volume B',
				name: 'volumeB',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
					maxValue: 2,
					numberStepSize: 0.1,
				},
				default: 1,
				description: 'Volume level for media B (0-2, where 1 is original volume)',
				displayOptions: {
					show: {
						operation: ['splitScreen'],
					},
				},
			},
			{
				displayName: 'Crop Part A',
				name: 'cropPartA',
				type: 'options',
				options: [
					{ name: 'None', value: '' },
					{ name: 'First', value: 'first' },
					{ name: 'Second', value: 'second' },
					{ name: 'Center', value: 'center' },
				],
				default: '',
				description: 'Crop setting for media A',
				displayOptions: {
					show: {
						operation: ['splitScreen'],
					},
				},
			},
			{
				displayName: 'Crop Part B',
				name: 'cropPartB',
				type: 'options',
				options: [
					{ name: 'None', value: '' },
					{ name: 'First', value: 'first' },
					{ name: 'Second', value: 'second' },
					{ name: 'Center', value: 'center' },
				],
				default: '',
				description: 'Crop setting for media B',
				displayOptions: {
					show: {
						operation: ['splitScreen'],
					},
				},
			},
			{
				displayName: 'Output Filename',
				name: 'outputFilename',
				type: 'string',
				default: '',
				description: 'Custom filename for the output (optional)',
				displayOptions: {
					show: {
						operation: ['splitScreen'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('clipMagicApi');
		const baseUrl = credentials.baseUrl as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let endpoint = '';
				let method = 'GET';
				let body: any = {};
				let qs: any = {};

				switch (operation) {
					case 'convert':
						endpoint = '/convert';
						method = 'GET';
						qs = {
							url: this.getNodeParameter('url', i),
							output_format: this.getNodeParameter('outputFormat', i),
						};
						
						const resolution = this.getNodeParameter('resolution', i) as string;
						if (resolution) {
							qs.resolution = resolution;
						}
						
						const bitrate = this.getNodeParameter('bitrateKbps', i) as number;
						if (bitrate > 0) {
							qs.bitrate_kbps = bitrate;
						}
						break;

					case 'trim':
						endpoint = '/operations/trim';
						method = 'POST';
						body = {
							url: this.getNodeParameter('url', i),
							output_format: this.getNodeParameter('outputFormat', i),
						};

						const outputFilename = this.getNodeParameter('outputFilename', i) as string;
						if (outputFilename) {
							body.output_filename = outputFilename;
						}

						const trimMode = this.getNodeParameter('trimMode', i);
						if (trimMode === 'single') {
							body.start = this.getNodeParameter('start', i);
							const endMode = this.getNodeParameter('endMode', i);
							if (endMode === 'end') {
								body.end = this.getNodeParameter('end', i);
							} else {
								body.duration = this.getNodeParameter('duration', i);
							}
						} else {
							const segments = this.getNodeParameter('segments', i) as any;
							body.segments = segments.segment?.map((seg: any) => {
								const segment: any = { start: seg.start };
								if (seg.endMode === 'end') {
									segment.end = seg.end;
								} else {
									segment.duration = seg.duration;
								}
								return segment;
							}) || [];
						}
						break;

					case 'compress':
						endpoint = '/operations/compress';
						method = 'POST';
						body = {
							url: this.getNodeParameter('url', i),
							preset: this.getNodeParameter('preset', i),
							crf: this.getNodeParameter('crf', i),
							output_format: this.getNodeParameter('outputFormat', i),
						};
						break;

					case 'burnCaptions':
						endpoint = '/operations/burn-captions';
						method = 'POST';
						body = {
							url: this.getNodeParameter('url', i),
							subtitle_url: this.getNodeParameter('subtitleUrl', i),
							font_size: this.getNodeParameter('fontSize', i),
							primary_color: this.getNodeParameter('fontColor', i),
							subtitle_position: this.getNodeParameter('subtitlePosition', i),
							output_format: this.getNodeParameter('outputFormat', i),
						};

						// Add optional parameters if set
						const captionFontName = this.getNodeParameter('fontName', i, '') as string;
						if (captionFontName) {
							body.font_name = captionFontName;
						}

						const captionResolution = this.getNodeParameter('resolution', i, '') as string;
						if (captionResolution) {
							body.resolution = captionResolution;
						}

						const captionOrientation = this.getNodeParameter('orientation', i, '') as string;
						if (captionOrientation) {
							body.orientation = captionOrientation;
						}

						const outline = this.getNodeParameter('outline', i, 0) as number;
						if (outline > 0) {
							body.outline = outline;
						}

						const boxed = this.getNodeParameter('boxed', i, false) as boolean;
						body.boxed = boxed;

						const captionOutputFilename = this.getNodeParameter('outputFilename', i, '') as string;
						if (captionOutputFilename) {
							body.output_filename = captionOutputFilename;
						}
						break;

					case 'remove_silence':
						endpoint = '/operations/remove-silence';
						method = 'POST';
						body = {
							url: this.getNodeParameter('url', i),
							noise_threshold: this.getNodeParameter('noiseThreshold', i),
							duration: this.getNodeParameter('duration', i),
							preset: this.getNodeParameter('preset', i),
							crf: this.getNodeParameter('crf', i),
							output_format: this.getNodeParameter('outputFormat', i),
						};

						// Add optional output filename if present
						const silenceOutputFilename = this.getNodeParameter('outputFilename', i, '') as string;
						if (silenceOutputFilename) {
							body.output_filename = silenceOutputFilename;
						}
						break;

					case 'stitch':
                        endpoint = '/operations/stitch';
                        method = 'POST';
                        // Accept both JSON array string and comma separated list
                        const urlsParam = this.getNodeParameter('urls', i) as string;
                        let urls: string[];
                        try {
                            urls = JSON.parse(urlsParam);
                            if (!Array.isArray(urls)) throw new Error();
                        } catch (_) {
                            // fallback: split by comma
                            urls = urlsParam.split(',').map((u) => u.trim()).filter((u) => u);
                        }
                        body = {
                            urls,
                            output_format: this.getNodeParameter('outputFormat', i),
                        };
                        const stitchFilename = this.getNodeParameter('outputFilename', i, '') as string;
                        if (stitchFilename) {
                            body.output_filename = stitchFilename;
                        }
                        break;

                    case 'generateClips':
						endpoint = '/workflows/generate-clips';
						method = 'POST';
						body = {
							url: this.getNodeParameter('url', i),
							subtitles: this.getNodeParameter('subtitles', i),
						};
						
						// Add resolution and orientation if provided
						try {
							body.resolution = this.getNodeParameter('resolution', i);
						} catch (e) {}
						
						try {
							body.orientation = this.getNodeParameter('orientation', i);
						} catch (e) {}

						const subtitles = this.getNodeParameter('subtitles', i) as boolean;
						if (subtitles) {
							// Add all subtitle-related parameters from the OpenAPI schema
							try {
								body.highlight_color = this.getNodeParameter('highlightColor', i);
							} catch (e) {}
							
							try {
								body.primary_color = this.getNodeParameter('primaryColor', i);
							} catch (e) {}
							
							try {
								body.font_name = this.getNodeParameter('fontName', i);
							} catch (e) {}
							
							try {
								body.font_size = this.getNodeParameter('fontSize', i);
							} catch (e) {}
							
							try {
								body.font_weight = this.getNodeParameter('fontWeight', i) === 'bold' ? 1 : 0;
							} catch (e) {}
							
							try {
								body.shadow_color = this.getNodeParameter('shadowColor', i);
							} catch (e) {}
							
							try {
								body.shadow_intensity = this.getNodeParameter('shadowIntensity', i);
							} catch (e) {}
							
							try {
								body.display_mode = this.getNodeParameter('displayMode', i);
							} catch (e) {}
							
							try {
								body.subtitle_position = this.getNodeParameter('subtitlePosition', i);
							} catch (e) {}
						}
						break;

					case 'splitScreen':
						endpoint = '/operations/split-screen';
						method = 'POST';
						body = {
							url_a: this.getNodeParameter('urlA', i),
							url_b: this.getNodeParameter('urlB', i),
							orientation: this.getNodeParameter('orientation', i),
							volume_a: this.getNodeParameter('volumeA', i),
							volume_b: this.getNodeParameter('volumeB', i),
							output_format: 'mp4',
						};
						
						// Add crop settings if specified
						const cropPartA = this.getNodeParameter('cropPartA', i) as string;
						if (cropPartA) {
							body.crop_part_a = cropPartA;
						}
						
						const cropPartB = this.getNodeParameter('cropPartB', i) as string;
						if (cropPartB) {
							body.crop_part_b = cropPartB;
						}
						
						// Add output filename if specified
						const splitScreenFilename = this.getNodeParameter('outputFilename', i, '') as string;
						if (splitScreenFilename) {
							body.output_filename = splitScreenFilename;
						}
						break;

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
				}

				const timeoutMs = this.getNodeParameter('options.timeout', i, 0) as number;

                const options: any = {
					headers: {
						'Content-Type': 'application/json',
					},
					method,
					body: method === 'POST' ? body : undefined,
					qs: method === 'GET' ? qs : undefined,
					url: `${baseUrl}${endpoint}`,
					encoding: null,
					resolveWithFullResponse: true,
                    
				};

                if (timeoutMs > 0) {
                    options.timeout = timeoutMs;
                }

                const response = await this.helpers.requestWithAuthentication.call(
					this,
					'clipMagicApi',
					options,
				);

				// Handle binary responses (media files)
				if (response.headers['content-type']?.includes('application/') ||
					response.headers['content-type']?.includes('video/') ||
					response.headers['content-type']?.includes('audio/')) {
					
					const contentDisposition = response.headers['content-disposition'];
					let filename = 'output';
					
					if (contentDisposition) {
						const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
						if (filenameMatch) {
							filename = filenameMatch[1];
						}
					}

					const binaryData = await this.helpers.prepareBinaryData(
						response.body as Buffer,
						filename,
						response.headers['content-type'],
					);

					returnData.push({
						json: {
							success: true,
							operation,
							filename,
							contentType: response.headers['content-type'],
						},
						binary: {
							data: binaryData,
						},
					});
				} else {
					// Handle JSON responses
					let jsonData;
					try {
						jsonData = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
					} catch (error) {
						jsonData = { raw: response.body };
					}

					returnData.push({
						json: {
							success: true,
							operation,
							...jsonData,
						},
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
							error: error instanceof Error ? error.message : String(error),
						},
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}