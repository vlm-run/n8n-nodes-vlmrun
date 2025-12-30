import { IExecuteFunctions, IHttpRequestOptions, IHttpRequestMethods } from 'n8n-workflow';
import { ChatCompletionRequest } from './types';
import packageJson from '../../package.json';
import { RETRY_DELAY, MAX_RETRIES, DEFAULT_TIMEOUT, CHAT_COMPLETION_TIMEOUT } from './config';

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

export interface AgentInfoResponse {
	id: string;
	name: string;
	description: string;
	prompt: string;
	json_schema?: any;
	json_sample?: any;
	created_at: string;
	updated_at?: string;
	status: string;
}

export interface AgentCreateRequest {
	name?: string;
	config: {
		prompt: string;
		json_schema?: any;
	};
	callback_url?: string;
}

export interface AgentCreateResponse {
	id: string;
	name: string;
	status: string;
	created_at: string;
	updated_at: string;
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

	private handleRequestError(error: any): never {
		// Extract error details from HTTP response
		let errorDetail = error.message || 'Unknown error';
		
		// Try to get more detailed error information
		if (error.response) {
			// Try to parse response body
			let responseBody = error.response.body;
			if (responseBody) {
				try {
					// Handle different response body formats
					if (typeof responseBody === 'string') {
						responseBody = JSON.parse(responseBody);
					} else if (Buffer.isBuffer(responseBody)) {
						responseBody = JSON.parse(responseBody.toString('utf-8'));
					} else if (responseBody instanceof ArrayBuffer) {
						responseBody = JSON.parse(Buffer.from(responseBody).toString('utf-8'));
					}
					
					errorDetail = responseBody.detail || responseBody.message || responseBody.error || errorDetail;
				} catch (parseError) {
					// If parsing fails, try to get string representation
					if (typeof responseBody === 'string') {
						errorDetail = responseBody;
					} else if (Buffer.isBuffer(responseBody)) {
						errorDetail = responseBody.toString('utf-8');
					} else {
						errorDetail = String(responseBody);
					}
				}
			}
		}

		// Throw error with status code if available, otherwise use generic error
		if (error.response?.status) {
			throw new Error(`HTTP ${error.response.status}: ${errorDetail}`);
		}
		throw new Error(errorDetail);
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
			headers: {
				'X-Client-Id': `n8n-vlmrun-${packageJson.version}`,
			},
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
			this.handleRequestError(error);
		}
	}

	private async makeAgentRequest(
		method: string,
		endpoint: string,
		data?: any,
		contentType?: string,
	): Promise<any> {
		const url = `${this.agentBaseURL}${endpoint}`;

		// Determine timeout based on endpoint
		let timeout = DEFAULT_TIMEOUT;
		if (endpoint === '/openai/chat/completions') {
			timeout = CHAT_COMPLETION_TIMEOUT;
		}

		const options: IHttpRequestOptions = {
			method: method as IHttpRequestMethods,
			url,
			headers: {
				'X-Client-Id': `n8n-vlmrun-${packageJson.version}`,
			},
			timeout,
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

		// Add retry logic for transient network errors
		let lastError: any;
		
		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			try {
				const response = await this.ef.helpers.httpRequestWithAuthentication.call(
					this.ef,
					'vlmRunApi',
					options,
				);
				return response;
			} catch (error: any) {
				lastError = error;
				
				// Check if it's a retryable error (network/timeout errors)
				const errorCode = error.code || error.cause?.code;
				const isRetryable = 
					errorCode === 'ETIMEDOUT' || 
					errorCode === 'ECONNRESET' || 
					errorCode === 'EPIPE' ||
					(!error.response && attempt < MAX_RETRIES); // Network errors without response
				
				if (isRetryable && attempt < MAX_RETRIES) {
					const delay = RETRY_DELAY * attempt; // Exponential backoff
					await new Promise(resolve => setTimeout(resolve, delay));
					continue;
				}
				
				// Not retryable or max retries reached, so break the loop
				break;
			}
		}
		
		// All retries exhausted or a non-retryable error occurred
		this.handleRequestError(lastError);
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
				const blob = new Blob([new Uint8Array(request.file)]);
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

	// Chat Completion API
	public chat = {
		completions: async (request: ChatCompletionRequest): Promise<any> => {
			const endpoint = '/openai/chat/completions';
			return this.makeAgentRequest('POST', endpoint, request);
		},
	};

	// Agent API
	public agent = {
		get: async (): Promise<AgentInfoResponse[]> => {
			return this.makeAgentRequest('GET', '/agent');
		},

		detail: async (id: string): Promise<AgentInfoResponse> => {
			return this.makeAgentRequest('GET', `/agent/lookup`, { id });
		},

		execute: async (request: AgentExecuteRequest): Promise<AgentResponse> => {
			return this.makeAgentRequest('POST', '/agent/execute', request);
		},

		create: async (request: AgentCreateRequest): Promise<AgentResponse> => {
			return this.makeAgentRequest('POST', '/agent/create', request);
		},

		generatePresignedUrl: async (request: AgentExecuteRequest): Promise<AgentResponse> => {
			return this.makeAgentRequest('POST', '/files/presigned-url', request);
		},

		uploadToPresignedUrl: async (request: AgentExecuteRequest): Promise<void> => {
			const buff: Buffer = request.buffer as unknown as Buffer;
			const contentType: string =
				(request.contentType as string) ||
				(request.buffer?.mimeType as string) ||
				'application/octet-stream';

			return this.ef.helpers.httpRequest.call(this.ef, {
				method: 'PUT',
				url: request.url as string,
				body: buff,
				headers: {
					'Content-Type': contentType,
					'Content-Length': String(buff.length),
				},
				encoding: null as unknown as undefined,
			});
		},
	};

	// Artifacts API
	public artifacts = {
		get: async (params: {
			objectId: string;
			sessionId: string;
		}): Promise<{ data: Buffer; contentType?: string }> => {
			const { objectId, sessionId } = params;

			// Validate required fields
			if (!objectId || objectId.trim() === '') {
				throw new Error('`objectId` is required and cannot be empty');
			}
			if (!sessionId || sessionId.trim() === '') {
				throw new Error('`sessionId` is required and cannot be empty');
			}

			// Ensure baseURL doesn't have trailing slash
			const baseURL = this.agentBaseURL.endsWith('/') 
				? this.agentBaseURL.slice(0, -1) 
				: this.agentBaseURL;
			
			// Build request body as JSON (matching curl -d format)
			const requestBody = {
				object_id: objectId.trim(),
				session_id: sessionId.trim(),
			};
			const requestBodyString = JSON.stringify(requestBody);
			
			const url = `${baseURL}/artifacts`;
			
			// Get credentials to manually add Authorization header
			const credentials = (await this.ef.getCredentials('vlmRunApi')) as {
				apiKey: string;
			};
			
			// Use axios directly to send GET request with body (matching SDK approach)
			// n8n's httpRequest doesn't send bodies with GET requests, so we need axios
			try {
				// Dynamically import axios (it should be available in n8n's environment)
				const axios = require('axios');
				
				// Use axios() with method: 'GET' and data to send body with GET request
				// axios.get() doesn't support body, so we use the general axios() method
				const response = await axios({
					method: 'GET',
					url,
					headers: {
						'X-Client-Id': `n8n-vlmrun-${packageJson.version}`,
						'accept': 'application/json',
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${credentials.apiKey}`,
					},
					data: requestBodyString, // Request body
					responseType: 'arraybuffer',
					timeout: DEFAULT_TIMEOUT,
				});
				

				// Axios response structure: response.data contains the body
				let data: Buffer;
				if (response.data instanceof ArrayBuffer) {
					data = Buffer.from(response.data);
				} else if (Buffer.isBuffer(response.data)) {
					data = response.data;
				} else {
					data = Buffer.from(response.data || response.data);
				}

				const contentType = response.headers?.['content-type'] || response.headers?.['Content-Type'];

				return { data, contentType };
			} catch (error: any) {
				// Log detailed error information for debugging
				console.log('Artifacts Request Error:', {
					message: error.message,
					status: error.response?.status,
					statusText: error.response?.statusText,
					headers: error.response?.headers,
				});
				
				// Try to get error response body - n8n might store it differently
				let errorBody: any = error.response?.body;
				if (!errorBody && error.response) {
					// Try to get from response data
					errorBody = error.response.data || error.response.body;
				}
				
				if (errorBody) {
					try {
						let errorBodyString: string;
						if (Buffer.isBuffer(errorBody)) {
							errorBodyString = errorBody.toString('utf-8');
						} else if (errorBody instanceof ArrayBuffer) {
							errorBodyString = Buffer.from(errorBody).toString('utf-8');
						} else if (typeof errorBody === 'string') {
							errorBodyString = errorBody;
						} else {
							errorBodyString = JSON.stringify(errorBody);
						}
						
						console.log('Error Response Body:', errorBodyString);
						
						try {
							const parsed = JSON.parse(errorBodyString);
							console.log('Error Response Body (parsed):', JSON.stringify(parsed, null, 2));
							// Update error message with API's error details
							if (parsed.detail || parsed.message) {
								error.message = parsed.detail || parsed.message;
							}
						} catch {
							console.log('Error Response Body (raw string):', errorBodyString);
						}
					} catch (parseError) {
						console.log('Could not process error response body:', parseError);
					}
				} else {
					console.log('No error response body found');
				}
				
				this.handleRequestError(error);
			}
		},
	};
}
