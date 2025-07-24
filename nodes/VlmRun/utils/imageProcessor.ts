import {
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
	IBinaryData,
} from 'n8n-workflow';
import { ImageRequest } from '../types';
import { ApiService } from '../ApiService';

async function processImage(
	ef: IExecuteFunctions,
	item: INodeExecutionData,
	binaryPropertyName = 'data',
): Promise<IBinaryData> {
	const binaryData = item.binary?.[binaryPropertyName];

	if (!binaryData) {
		throw new NodeOperationError(
			ef.getNode(),
			`No binary data found for property "${binaryPropertyName}"!`,
		);
	}
	return binaryData;
}

export async function processImageRequest(
	ef: IExecuteFunctions,
	item: INodeExecutionData,
	binaryPropertyName = 'data',
): Promise<any> {
	const model = 'vlm-1';
	const domain = ef.getNodeParameter('domain', 0) as string;

	const binaryData = await processImage(ef, item, binaryPropertyName);
	const imageRequest: ImageRequest = {
		image: binaryData.data,
		mimeType: binaryData.mimeType,
		model,
		domain,
	};

	return await ApiService.generateImageRequest(ef, imageRequest);
}
