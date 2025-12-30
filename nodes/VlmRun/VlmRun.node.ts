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

import { FileRequest, ChatMessage, ResponseFormat } from './types';
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
						name: 'Artifacts',
						value: 'artifacts',
						description: 'Get artifacts by session ID or execution ID and object ID',
						action: 'Get artifacts',
					},
					{
						name: 'Chat Completion',
						value: 'chatCompletion',
						description: 'Generate chat completions using OpenAI-compatible API',
						action: 'Chat completion',
					},
					{
						name: 'Analyze Document',
						value: 'document',
						description:
							'Extract structured data from documents such as resumes, invoices, presentations, and more',
						action: 'Analyze document',
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
				],
			default: 'document',
		},
			// Artifacts Properties
			{
				displayName: 'Artifact Type',
				name: 'artifactType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['artifacts'],
					},
				},
				options: [
					{
						name: 'Agent',
						value: 'agent',
						description: 'Get artifact using object ID and execution ID',
					},
					{
						name: 'Chat',
						value: 'chat',
						description: 'Get artifact using object ID and session ID',
					},
				],
				default: 'chat',
				description: 'Type of artifact to retrieve',
			},
			{
				displayName: 'Object ID',
				name: 'objectId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['artifacts'],
					},
				},
				default: '',
				required: true,
				description: 'Object ID for the artifact (format: <type>_<6-hex-chars>)',
			},
			{
				displayName: 'Session ID',
				name: 'sessionId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['artifacts'],
						artifactType: ['chat'],
					},
				},
				default: '',
				required: true,
				description: 'Session ID for the artifact (used with chat type)',
			},
			{
				displayName: 'Execution ID',
				name: 'executionId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['artifacts'],
						artifactType: ['agent'],
					},
				},
				default: '',
				required: true,
				description: 'Execution ID for the artifact (used with agent type)',
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
						name: 'vlmrun-orion-1:fast',
						value: 'vlmrun-orion-1:fast',
					},
					{
						name: 'vlmrun-orion-1:auto',
						value: 'vlmrun-orion-1:auto',
					},
					{
						name: 'vlmrun-orion-1:pro',
						value: 'vlmrun-orion-1:pro',
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
						name: 'Text',
						value: 'text',
					},
					{
						name: 'Image URL(s)',
						value: 'image',
					},
					{
						name: 'Video URL(s)',
						value: 'video',
					},
					{
						name: 'File URL(s)',
						value: 'file',
					},
				],
				default: 'text',
				description: 'Type of input',
			},
			{
				displayName: 'Output Content as JSON',
				name: 'jsonOutput',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['chatCompletion'],
						inputType: ['text'],
					},
				},
				default: false,
				description: 'Whether to attempt to parse the message content as JSON object',
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
			{
				displayName: 'File URL(s)',
				name: 'fileUrls',
				type: 'fixedCollection',
				placeholder: 'Add URL',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['chatCompletion'],
						inputType: ['file'],
					},
				},
				default: {},
				description: 'File URL(s) to include in the chat completion (PDFs, documents, etc.)',
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
								placeholder: 'https://example.com/document.pdf',
								required: true,
								description: 'File URL',
							},
						],
					},
				],
			},
			{
				displayName: 'Simplify Output',
				name: 'simplifyOutput',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['chatCompletion'],
					},
				},
				default: false,
				description: 'Whether to return only the message content instead of full API response',
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
			{
				displayName: 'Response Format',
				name: 'responseFormat',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['chatCompletion'],
					},
				},
				default: '',
				description:
					'Specify the format of the response using JSON schema. Format: {"type": "json_schema", "strict": true, "schema": {...}}. Optional: "name" property for schema identification. The schema should follow JSON Schema Draft 7 specification. For structured outputs, "strict": true is automatically set if not provided.',
			},
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
					case 'artifacts': {
						const artifactType = this.getNodeParameter('artifactType', i) as string;
						const objectId = this.getNodeParameter('objectId', i) as string;
						
						let sessionId: string | undefined;
						let executionId: string | undefined;

						if (artifactType === 'agent') {
							executionId = this.getNodeParameter('executionId', i) as string;
						} else {
							sessionId = this.getNodeParameter('sessionId', i) as string;
						}

						const artifactResponse = await ApiService.getArtifact(this, {
							objectId,
							sessionId,
							executionId,
						});

						// Determine artifact type from objectId
						const parts = objectId.split('_');
						if (parts.length < 2) {
							throw new NodeOperationError(
								this.getNode(),
								`Invalid object ID: ${objectId}, expected format: <obj_type>_<6-digit-hex-string>`,
							);
						}

						const objType = parts[0] === 'recon' ? 'recon' : parts[0];
						const objIdSuffix = parts[parts.length - 1];

						if (objIdSuffix.length !== 6) {
							throw new NodeOperationError(
								this.getNode(),
								`Invalid object ID: ${objectId}, expected format: <obj_type>_<6-digit-hex-string>`,
							);
						}

						// Determine file extension and mime type
						let fileExtension = 'bin';
						let mimeType = artifactResponse.contentType || 'application/octet-stream';

						if (objType === 'img') {
							fileExtension = 'jpg';
							mimeType = 'image/jpeg';
						} else if (objType === 'vid') {
							fileExtension = 'mp4';
							mimeType = 'video/mp4';
						} else if (objType === 'aud') {
							fileExtension = 'mp3';
							mimeType = 'audio/mpeg';
						} else if (objType === 'doc') {
							fileExtension = 'pdf';
							mimeType = 'application/pdf';
						} else if (objType === 'recon') {
							fileExtension = 'spz';
							mimeType = 'application/octet-stream';
						} else if (objType === 'url') {
							// URL artifact - decode and download (only possible when objectId is provided)
							if (!objectId) {
								throw new NodeOperationError(
									this.getNode(),
									'URL artifacts require an object ID',
								);
							}
							
							const url = artifactResponse.data.toString('utf-8');
							
							try {
								const urlObj = new URL(url);
								const urlPath = urlObj.pathname;
								const filename = urlPath.split('/').pop()?.split('?')[0] || 'file';
								const ext = filename.split('.').pop()?.toLowerCase() || 'bin';
								
								// Download the file from URL
								const downloadResponse = await this.helpers.httpRequest({
									method: 'GET',
									url,
									encoding: 'arraybuffer',
									returnFullResponse: true,
								});

								let downloadedData: Buffer;
								if (downloadResponse.body instanceof ArrayBuffer) {
									downloadedData = Buffer.from(downloadResponse.body);
								} else if (Buffer.isBuffer(downloadResponse.body)) {
									downloadedData = downloadResponse.body;
								} else {
									downloadedData = Buffer.from(downloadResponse.body || downloadResponse);
								}

								const downloadedMimeType = downloadResponse.headers?.['content-type'] || 
									downloadResponse.headers?.['Content-Type'] || 
									'application/octet-stream';

								// Return as binary data
								const binaryData = await this.helpers.prepareBinaryData(
									downloadedData,
									`${objectId}.${ext}`,
									downloadedMimeType,
								);

								returnData.push({
									json: {
										objectId,
										sessionId,
										type: 'url',
										url,
										filename: `${objectId}.${ext}`,
									},
									binary: {
										data: binaryData,
									},
								});
								continue;
							} catch (urlError) {
								throw new NodeOperationError(
									this.getNode(),
									`Failed to process URL artifact: ${urlError instanceof Error ? urlError.message : String(urlError)}`,
								);
							}
						}

						// For other types, return as binary data
						const fileName = objectId 
							? `${objectId}.${fileExtension}` 
							: `artifact_${executionId || sessionId}.${fileExtension}`;

						const binaryData = await this.helpers.prepareBinaryData(
							artifactResponse.data,
							fileName,
							mimeType,
						);

						returnData.push({
							json: {
								objectId: objectId || undefined,
								executionId: executionId || undefined,
								sessionId,
								type: objType || 'unknown',
								filename: fileName,
							},
							binary: {
								data: binaryData,
							},
						});
						continue;
					}

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
						const simplifyOutput = this.getNodeParameter('simplifyOutput', i) as boolean;
						// const maxTokens = this.getNodeParameter('maxTokens', i) as number | undefined;
						const responseFormatParam = this.getNodeParameter('responseFormat', i) as string | IDataObject | undefined;
						const jsonOutput = inputType === 'text' ? (this.getNodeParameter('jsonOutput', i) as boolean) : false;

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

						// Process file URLs
						const fileUrls: string[] = [];
						if (inputType === 'file') {
							const fileUrlsParam = this.getNodeParameter('fileUrls', i) as IDataObject;
							if (fileUrlsParam && fileUrlsParam.url) {
								const urlEntries = Array.isArray(fileUrlsParam.url) ? fileUrlsParam.url : [fileUrlsParam.url];
								for (const entry of urlEntries) {
									if (entry && typeof entry === 'object' && entry.url) {
										const url = entry.url as string;
										if (url && url.trim()) {
											fileUrls.push(url.trim());
										}
									}
								}
							}
						}

						// Build messages with support for images, videos, and files
						// For text input, don't add URLs - just use text content
						let messages: ChatMessage[] = messagesData.map((msg: IDataObject, index: number) => {
							const role = msg.role as string;
							const content = msg.content as string;
							
							// Only add URLs for non-text input types
							if (inputType !== 'text' && 
								(imageUrls.length > 0 || videoUrls.length > 0 || fileUrls.length > 0) && 
								role === 'user' && 
								index === messagesData.length - 1) {
								// Create content array with text, images, videos, and files
								const contentParts: Array<{ 
									type: 'text' | 'image_url' | 'video_url' | 'file_url'; 
									text?: string; 
									image_url?: { url: string };
									video_url?: { url: string };
									file_url?: { url: string };
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
								
								// Add all files
								for (const fileUrl of fileUrls) {
									contentParts.push({
										type: 'file_url',
										file_url: {
											url: fileUrl,
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
										'Text message content cannot be empty.',
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

						// Parse user-defined response_format if provided
						let userDefinedResponseFormat: ResponseFormat | undefined;
						if (responseFormatParam) {
							try {
								let parsed: any;
								
								// Handle both string and object inputs
								if (typeof responseFormatParam === 'string') {
									if (responseFormatParam.trim() === '') {
										parsed = undefined;
									} else {
										parsed = JSON.parse(responseFormatParam);
									}
								} else {
									parsed = responseFormatParam;
								}
								
								// Validate structure - only set if it's a valid response format object
								if (parsed && typeof parsed === 'object') {
									// Check if it's an empty object or has actual structure
									const hasType = 'type' in parsed;
									const hasSchema = 'schema' in parsed;
									
									// Only treat as valid if it has type or schema (not an empty object)
									if (hasType || hasSchema) {
										userDefinedResponseFormat = parsed as ResponseFormat;
										
										// Ensure type is set if not provided but schema exists
										if (!userDefinedResponseFormat.type && userDefinedResponseFormat.schema) {
											userDefinedResponseFormat.type = 'json_schema';
										}
										
										// Validate that if type is json_schema, schema must be provided
										if (userDefinedResponseFormat.type === 'json_schema' && !userDefinedResponseFormat.schema) {
											throw new NodeOperationError(
												this.getNode(),
												'Schema is required when type is "json_schema"',
											);
										}
										
										// For structured outputs (json_schema), ensure strict is set to true if not provided
										// This matches OpenAI's Structured Outputs format
										if (userDefinedResponseFormat.type === 'json_schema' && userDefinedResponseFormat.strict === undefined) {
											userDefinedResponseFormat.strict = true;
										}
									}
									// If it's an empty object or doesn't have type/schema, treat as undefined (ignore it)
								} else if (parsed !== undefined) {
									throw new NodeOperationError(
										this.getNode(),
										'Response format must be an object',
									);
								}
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid JSON format for response_format: ${error instanceof Error ? error.message : String(error)}. Please provide a valid JSON object with format: {"type": "json_schema", "schema": {...}}`,
								);
							}
						}

						// Set response_format if user-defined format is provided
						// For text input, jsonOutput takes precedence if enabled
						let responseFormat: ResponseFormat | undefined;
						if (userDefinedResponseFormat) {
							responseFormat = userDefinedResponseFormat;
						} else if (jsonOutput && inputType === 'text') {
							responseFormat = { type: 'json_object' };
							// Prepend system message to guide model to output JSON (like OpenAI does)
							const hasSystemMessage = messages.some((msg) => msg.role === 'system');
							if (!hasSystemMessage) {
								messages = [
									{
										role: 'system',
										content: 'You are a helpful assistant designed to output JSON.',
									},
									...messages,
								];
							}
						}

						response = await ApiService.chatCompletion(this, messages, model, undefined, responseFormat);

						console.log(JSON.stringify(response, null, 2));
						// Parse content as JSON if structured output was requested
						// This handles both jsonOutput (for text input) and user-defined responseFormat
						if (responseFormat && response && (response as any).choices) {
							(response as any).choices = (response as any).choices.map((choice: any) => {
								if (choice.message?.content && typeof choice.message.content === 'string') {
									try {
										choice.message.content = JSON.parse(choice.message.content);
									} catch (error) {
										// If parsing fails, keep as string
									}
								}
								return choice;
							});
						}

						// Simplify output if requested
						if (simplifyOutput && response && (response as any).choices && (response as any).choices.length > 0) {
							const choices = (response as any).choices;
							// Return simplified structure matching OpenAI format
							response = choices.map((choice: any, index: number) => ({
								index: choice.index !== undefined ? choice.index : index,
								message: {
									role: choice.message?.role || 'assistant',
									content: choice.message?.content || '',
									refusal: choice.message?.refusal || null,
									annotations: choice.message?.annotations || [],
								},
								logprobs: choice.logprobs || null,
								finish_reason: choice.finish_reason || 'stop',
							}));
						}

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
