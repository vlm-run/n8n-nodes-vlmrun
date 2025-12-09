import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	IDataObject,
	NodeOperationError,
	NodeConnectionType,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeTypeDescription,
} from 'n8n-workflow';
import { FileRequest, ChatMessage } from './types';
import { ApiService } from './ApiService';
import { processFile, processImageRequest } from './utils';

export class VlmRun implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'VLM Run',
		name: 'vlmRun',
		icon: 'file:vlm-run.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with VLM Run API',
		defaults: {
			name: 'VLM Run',
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [NodeConnectionType.Main],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'vlmRunApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Analyze Audio',
						value: 'audio',
						description:
							'Analyze audio files for transcription, speaker identification, sentiment analysis, and more',
						action: 'Analyze audio',
					},
					{
						name: 'Analyze Document',
						value: 'document',
						description:
							'Extract structured data from documents such as resumes, invoices, presentations, and more',
						action: 'Analyze document',
					},
					{
						name: 'Analyze Image',
						value: 'image',
						description: 'Extract information or generate captions from images',
						action: 'Analyze image',
					},
					{
						name: 'Analyze Video',
						value: 'video',
						description: 'Extract insights or transcribe content from video files',
						action: 'Analyze video',
					},
					{
						name: 'Execute Agent',
						value: 'executeAgent',
						description: 'Execute an agent',
						action: 'Execute agent',
					},
				{
					name: 'Manage Files',
					value: 'file',
					description: 'List uploaded files or upload new files to VLM Run',
					action: 'Manage files',
				},
				{
					name: 'Chat Completion',
					value: 'chatCompletion',
					description: 'Generate chat completions using OpenAI-compatible API',
					action: 'Chat completion',
				},
			],
			default: 'document',
		},
			// File field for document, image, audio, video operations
			{
				displayName: 'File',
				name: 'file',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['document', 'image', 'audio', 'video'],
					},
				},
				default: 'data',
				required: true,
				description: 'File data from previous node',
			},
			// File Management Properties
			{
				displayName: 'File Operation',
				name: 'fileOperation',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['file'],
					},
				},
				options: [
					{
						name: 'List Files',
						value: 'list',
						description: 'Get a list of all files',
					},
					{
						name: 'Upload File',
						value: 'upload',
						description: 'Upload a new file',
					},
				],
				default: 'list',
			},
			{
				displayName: 'Prompt',
				name: 'agentPrompt',
				type: 'string',
				typeOptions: {
					alwaysOpenEditWindow: false,
					rows: 4,
				},
				displayOptions: {
					show: {
						operation: ['executeAgent'],
					},
				},
				default: '',
				description: 'The prompt associated with the selected agent',
			},
			// Multiple Files Toggle for Execute Agent
			{
				displayName: 'Multiple Files',
				name: 'multipleFiles',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['executeAgent'],
					},
				},
				default: false,
				description: 'Whether to upload multiple files with custom keys',
			},
			// Single File field for executeAgent when multipleFiles is false
			{
				displayName: 'File',
				name: 'file',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['executeAgent'],
						multipleFiles: [false],
					},
				},
				default: 'data',
				required: true,
				description: 'File data from previous node',
			},
			// Key-Value Collection for Multiple Files
			{
				displayName: 'File Mappings',
				name: 'fileMappings',
				type: 'fixedCollection',
				placeholder: 'Add More',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['executeAgent'],
						multipleFiles: [true],
					},
				},
				default: {},
				required: true,
				description: 'Map custom keys to file URLs',
				options: [
					{
						name: 'mapping',
						displayName: 'File Mapping',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								placeholder: 'e.g., url, file_url, image_url',
								required: true,
								description: 'Custom identifier for this file',
							},
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								default: '',
								placeholder: 'https://example.com/file.pdf',
								required: true,
								description: 'File URL from previous upload node',
							},
						],
					},
				],
			},
			// File field for file upload operation
			{
				displayName: 'File',
				name: 'file',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['file'],
						fileOperation: ['upload'],
					},
				},
				default: 'data',
				required: true,
				description: 'File data from previous node',
			},
			// Common Properties
			{
				displayName: 'Domain Name or ID',
				name: 'domain',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'loadDomains',
				},
				displayOptions: {
					show: {
						operation: ['document', 'image', 'audio', 'video'],
					},
				},
				default: '',
				description:
					'Domain to use for analysis. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Process Asynchronously',
				name: 'processAsynchronously',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['document', 'audio', 'video'],
					},
				},
				default: false,
				description: 'Whether to process the request asynchronously',
			},
			{
				displayName: 'Callback URL',
				name: 'callbackUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['document', 'image', 'audio', 'video'],
						processAsynchronously: [true],
					},
				},
				default: '',
				required: true,
				description: 'URL to call when processing is complete',
			},
			{
				displayName: 'Callback URL',
				name: 'agentCallbackUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['executeAgent'],
					},
				},
				default: '',
				required: true,
				description: 'URL to call when processing is complete',
			},
			// Chat Completion Properties
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['chatCompletion'],
					},
				},
				options: [
					{
						name: 'vlmrun-orion-1:auto',
						value: 'vlmrun-orion-1:auto',
					},
				],
				default: 'vlmrun-orion-1:auto',
				required: true,
				description: 'Model to use for chat completion',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'fixedCollection',
				typeOptions: {
					sortable: true,
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['chatCompletion'],
					},
				},
				placeholder: 'Add Message',
				default: {},
				options: [
					{
						displayName: 'Messages',
						name: 'messages',
						values: [
							{
								displayName: 'Role',
								name: 'role',
								type: 'options',
								options: [
									{
										name: 'Assistant',
										value: 'assistant',
									},
									{
										name: 'System',
										value: 'system',
									},
									{
										name: 'User',
										value: 'user',
									},
								],
								default: 'user',
							},
							{
								displayName: 'Content',
								name: 'content',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
			{
				displayName: 'Input Type',
				name: 'inputType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['chatCompletion'],
					},
				},
				options: [
					{
						name: 'Image URL(s)',
						value: 'image',
					},
					{
						name: 'Video URL(s)',
						value: 'video',
					},
				],
				default: 'image',
				description: 'Type of media input',
			},
			{
				displayName: 'Image URL(s)',
				name: 'imageUrls',
				type: 'fixedCollection',
				placeholder: 'Add URL',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['chatCompletion'],
						inputType: ['image'],
					},
				},
				default: {},
				description: 'Image URL(s) to include in the chat completion',
				options: [
					{
						displayName: 'URL',
						name: 'url',
						values: [
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								default: '',
								placeholder: 'https://example.com/image.jpg',
								required: true,
								description: 'Image URL',
							},
						],
					},
				],
			},
			{
				displayName: 'Video URL(s)',
				name: 'videoUrls',
				type: 'fixedCollection',
				placeholder: 'Add URL',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['chatCompletion'],
						inputType: ['video'],
					},
				},
				default: {},
				description: 'Video URL(s) to include in the chat completion',
				options: [
					{
						displayName: 'URL',
						name: 'url',
						values: [
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								default: '',
								placeholder: 'https://example.com/video.mp4',
								required: true,
								description: 'Video URL',
							},
						],
					},
				],
			},
			// {
			// 	displayName: 'Max Tokens',
			// 	name: 'maxTokens',
			// 	type: 'number',
			// 	displayOptions: {
			// 		show: {
			// 			operation: ['chatCompletion'],
			// 		},
			// 	},
			// 	default: 32768,
			// 	typeOptions: {
			// 		maxValue: 32768,
			// 	},
			// 	description: 'The maximum number of tokens to generate in the completion',
			// },
			// {
			// 	displayName: 'Response Format',
			// 	name: 'responseFormat',
			// 	type: 'json',
			// 	displayOptions: {
			// 		show: {
			// 			operation: ['chatCompletion'],
			// 		},
			// 	},
			// 	default: '',
			// 	description:
			// 		'Specify the format of the response. Use JSON schema format: {"type": "json_schema", "schema": {...}}',
			// },
		],
	};

	methods = {
		loadOptions: {
			async loadDomains(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					return await ApiService.getDomains(this);
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Failed to load domains: ${error.message}`);
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let response: IDataObject;

				switch (operation) {
					case 'document':
					case 'audio':
					case 'video': {
						const model = 'vlmrun-orion-1:auto'; // Use hardcoded model value
						const file = this.getNodeParameter('file', i) as string;
						const { buffer, fileName } = await processFile(this, items[i], i, file);
						const domain = this.getNodeParameter('domain', 0) as string;
						const batch = this.getNodeParameter('processAsynchronously', 0) as boolean;
						const callbackUrl = batch
							? (this.getNodeParameter('callbackUrl', 0) as string)
							: undefined;

						const fileResponse = await ApiService.uploadFile(this, buffer, fileName);
						this.sendMessageToUI('File uploaded...');

						const request: FileRequest = {
							fileId: fileResponse.id,
							model,
							domain,
							batch,
							callbackUrl,
						};

						response =
							operation === 'document'
								? await ApiService.generateDocumentRequest(this, request)
								: operation === 'audio'
									? await ApiService.generateAudioRequest(this, request)
									: await ApiService.generateVideoRequest(this, request);
						break;
					}

					case 'image': {
						const file = this.getNodeParameter('file', i) as string;
						response = await processImageRequest(this, items[i], file);
						break;
					}

					case 'file': {
						const fileOperation = this.getNodeParameter('fileOperation', 0) as string;
						if (fileOperation === 'list') {
							response = { files: await ApiService.getFiles(this) };
						} else {
							const file = this.getNodeParameter('file', i) as string;
							const { buffer, fileName } = await processFile(this, items[i], i, file);
							response = await ApiService.uploadUsingPresignedUrl(this, fileName, buffer);
							this.sendMessageToUI('File uploaded...');
						}
						break;
					}

					case 'executeAgent': {
						const agentPrompt = this.getNodeParameter('agentPrompt', 0) as string;
						const callbackUrl = this.getNodeParameter('agentCallbackUrl', 0) as string;

						const multipleFiles = this.getNodeParameter('multipleFiles', 0) as boolean;

						let filePayload: IDataObject;

						if (multipleFiles) {
							// Handle multiple files with key-value mapping
							const fileMappings = this.getNodeParameter('fileMappings', 0) as IDataObject;
							const mappings = (fileMappings.mapping as IDataObject[]) || [];

							if (mappings.length === 0) {
								throw new NodeOperationError(
									this.getNode(),
									'At least one file mapping is required when multiple files is enabled',
								);
							}

							const urls: IDataObject = {};
							for (const mapping of mappings) {
								const key = mapping.key as string;
								const url = mapping.url as string;

								if (!key || !url) {
									throw new NodeOperationError(
										this.getNode(),
										'Both key and URL are required for each file mapping',
									);
								}

								urls[key] = url;
							}

							filePayload = { urls };
							this.sendMessageToUI(`Multiple files mapped: ${Object.keys(urls).join(', ')}`);
						} else {
							// Handle single file (existing logic)
							const file = this.getNodeParameter('file', i) as string;
							const { buffer, fileName } = await processFile(this, items[i], i, file);

							const uploadRes = (await ApiService.uploadUsingPresignedUrl(
								this,
								fileName,
								buffer,
							)) as IDataObject;
							const fileUrl = uploadRes.public_url as string;

							if (!fileUrl) {
								throw new NodeOperationError(this.getNode(), 'Failed to obtain uploaded file URL');
							}

							filePayload = { url: fileUrl };
							this.sendMessageToUI('Single file uploaded...');
						}

						response = await ApiService.executeAgent(this, agentPrompt, filePayload, callbackUrl);
						break;
					}

					case 'chatCompletion': {
						const promptParam = this.getNodeParameter('prompt', i) as IDataObject;
						const model = this.getNodeParameter('model', i) as string;
						const inputType = this.getNodeParameter('inputType', i) as string;
						// const maxTokens = this.getNodeParameter('maxTokens', i) as number | undefined;
						// const responseFormatParam = this.getNodeParameter('responseFormat', i) as string | undefined;

						// Extract messages from fixedCollection
						const messagesData = (promptParam.messages as IDataObject[]) || [];

						// Process image URLs
						const imageUrls: string[] = [];
						if (inputType === 'image') {
							const imageUrlsParam = this.getNodeParameter('imageUrls', i) as IDataObject;
							if (imageUrlsParam && imageUrlsParam.url) {
								const urlEntries = Array.isArray(imageUrlsParam.url) ? imageUrlsParam.url : [imageUrlsParam.url];
								for (const entry of urlEntries) {
									if (entry && typeof entry === 'object' && entry.url) {
										const url = entry.url as string;
										if (url && url.trim()) {
											imageUrls.push(url.trim());
										}
									}
								}
							}
						}

						// Process video URLs
						const videoUrls: string[] = [];
						if (inputType === 'video') {
							const videoUrlsParam = this.getNodeParameter('videoUrls', i) as IDataObject;
							if (videoUrlsParam && videoUrlsParam.url) {
								const urlEntries = Array.isArray(videoUrlsParam.url) ? videoUrlsParam.url : [videoUrlsParam.url];
								for (const entry of urlEntries) {
									if (entry && typeof entry === 'object' && entry.url) {
										const url = entry.url as string;
										if (url && url.trim()) {
											videoUrls.push(url.trim());
										}
									}
								}
							}
						}

						// Build messages with support for images and videos
						const messages: ChatMessage[] = messagesData.map((msg: IDataObject, index: number) => {
							const role = msg.role as string;
							const content = msg.content as string;
							
							if ((imageUrls.length > 0 || videoUrls.length > 0) && 
								role === 'user' && 
								index === messagesData.length - 1) {
								// Create content array with text, images, and videos
								const contentParts: Array<{ 
									type: 'text' | 'image_url' | 'video_url'; 
									text?: string; 
									image_url?: { url: string };
									video_url?: { url: string };
								}> = [];
								
								if (content && content.trim()) {
									contentParts.push({
										type: 'text',
										text: content,
									});
								}
								
								// Add all images
								for (const imageUrl of imageUrls) {
									contentParts.push({
										type: 'image_url',
										image_url: {
											url: imageUrl,
										},
									});
								}
								
								// Add all videos
								for (const videoUrl of videoUrls) {
									contentParts.push({
										type: 'video_url',
										video_url: {
											url: videoUrl,
										},
									});
								}
								
								return {
									role,
									content: contentParts,
								};
							}
							
							// Otherwise, return simple text content
							return {
								role,
								content,
							};
						});

						// Validate messages
						if (messages.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'At least one message is required. Please add a message to the prompt.',
							);
						}

						// Validate message structure
						for (const message of messages) {
							if (!message || !message.role) {
								throw new NodeOperationError(
									this.getNode(),
									'Each message must have a "role" property.',
								);
							}
							
							if (typeof message.content === 'string') {
								if (!message.content) {
									throw new NodeOperationError(
										this.getNode(),
										'Text messages must have a "content" property.',
									);
								}
							} else if (Array.isArray(message.content)) {
								if (message.content.length === 0) {
									throw new NodeOperationError(
										this.getNode(),
										'Message content array cannot be empty.',
									);
								}
							} else {
								throw new NodeOperationError(
									this.getNode(),
									'Message content must be either a string or an array of content parts.',
								);
							}
						}

						// Parse response_format if provided
						// let responseFormat: { type: string; schema?: any } | undefined;
						// if (responseFormatParam && responseFormatParam !== '') {
						// 	try {
						// 		responseFormat = JSON.parse(responseFormatParam);
						// 	} catch (error) {
						// 		throw new NodeOperationError(
						// 			this.getNode(),
						// 			'Invalid JSON format for response_format. Please provide a valid JSON object.',
						// 		);
						// 	}
						// }

						response = await ApiService.chatCompletion(this, messages, model);
						break;
					}

					default:
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported!`,
						);
				}

				returnData.push({ json: response });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
