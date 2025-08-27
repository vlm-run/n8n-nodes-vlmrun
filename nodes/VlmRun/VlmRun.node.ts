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
			// File field for document, image, audio, video, and executeAgent operations
			{
				displayName: 'File',
				name: 'file',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['document', 'image', 'audio', 'video', 'executeAgent'],
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
				displayName: 'Agent Prompt',
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
			{
				displayName: 'Process Asynchronously',
				name: 'processAsynchronously',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['document', 'audio', 'video', 'executeAgent'],
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
						operation: ['document', 'image', 'audio', 'video', 'executeAgent'],
						processAsynchronously: [true],
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
				let response: IDataObject;

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
						} else {
							const file = this.getNodeParameter('file', i) as string;
							const { buffer, fileName } = await processFile(this, items[i], i, file);
							response = await ApiService.uploadFile(this, buffer, fileName);
							this.sendMessageToUI('File uploaded...');
						}
						break;
					}

					case 'executeAgent': {
						const agentPrompt = this.getNodeParameter('agentPrompt', 0) as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', 0) as string;

						const file = this.getNodeParameter('file', i) as string;
						const { buffer, fileName } = await processFile(this, items[i], i, file);
						
						const uploadRes = (await ApiService.uploadUsingPresignedUrl(this, fileName, buffer)) as IDataObject;
						const fileUrl = uploadRes.url as string;

						if (!fileUrl) {
							throw new NodeOperationError(this.getNode(), 'Failed to obtain uploaded file URL');
						}
												
						response = await ApiService.executeAgent(this, agentPrompt, { url: fileUrl }, callbackUrl);
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
