import { INodeProperties } from 'n8n-workflow';
import { Operation, Resource } from './types';

export const vlmRunResources: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	options: [
		{
			name: 'Doc AI',
			value: Resource.DOCUMENT_AI,
		},
		{
			name: 'Image AI',
			value: Resource.IMAGE_AI,
		},
		// {
		// 	name: 'Audio AI',
		// 	value: Resource.AUDIO_AI,
		// },
		{
			name: 'Agent AI',
			value: Resource.AGENT_AI,
		},
		// {
		// 	name: 'Experimental',
		// 	value: Resource.EXPERIMENTAL,
		// },
		{
			name: 'File',
			value: Resource.FILE,
		},
		// {
		// 	name: 'HTTP',
		// 	value: Resource.HTTP,
		// },
	],
	default: 'documentAi',
	noDataExpression: true,
};

export const vlmRunOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [Resource.DOCUMENT_AI],
			},
		},
		options: [
			{
				name: 'Resume Parser',
				value: Operation.RESUME_PARSER,
			},
			{
				name: 'Invoice Parser',
				value: Operation.INVOICE_PARSER,
			},
			{
				name: 'Presentation Parser',
				value: Operation.PRESENTATION_PARSER,
			},
			{
				name: 'AI Assisted Form Filling',
				value: Operation.FORM_FILLING,
			},
		],
		default: 'resumeParser',
		noDataExpression: true,
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [Resource.IMAGE_AI],
			},
		},
		options: [
			{
				name: 'Image Captioning',
				value: Operation.IMAGE_CAPTIONING,
			},
		],
		default: 'imageCaptioning',
		noDataExpression: true,
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [Resource.AUDIO_AI],
			},
		},
		options: [
			{
				name: 'Audio Transcription',
				value: Operation.AUDIO_TRANSCRIPTION,
			},
		],
		default: 'audioTranscription',
		noDataExpression: true,
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [Resource.FILE],
			},
		},
		options: [
			{
				name: 'List',
				value: Operation.FILE_LIST,
			},
			{
				name: 'Upload',
				value: Operation.FILE_UPLOAD,
			},
		],
		default: 'fileList',
		noDataExpression: true,
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [Resource.AGENT_AI],
			},
		},
		options: [
			{
				name: 'Github',
				value: Operation.GITHUB_AGENT,
			},
			{
				name: 'Linkedin',
				value: Operation.LINKEDIN_AGENT,
			},
			{
				name: 'Market Research',
				value: Operation.MARKET_RESEARCH_AGENT,
			},
		],
		default: 'githubAgent',
		noDataExpression: true,
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [Resource.EXPERIMENTAL],
			},
		},
		options: [
			{
				name: 'Image Embeddings',
				value: Operation.IMAGE_EMBEDDING,
			},
			{
				name: 'Document Embeddings',
				value: Operation.DOCUMENT_EMBEDDING,
			},
		],
		default: 'imageEmbedding',
		noDataExpression: true,
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [Resource.HTTP],
			},
		},
		options: [
			{
				name: 'Custom GET',
				value: Operation.GET,
				displayName: 'Perform a GET call.',
			},
			{
				name: 'Custom POST',
				value: Operation.POST,
				displayName: 'Perform a POST call.',
			},
		],
		default: 'GET',
		noDataExpression: true,
	},
];

export const vlmRunOptions: INodeProperties[] = [
	{
		displayName: 'File',
		name: 'file',
		type: 'string',
		displayOptions: {
			show: {
				resource: [
					Resource.DOCUMENT_AI,
					Resource.IMAGE_AI,
					Resource.AUDIO_AI,
					Resource.EXPERIMENTAL,
				],
			},
		},
		default: 'data',
		required: true,
		description: 'File data from previous node',
	},
	{
		displayName: 'File',
		name: 'file',
		type: 'string',
		displayOptions: {
			show: {
				resource: [Resource.FILE],
				operation: [Operation.FILE_UPLOAD],
			},
		},
		default: 'data',
		required: true,
		description: 'File data from previous node',
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		displayOptions: {
			show: {
				resource: [Resource.AGENT_AI],
			},
		},
		default: '',
		required: true,
		description: 'URL to generate webpage',
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'options',
		displayOptions: {
			show: {
				resource: [Resource.DOCUMENT_AI, Resource.IMAGE_AI, Resource.AUDIO_AI, Resource.AGENT_AI],
			},
		},
		options: [
			{
				name: 'VLM-1',
				value: 'vlm-1',
			},
		],
		default: 'vlm-1',
		description: 'The model to use for processing',
		noDataExpression: true,
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'options',
		displayOptions: {
			show: {
				resource: [Resource.EXPERIMENTAL],
			},
		},
		options: [
			{
				name: 'VLM-1 Embeddings',
				value: 'vlm-1-embeddings',
			},
		],
		default: 'vlm-1-embeddings',
		description: 'The model to use for embeddings',
		noDataExpression: true,
	},
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		displayOptions: {
			show: {
				resource: [Resource.AGENT_AI],
			},
		},
		options: [
			{
				name: 'Fast',
				value: 'fast',
			},
			{
				name: 'Accurate',
				value: 'accurate',
			},
		],
		default: 'accurate',
		description: 'The mode to use for web generation',
	},
];

export const httpOperation: INodeProperties[] = [
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		placeholder: 'e.g. /files, /models',
		required: true,
		description: 'The URL to send the request to',
		displayOptions: {
			show: {
				resource: ['http'],
			},
		},
	},
	{
		displayName: 'Send Header',
		name: 'isHeaderRequired',
		type: 'boolean',
		default: false,
		required: true,
		description: 'Whether to send headers with the request',
		displayOptions: {
			show: {
				resource: ['http'],
			},
		},
	},
	{
		displayName: 'Headers',
		name: 'headers',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Header',
		},
		default: {},
		required: true,
		description: 'Headers to send with the request',
		displayOptions: {
			show: {
				isHeaderRequired: [true],
			},
		},
		options: [
			{
				name: 'header',
				displayName: 'Header',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						required: true,
						description: 'Header key',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						required: true,
						description: 'Header value',
					},
				],
			},
		],
	},
	{
		displayName: 'Send Query Params',
		name: 'isQueryParamRequired',
		type: 'boolean',
		default: false,
		required: true,
		description: 'Whether to send query parameters with the request',
		displayOptions: {
			show: {
				resource: ['http'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'params',
		default: {},
		description: "The request's query parameters",
		displayOptions: {
			show: {
				isQueryParamRequired: [true],
			},
		},
		required: true,
		options: [
			{
				name: 'param',
				displayName: 'Parameters',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						required: true,
						description: 'Key of query parameter',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						required: true,
						description: 'Value of query parameter',
					},
				],
			},
		],
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Parameter',
		},
	},
	{
		displayName: 'Send Body',
		name: 'isBodyRequired',
		type: 'boolean',
		default: false,
		required: true,
		description: 'Whether to send a request body',
		displayOptions: {
			show: {
				resource: ['http'],
				operation: ['POST'],
			},
		},
	},
	{
		displayName: 'Type of Data',
		name: 'typeofData',
		default: 'jsonData',
		description: 'Select type of data to send [JSON, Form Data]',
		displayOptions: {
			show: {
				isBodyRequired: [true],
			},
		},
		options: [
			{
				name: 'JSON',
				value: 'jsonData',
			},
			{
				name: 'Form Data',
				value: 'formData',
			},
		],
		required: true,
		type: 'options',
	},
	{
		displayName: 'JSON Object',
		name: 'jsonBody',
		default: {},
		required: true,
		description: "The request's JSON properties",
		displayOptions: {
			show: {
				resource: ['http'],
				operation: ['POST'],
				typeofData: ['jsonData'],
			},
		},
		options: [
			{
				name: 'json',
				displayName: 'Json Body',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						required: true,
						description: 'Key of JSON property',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						required: true,
						description: 'Value of JSON property',
					},
				],
			},
		],
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Field',
		},
	},
	{
		displayName: 'Form Data',
		name: 'formBody',
		default: {},
		required: true,
		description: "The request's form data properties",
		displayOptions: {
			show: {
				resource: ['http'],
				operation: ['POST'],
				typeofData: ['formData'],
			},
		},
		options: [
			{
				name: 'form',
				displayName: 'Form Data',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						placeholder: 'Key of the file parameter',
						required: true,
						description: 'Key of form data',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						placeholder: 'Enter a binary file',
						required: true,
						description: 'Value of form data',
					},
				],
			},
		],
		type: 'fixedCollection',
		typeOptions: {
			multipleValueButtonText: 'Add field',
		},
	},
];
