export interface VlmRunConfig {
	apiKey: string;
	baseURL: string;
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

export class VlmRunClient {
	private apiKey: string;
	private baseURL: string;

	constructor(config: VlmRunConfig) {
		this.apiKey = config.apiKey;
		this.baseURL = config.baseURL.endsWith('/') ? config.baseURL.slice(0, -1) : config.baseURL;
	}

	private async makeRequest(
		method: string,
		endpoint: string,
		data?: any,
		contentType?: string,
	): Promise<any> {
		const url = `${this.baseURL}${endpoint}`;
		const headers: Record<string, string> = {
			Authorization: `Bearer ${this.apiKey}`,
		};

		if (contentType) {
			headers['Content-Type'] = contentType;
		} else if (data && !(data instanceof FormData)) {
			headers['Content-Type'] = 'application/json';
		}

		const config: RequestInit = {
			method,
			headers,
		};

		if (data) {
			if (data instanceof FormData) {
				config.body = data;
			} else {
				config.body = JSON.stringify(data);
			}
		}

		const response = await fetch(url, config);

		if (!response.ok) {
			const errorText = await response.text();
			let errorDetail;
			try {
				const errorJson = JSON.parse(errorText);
				errorDetail = errorJson.detail || errorJson.message || errorText;
			} catch {
				errorDetail = errorText;
			}
			throw new Error(`HTTP ${response.status}: ${errorDetail}`);
		}

		return response.json();
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
}
