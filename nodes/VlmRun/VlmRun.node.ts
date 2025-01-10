import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	IDataObject,
	INodeTypeDescription,
	NodeOperationError,
	IBinaryData,
} from 'n8n-workflow';
import {
	generateDocumentRequest,
	generateImageRequest,
	generateWebpageRequest,
	getResponseWithRetry,
	getFiles,
	uploadFile,
	generateAudioRequest,
	generateDocumentEmbedding,
	generateImageEmbedding,
	makeCustomApiCall,
} from './ApiService';
import {
	DocumentRequest,
	Resource,
	Operation,
	ImageRequest,
	OperationToDomain,
	WebpagePredictionRequest,
	AudioRequest,
	DocumentEmbeddingRequest,
	ImageEmbeddingRequest,
	Model,
} from './types';
import { vlmRunOperations, vlmRunOptions, vlmRunResources, httpOperation } from './VlmRunDescription';

export class VlmRun implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'VLM Run',
		name: 'vlmRun',
		icon: 'file:vlm-run.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]',
		description: 'Interact with VLM.run API',
		defaults: {
			name: 'VLM Run',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'vlmRunApi',
				required: true,
			},
		],

		properties: [vlmRunResources, ...vlmRunOperations, ...vlmRunOptions, ...httpOperation],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === Resource.DOCUMENT_AI) {
					const validDocumentOperations = [
						Operation.RESUME_PARSER,
						Operation.INVOICE_PARSER,
						Operation.PRESENTATION_PARSER,
						Operation.FORM_FILLING,
					];
					const model = this.getNodeParameter('model', 0) as Model.VLM_1;
					if (validDocumentOperations.includes(operation)) {
						console.log('Started Operation - ', operation);
						const item = items[i];

						const { buffer, fileName } = await processFile(this, item, i);

						// Step 1: Upload file
						const fileResponse = await uploadFile(this, buffer, fileName);
						this.sendMessageToUI('File uploaded...');

						// Step 2: Generate structured output
						// If batch is false, response is returned synchronously, otherwise asynchronously
						const documentRequest: DocumentRequest = {
							fileId: fileResponse.id,
							model: model,
							domain: OperationToDomain[operation],
							batch: false,
						};
						const initialResponse = await generateDocumentRequest(this, documentRequest);
						console.log('Initial Response - ', initialResponse);
						if (initialResponse.status === 'completed') {
							returnData.push({
								json: initialResponse,
							});
							continue;
						}

						// Step 3: Check response every RETRY_DELAY milliseconds for MAX_ATTEMPTS
						const documentResponse = await getResponseWithRetry(this, initialResponse.id);

						returnData.push({
							json: documentResponse,
						});
					}
				} else if (resource === Resource.AUDIO_AI) {
					if (operation === Operation.AUDIO_TRANSCRIPTION) {
						const model = this.getNodeParameter('model', 0) as AudioRequest['model'];
						console.log('Started Operation - ', operation);
						const item = items[i];

						const { buffer, fileName } = await processFile(this, item, i);

						// Step 1: Upload file
						const fileResponse = await uploadFile(this, buffer, fileName);
						this.sendMessageToUI('File uploaded...');

						// Step 2: Generate structured output
						const audioRequest: AudioRequest = {
							fileId: fileResponse.id,
							model: model,
							domain: OperationToDomain[operation] as AudioRequest['domain'],
							batch: false,
						};
						const initialResponse = await generateAudioRequest(this, audioRequest);
						console.log('Initial Response - ', initialResponse);
						if (initialResponse.status === 'completed') {
							returnData.push({
								json: initialResponse,
							});
							continue;
						}

						// Step 3: Check response every RETRY_DELAY milliseconds for MAX_ATTEMPTS
						const audioResponse = await getResponseWithRetry(this, initialResponse.id);

						returnData.push({
							json: audioResponse,
						});
					}
				} else if (resource === Resource.IMAGE_AI) {
					if (
						operation === Operation.IMAGE_CATALOGING ||
						operation === Operation.IMAGE_CAPTIONING
					) {
						console.log('Started Operation - ', operation);
						const item = items[i];
						const imageResponse = await imageRequest(this, item);
						returnData.push({
							json: imageResponse,
						});
					}
				} else if (resource === Resource.AGENT_AI) {
					const model = this.getNodeParameter('model', 0) as WebpagePredictionRequest['model'];
					if (
						operation === Operation.GITHUB_AGENT ||
						operation === Operation.MARKET_RESEARCH_AGENT
					) {
						console.log('Started Operation - ', operation);
						const url = this.getNodeParameter('url', 0) as string;
						const mode = this.getNodeParameter('mode', 0) as 'fast' | 'accurate';

						const webpageRequest: WebpagePredictionRequest = {
							url: url,
							model: model,
							domain: OperationToDomain[operation],
							mode: mode,
						};
						const webpageResponse = await generateWebpageRequest(this, webpageRequest);
						returnData.push({
							json: webpageResponse,
						});
					}
				} else if (resource === Resource.EXPERIMENTAL) {
					const model = this.getNodeParameter('model', 0) as DocumentEmbeddingRequest['model'];
					if (operation === Operation.DOCUMENT_EMBEDDING) {
						console.log('Started Operation - ', operation);
						const item = items[i];

						const { buffer, fileName } = await processFile(this, item, i);

						// Step 1: Upload file
						const fileResponse = await uploadFile(this, buffer, fileName);
						this.sendMessageToUI('File uploaded...');

						// Step 2: Generate structured output
						const documentRequest: DocumentEmbeddingRequest = {
							fileId: fileResponse.id,
							model: model,
							batch: false,
						};
						const initialResponse = await generateDocumentEmbedding(this, documentRequest);
						console.log('Initial Response - ', initialResponse);
						if (initialResponse.status === 'completed') {
							returnData.push({
								json: initialResponse,
							});
							continue;
						}

						// Step 3: Check response every RETRY_DELAY milliseconds for MAX_ATTEMPTS
						const documentResponse = await getResponseWithRetry(this, initialResponse.id);

						returnData.push({
							json: documentResponse,
						});
					} else if (operation === Operation.IMAGE_EMBEDDING) {
						console.log('Started Operation - ', operation);
						const item = items[i];
						const imageResponse = await imageEmbedding(this, item);
						returnData.push({
							json: imageResponse,
						});
					}
				} else if (resource === Resource.FILE) {
					if (operation === Operation.FILE_LIST) {
						const files = await getFiles(this);
						returnData.push({
							json: { files: files },
						});
					} else if (operation === Operation.FILE_UPLOAD) {
						console.log('Started Operation - ', operation);
						const item = items[i];
						const { buffer, fileName } = await processFile(this, item, i);
						const fileResponse = await uploadFile(this, buffer, fileName);
						returnData.push({
							json: fileResponse,
						});
						this.sendMessageToUI('File uploaded...');
					}
				} else if (resource === Resource.HTTP) {
					const response = await makeCustomApiCall(this);

					returnData.push({
						json: response,
					});
				}
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

async function processFile(
	ef: IExecuteFunctions,
	nodeData: INodeExecutionData,
	i: number,
): Promise<{ buffer: any; fileName: any }> {
	const binaryFile = ef.getNodeParameter('file', 0) as string;

	if (!nodeData.binary) {
		throw new NodeOperationError(ef.getNode(), 'No binary data exists on item!');
	}

	const binaryData = nodeData.binary[binaryFile];
	if (binaryData === undefined) {
		throw new NodeOperationError(
			ef.getNode(),
			`No binary data property "${binaryFile}" does not exists on item!`,
		);
	}

	const buffer = await ef.helpers.getBinaryDataBuffer(i, binaryFile);
	const fileName = binaryData.fileName;
	return { buffer, fileName };
}

async function processImage(ef: IExecuteFunctions, item: INodeExecutionData): Promise<IBinaryData> {
	const binaryData = item.binary?.data;

	if (!binaryData) {
		throw new NodeOperationError(ef.getNode(), 'No binary data found!');
	}
	return binaryData;
}

async function imageRequest(ef: IExecuteFunctions, item: INodeExecutionData): Promise<IDataObject> {
	const model = ef.getNodeParameter('model', 0) as ImageRequest['model'];
	const operation = ef.getNodeParameter('operation', 0) as string;

	const binaryData = await processImage(ef, item);
	const imageRequest: ImageRequest = {
		image: binaryData.data,
		mimeType: binaryData.mimeType,
		model: model,
		domain: OperationToDomain[operation],
	};
	console.log('imageRequest - ', imageRequest);
	return await generateImageRequest(ef, imageRequest);
}

async function imageEmbedding(
	ef: IExecuteFunctions,
	item: INodeExecutionData,
): Promise<IDataObject> {
	const model = ef.getNodeParameter('model', 0) as ImageEmbeddingRequest['model'];

	const binaryData = await processImage(ef, item);

	const imageRequest: ImageEmbeddingRequest = {
		image: binaryData.data,
		mimeType: binaryData.mimeType,
		model: model,
	};
	console.log('imageEmbeddingRequest - ', imageRequest);
	return await generateImageEmbedding(ef, imageRequest);
}
