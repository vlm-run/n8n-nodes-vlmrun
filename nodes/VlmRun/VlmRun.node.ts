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
import { FileRequest } from './types';
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
					{
						name: 'Upload Multiple Files',
						value: 'uploadMultiple',
						description: 'Upload multiple files at once',
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
			// Multiple Files Collection for file upload operation
			{
				displayName: 'Files to Upload',
				name: 'filesToUpload',
				type: 'fixedCollection',
				placeholder: 'Add File',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['file'],
						fileOperation: ['uploadMultiple'],
					},
				},
				default: {},
				required: true,
				description: 'Multiple files to upload',
				options: [
					{
						name: 'fileItem',
						displayName: 'File',
						values: [
							{
								displayName: 'Binary Field Name',
								name: 'binaryFieldName',
								type: 'string',
								default: 'data',
								required: true,
								description: 'Name of the binary field containing the file data',
							},
							{
								displayName: 'Custom Filename',
								name: 'customFilename',
								type: 'string',
								default: '',
								description: 'Optional: Override the filename for this file',
							},
						],
					},
				],
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
				let response: IDataObject = {};

				switch (operation) {
					case 'document':
					case 'audio':
					case 'video': {
						const model = 'vlm-1'; // Use hardcoded model value
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
						} else if (fileOperation === 'upload') {
							const file = this.getNodeParameter('file', i) as string;
							const { buffer, fileName } = await processFile(this, items[i], i, file);
							response = await ApiService.uploadUsingPresignedUrl(this, fileName, buffer);
							this.sendMessageToUI('File uploaded...');
						} else if (fileOperation === 'uploadMultiple') {
							const filesToUpload = this.getNodeParameter('filesToUpload', 0) as IDataObject;
							const fileItems = (filesToUpload.fileItem as IDataObject[]) || [];
							
							if (fileItems.length === 0) {
								throw new NodeOperationError(
									this.getNode(),
									'At least one file is required for multiple file upload',
								);
							}

							const uploadResults: IDataObject[] = [];
							let uploadCount = 0;

							for (const fileItem of fileItems) {
								const binaryFieldName = fileItem.binaryFieldName as string;
								const customFilename = fileItem.customFilename as string;
								
								try {
									const { buffer, fileName } = await processFile(this, items[i], i, binaryFieldName);
									const finalFilename = customFilename || fileName;
									
									const uploadResult = await ApiService.uploadUsingPresignedUrl(this, finalFilename, buffer);

									uploadResults.push({
										originalField: binaryFieldName,
										filename: finalFilename,
										...uploadResult,
									});

									uploadCount++;
									
									this.sendMessageToUI(`Uploaded file ${uploadCount}/${fileItems.length}: ${finalFilename}`);
								} catch (error) {
									console.log(error)
									throw new NodeOperationError(
										this.getNode(),
										`Failed to upload file from field "${binaryFieldName}": ${error.message}`,
									);
								}
							}

							response = {
								success: true,
								totalFiles: fileItems.length,
								uploadedFiles: uploadCount,
								files: uploadResults,
							};
							this.sendMessageToUI(`Successfully uploaded ${uploadCount} files`);
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
							const fileUrl = uploadRes.preview_url as string;

							if (!fileUrl) {
								throw new NodeOperationError(this.getNode(), 'Failed to obtain uploaded file URL');
							}

							filePayload = { url: fileUrl };
							this.sendMessageToUI('Single file uploaded...');
						}

						response = await ApiService.executeAgent(this, agentPrompt, filePayload, callbackUrl);
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
