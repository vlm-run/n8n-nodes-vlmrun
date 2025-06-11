import {
    IExecuteFunctions,
    INodeExecutionData,
    NodeOperationError,
    IBinaryData,
} from 'n8n-workflow';
import { ImageRequest } from '../types';
import { ApiService } from '../ApiService';

async function processImage(ef: IExecuteFunctions, item: INodeExecutionData): Promise<IBinaryData> {
    const binaryData = item.binary?.data;

    if (!binaryData) {
        throw new NodeOperationError(ef.getNode(), 'No binary data found!');
    }
    return binaryData;
}

export async function processImageRequest(ef: IExecuteFunctions, item: INodeExecutionData): Promise<any> {
    const model = ef.getNodeParameter('model', 0) as string;
    const domain = ef.getNodeParameter('domain', 0) as string;

    const binaryData = await processImage(ef, item);
    const imageRequest: ImageRequest = {
        image: binaryData.data,
        mimeType: binaryData.mimeType,
        model,
        domain,
    };

    return await ApiService.generateImageRequest(ef, imageRequest);
}