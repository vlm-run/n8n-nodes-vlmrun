import { IExecuteFunctions, IDataObject, ILoadOptionsFunctions } from 'n8n-workflow';
import { FileRequest, PredictionResponse, FileResponse, ImageRequest } from './types';
import { VlmRunClient } from './VlmRunClient';
import { FileService, PredictionService, DomainService } from './services';

export class ApiService {
	private static async initializeVlmRun(ef: IExecuteFunctions): Promise<VlmRunClient> {
		const credentials = (await ef.getCredentials('vlmRunApi')) as {
			apiKey: string;
			apiBaseUrl: string;
		};

		return new VlmRunClient({
			apiKey: credentials.apiKey.trim(),
			baseURL: credentials.apiBaseUrl.trim(),
		});
	}

	private static async createServices(ef: IExecuteFunctions) {
		const client = await this.initializeVlmRun(ef);
		return {
			fileService: new FileService(ef, client),
			predictionService: new PredictionService(ef, client),
			domainService: new DomainService(ef, client),
		};
	}

	// Domain Operations
	static async getDomains(ef: ILoadOptionsFunctions): Promise<{ name: string; value: string }[]> {
		const { domainService } = await this.createServices(ef as unknown as IExecuteFunctions);
		return domainService.listDomains();
	}

	// File Operations
	static async uploadFile(
		ef: IExecuteFunctions,
		buffer: any,
		fileName: string,
	): Promise<FileResponse> {
		const { fileService } = await this.createServices(ef);
		return fileService.upload(buffer, fileName);
	}

	static async getFiles(ef: IExecuteFunctions): Promise<FileResponse[]> {
		const { fileService } = await this.createServices(ef);
		return fileService.list();
	}

	// Prediction Operations
	static async generateDocumentRequest(
		ef: IExecuteFunctions,
		request: FileRequest,
	): Promise<PredictionResponse> {
		const { predictionService } = await this.createServices(ef);
		return predictionService.generateDocument(request);
	}

	static async generateAudioRequest(
		ef: IExecuteFunctions,
		request: FileRequest,
	): Promise<PredictionResponse> {
		const { predictionService } = await this.createServices(ef);
		return predictionService.generateAudio(request);
	}

	static async generateVideoRequest(
		ef: IExecuteFunctions,
		request: FileRequest,
	): Promise<PredictionResponse> {
		const { predictionService } = await this.createServices(ef);
		return predictionService.generateVideo(request);
	}

	static async generateImageRequest(
		ef: IExecuteFunctions,
		request: ImageRequest,
	): Promise<PredictionResponse> {
		const { predictionService } = await this.createServices(ef);
		return predictionService.generateImage(request);
	}

	static async getResponse(ef: IExecuteFunctions, responseId: string): Promise<IDataObject> {
		const { predictionService } = await this.createServices(ef);
		return predictionService.getPrediction(responseId);
	}
}
