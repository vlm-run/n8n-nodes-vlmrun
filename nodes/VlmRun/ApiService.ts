import {
	IExecuteFunctions,
	IDataObject,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
} from 'n8n-workflow';
import {
	FileRequest,
	PredictionResponse,
	FileResponse,
	ImageRequest,
} from './types';
import { VlmRun } from 'vlmrun';
import {
	FileService,
	PredictionService,
	HttpService,
	DomainService,
} from './services';

export class ApiService {
	private static async initializeVlmRun(ef: IExecuteFunctions): Promise<VlmRun> {
		const credentials = await ef.getCredentials('vlmRunApi') as { apiKey: string; apiBaseUrl: string };
		return new VlmRun({
			apiKey: credentials.apiKey.trim(),
			baseURL: credentials.apiBaseUrl.trim(),
		});
	}

	private static async createServices(ef: IExecuteFunctions) {
		const client = await this.initializeVlmRun(ef);
		return {
			fileService: new FileService(ef, client),
			predictionService: new PredictionService(ef, client),
			httpService: new HttpService(ef, client),
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

	static async getResponse(
		ef: IExecuteFunctions,
		responseId: string,
	): Promise<IDataObject> {
		const { predictionService } = await this.createServices(ef);
		return predictionService.getPrediction(responseId);
	}

	static async getResponseWithRetry(
		ef: IExecuteFunctions,
		responseId: string,
	): Promise<IDataObject> {
		const { predictionService } = await this.createServices(ef);
		return predictionService.getPredictionWithRetry(responseId);
	}

	// HTTP Operations
	static async makeCustomApiCall(ef: IExecuteFunctions) {
		const { httpService } = await this.createServices(ef);
		const url = ef.getNodeParameter('url', 0) as string;
		const method = ef.getNodeParameter('operation', 0) as IHttpRequestMethods;
		const isHeaderRequired = ef.getNodeParameter('isHeaderRequired', 0) as boolean;
		const isQueryParamRequired = ef.getNodeParameter('isQueryParamRequired', 0) as boolean;
		const isBodyRequired = method === 'POST' ? ef.getNodeParameter('isBodyRequired', 0) as boolean : false;
		const typeofData = isBodyRequired ? ef.getNodeParameter('typeofData', 0) as 'jsonData' | 'formData' : undefined;

		let headers;
		let queryParams;
		let body;

		if (isHeaderRequired) {
			headers = (ef.getNodeParameter('headers', 0) as any).header;
		}

		if (isQueryParamRequired) {
			queryParams = (ef.getNodeParameter('params', 0) as any).param;
		}

		if (isBodyRequired && typeofData === 'jsonData') {
			const bodyData = (ef.getNodeParameter('jsonBody', 0) as any).json;
			if (bodyData) {
				const jsonBody: Record<string, any> = {};
				bodyData.forEach((item: { key: string; value: any }) => {
					jsonBody[item.key] = typeof item.value === 'string' ?
						(item.value.startsWith('{') ? JSON.parse(item.value) : item.value) :
						item.value;
				});
				body = JSON.stringify(jsonBody);
			}
		}

		return httpService.makeRequest({
			url,
			method,
			headers,
			queryParams,
			body,
			isBodyRequired,
			typeofData,
		});
	}
}
