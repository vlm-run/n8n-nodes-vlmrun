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
import { Resource, Model, FileRequest } from './types';
import { ApiService } from './ApiService';
import {
	fileCategories,
	vlmRunOperations,
	vlmRunOptions,
	httpOperation,
} from './constants/nodeDescription';
import { processFile, processImageRequest } from './utils';

export class VlmRun implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'VLM Run',
		name: 'vlmRun',
		icon: 'file:vlm-run.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with VLM.run API',
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
		properties: [fileCategories, ...vlmRunOperations, ...vlmRunOptions, ...httpOperation],
	};

	methods = {
		loadOptions: {
			async loadDomains(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					return await ApiService.getDomains(this);
				} catch (error) {
					console.error('Error loading domains:', error);
					throw new NodeOperationError(this.getNode(), `Failed to load domains: ${error.message}`);
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let response: IDataObject;

				switch (resource) {
					case Resource.DOCUMENT:
					case Resource.AUDIO:
					case Resource.VIDEO: {
						const model = this.getNodeParameter('model', 0) as Model.VLM_1;
						const { buffer, fileName } = await processFile(this, items[i], i);
						const domain = this.getNodeParameter('domain', 0) as string;

						// Upload file
						const fileResponse = await ApiService.uploadFile(this, buffer, fileName);
						this.sendMessageToUI('File uploaded...');

						// Generate structured output
						const request: FileRequest = {
							fileId: fileResponse.id,
							model,
							domain,
							batch: true,
							callbackUrl: this.getNodeParameter('callbackUrl', 0) as string,
						};

						let initialResponse;
						if (resource === Resource.DOCUMENT) {
							initialResponse = await ApiService.generateDocumentRequest(this, request);
						} else if (resource === Resource.AUDIO) {
							initialResponse = await ApiService.generateAudioRequest(this, request);
						} else {
							initialResponse = await ApiService.generateVideoRequest(this, request);
						}

						response = initialResponse;
						break;
					}

					case Resource.IMAGE: {
						response = await processImageRequest(this, items[i]);
						break;
					}

					case Resource.FILE: {
						const operation = this.getNodeParameter('operation', 0) as string;
						if (operation === 'fileList') {
							const files = await ApiService.getFiles(this);
							response = { files };
						} else {
							const { buffer, fileName } = await processFile(this, items[i], i);
							response = await ApiService.uploadFile(this, buffer, fileName);
							this.sendMessageToUI('File uploaded...');
						}
						break;
					}

					case Resource.HTTP: {
						response = await ApiService.makeCustomApiCall(this);
						break;
					}

					default:
						throw new NodeOperationError(
							this.getNode(),
							`The resource "${resource}" is not supported!`,
						);
				}

				returnData.push({ json: response });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error);
			}
		}

		return [returnData];
	}
}
