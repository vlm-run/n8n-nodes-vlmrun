import { IDataObject } from 'n8n-workflow';
import { BaseService } from './BaseService';
import { FileRequest, ImageRequest, PredictionResponse } from '../types';
import { MAX_ATTEMPTS, RETRY_DELAY } from '../config';

export class PredictionService extends BaseService {
	async generateDocument(request: FileRequest): Promise<PredictionResponse> {
		try {
			const generateResponse = await this.client.document.generate({
				fileId: request.fileId,
				model: request.model,
				domain: request.domain as string,
				batch: request.batch,
				callbackUrl: request.callbackUrl,
			});
			return generateResponse as PredictionResponse;
		} catch (error) {
			this.handleApiError(error, 'Failed to generate document');
		}
	}

	async generateAudio(request: FileRequest): Promise<PredictionResponse> {
		try {
			const response = await this.client.audio.generate({
				fileId: request.fileId,
				model: request.model,
				domain: request.domain as string,
				batch: request.batch,
				callbackUrl: request.callbackUrl,
			});
			return response as PredictionResponse;
		} catch (error) {
			this.handleApiError(error, 'Failed to generate audio');
		}
	}

	async generateVideo(request: FileRequest): Promise<PredictionResponse> {
		try {
			const response = await this.client.video.generate({
				fileId: request.fileId,
				model: request.model,
				domain: request.domain as string,
				batch: request.batch,
				callbackUrl: request.callbackUrl,
			});
			return response as PredictionResponse;
		} catch (error) {
			this.handleApiError(error, 'Failed to generate video');
		}
	}

	async generateImage(request: ImageRequest): Promise<PredictionResponse> {
		try {
			const response = await this.client.image.generate({
				images: [`data:${request.mimeType};base64,${request.image}`],
				model: request.model,
				domain: request.domain as string,
			});
			return response as PredictionResponse;
		} catch (error) {
			this.handleApiError(error, 'Failed to generate image');
		}
	}

	async getPrediction(responseId: string): Promise<IDataObject> {
		try {
			const response = await this.client.predictions.get(responseId);
			return response as PredictionResponse;
		} catch (error) {
			this.handleApiError(error, 'Failed to get prediction response');
		}
	}

	async getPredictionWithRetry(responseId: string): Promise<IDataObject> {
		let attempts = 0;
		while (attempts < MAX_ATTEMPTS) {
			console.log(`Getting response, attempt : ${attempts}`);
			const response = await this.getPrediction(responseId);

			if (response.status === 'completed') {
				return response;
			}
			attempts++;
			await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
		}

		throw new Error('Response processing timed out');
	}
}
