import { IExecuteFunctions, IHttpRequestOptions, IHttpRequestMethods } from 'n8n-workflow';

export interface VlmRunConfig {
	baseURL: string;
	agentBaseURL: string;
}

export interface Domain {
	domain: string;
}

export interface FileUploadRequest {
	file: File | Buffer;
}

export interface FileResponse {
	id: string;
	filename: string;
	bytes: number;
	purpose: string;
	created_at: string;
	object?: string;
}

export interface GenerateRequest {
	fileId?: string;
	url?: string;
	model: string;
	domain: string;
	batch?: boolean;
	callbackUrl?: string;
}

export interface ImageGenerateRequest {
	images: string[];
	model: string;
	domain: string;
}

export interface PredictionResponse {
	id: string;
	created_at: string;
	completed_at?: string;
	response?: any;
	status: string;
}

export interface AgentResponse {
	// Define based on actual API response structure
	[key: string]: any;
}

export interface AgentExecuteRequest {
	// Define based on actual API request structure
	[key: string]: any;
}

export class VlmRunClient {
	private ef: IExecuteFunctions;
	private baseURL: string;
	private agentBaseURL: string;

	constructor(ef: IExecuteFunctions, config: VlmRunConfig) {
		this.ef = ef;
		this.baseURL = config.baseURL.endsWith('/') ? config.baseURL.slice(0, -1) : config.baseURL;
		this.agentBaseURL = config.agentBaseURL.endsWith('/')
			? config.agentBaseURL.slice(0, -1)
			: config.agentBaseURL;
	}

	private async makeRequest(
		method: string,
		endpoint: string,
		data?: any,
		contentType?: string,
	): Promise<any> {
		const url = `${this.baseURL}${endpoint}`;

		const options: IHttpRequestOptions = {
			method: method as IHttpRequestMethods,
			url,
			headers: {},
		};

		if (contentType) {
			options.headers!['Content-Type'] = contentType;
		} else if (data && !(data instanceof FormData)) {
			options.headers!['Content-Type'] = 'application/json';
		}

		if (data) {
			if (data instanceof FormData) {
				// For FormData, n8n handles it automatically
				options.body = data;
			} else {
				options.body = JSON.stringify(data);
			}
		}

		try {
			const response = await this.ef.helpers.httpRequestWithAuthentication.call(
				this.ef,
				'vlmRunApi',
				options,
			);
			return response;
		} catch (error: any) {
			// Extract error details similar to the original implementation
			let errorDetail = error.message;
			if (error.response?.body) {
				try {
					const errorBody =
						typeof error.response.body === 'string'
							? JSON.parse(error.response.body)
							: error.response.body;
					errorDetail = errorBody.detail || errorBody.message || error.message;
				} catch {
					errorDetail = error.response.body || error.message;
				}
			}
			throw new Error(`HTTP ${error.response?.status || 'Error'}: ${errorDetail}`);
		}
	}

	private async makeAgentRequest(
		method: string,
		endpoint: string,
		data?: any,
		contentType?: string,
	): Promise<any> {
		const url = `${this.agentBaseURL}${endpoint}`;
		console.log('url', url);

		const options: IHttpRequestOptions = {
			method: method as IHttpRequestMethods,
			url,
			headers: {},
		};

		if (contentType) {
			options.headers!['Content-Type'] = contentType;
		} else if (data && !(data instanceof FormData)) {
			options.headers!['Content-Type'] = 'application/json';
		}

		if (data) {
			if (data instanceof FormData) {
				// For FormData, n8n handles it automatically
				options.body = data;
			} else {
				options.body = JSON.stringify(data);
			}
		}

		try {
			const response = await this.ef.helpers.httpRequestWithAuthentication.call(
				this.ef,
				'vlmRunApi',
				options,
			);
			return response;
		} catch (error: any) {
			// Extract error details similar to the original implementation
			let errorDetail = error.message;
			if (error.response?.body) {
				try {
					const errorBody =
						typeof error.response.body === 'string'
							? JSON.parse(error.response.body)
							: error.response.body;
					errorDetail = errorBody.detail || errorBody.message || error.message;
				} catch {
					errorDetail = error.response.body || error.message;
				}
			}
			throw new Error(`HTTP ${error.response?.status || 'Error'}: ${errorDetail}`);
		}
	}

	// Domains API
	public domains = {
		list: async (): Promise<Domain[]> => {
			return this.makeRequest('GET', '/domains');
		},
	};

	// Files API
	public files = {
		upload: async (request: FileUploadRequest): Promise<FileResponse> => {
			const formData = new FormData();

			if (request.file instanceof Buffer) {
				// Convert Buffer to File-like object
				const blob = new Blob([request.file]);
				formData.append('file', blob, 'uploaded-file');
			} else {
				// request.file is a File object
				formData.append('file', request.file as File);
			}

			return this.makeRequest('POST', '/files', formData);
		},

		list: async (options: { limit?: number; skip?: number } = {}): Promise<FileResponse[]> => {
			const params = new URLSearchParams();
			if (options.limit) params.append('limit', options.limit.toString());
			if (options.skip) params.append('skip', options.skip.toString());

			const queryString = params.toString();
			const endpoint = queryString ? `/files?${queryString}` : '/files';

			return this.makeRequest('GET', endpoint);
		},
	};

	// Document prediction API
	public document = {
		generate: async (request: GenerateRequest): Promise<PredictionResponse> => {
			const payload: any = {
				model: request.model,
				domain: request.domain,
			};

			if (request.fileId) {
				payload.file_id = request.fileId;
			}
			if (request.url) {
				payload.url = request.url;
			}
			if (request.batch !== undefined) {
				payload.batch = request.batch;
			}
			if (request.callbackUrl) {
				payload.callback_url = request.callbackUrl;
			}

			return this.makeRequest('POST', '/document/generate', payload);
		},
	};

	// Audio prediction API
	public audio = {
		generate: async (request: GenerateRequest): Promise<PredictionResponse> => {
			const payload: any = {
				model: request.model,
				domain: request.domain,
			};

			if (request.fileId) {
				payload.file_id = request.fileId;
			}
			if (request.url) {
				payload.url = request.url;
			}
			if (request.batch !== undefined) {
				payload.batch = request.batch;
			}
			if (request.callbackUrl) {
				payload.callback_url = request.callbackUrl;
			}

			return this.makeRequest('POST', '/audio/generate', payload);
		},
	};

	// Video prediction API
	public video = {
		generate: async (request: GenerateRequest): Promise<PredictionResponse> => {
			const payload: any = {
				model: request.model,
				domain: request.domain,
			};

			if (request.fileId) {
				payload.file_id = request.fileId;
			}
			if (request.url) {
				payload.url = request.url;
			}
			if (request.batch !== undefined) {
				payload.batch = request.batch;
			}
			if (request.callbackUrl) {
				payload.callback_url = request.callbackUrl;
			}

			return this.makeRequest('POST', '/video/generate', payload);
		},
	};

	// Image prediction API
	public image = {
		generate: async (request: ImageGenerateRequest): Promise<PredictionResponse> => {
			const payload = {
				images: request.images,
				model: request.model,
				domain: request.domain,
			};

			return this.makeRequest('POST', '/image/generate', payload);
		},
	};

	// Predictions API
	public predictions = {
		get: async (predictionId: string): Promise<PredictionResponse> => {
			return this.makeRequest('GET', `/predictions/${predictionId}`);
		},
	};

	// Agent API
	public agent = {
		get: async (): Promise<AgentResponse> => {
			return this.makeAgentRequest('GET', '/agent');
		},

		execute: async (request: AgentExecuteRequest): Promise<AgentResponse> => {
			return this.makeAgentRequest('POST', '/agent/execute', request);
		},
	};
}
