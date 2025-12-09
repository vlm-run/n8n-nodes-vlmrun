import { IDataObject } from 'n8n-workflow';

export interface FileRequest {
	fileId: string;
	model: string;
	domain?: string;
	batch?: boolean;
	session_id?: string;
	callbackUrl?: string;
}

export interface ImageRequest {
	fileId?: string;
	image: string;
	mimeType: string;
	model: string;
	domain?: string;
}

export interface PredictionResponse extends IDataObject {
	id: string;
	created_at: string;
	completed_at?: string;
	response?: any;
	status: string;
}

export interface FileResponse extends IDataObject {
	id: string;
	filename: string;
	bytes: number;
	purpose: string;
	created_at: string;
	object?: string;
}

export interface ChatMessage {
	role: string;
	content: string | Array<{
		type: 'text' | 'image_url' | 'video_url';
		text?: string;
		image_url?: {
			url: string;
		};
		video_url?: {
			url: string;
		};
	}>;
}

export interface ResponseFormat {
	type: 'json_schema' | string;
	schema?: IDataObject;
}

export interface ChatCompletionRequest {
	messages: ChatMessage[];
	model: string;
	max_tokens?: number;
	response_format?: ResponseFormat;
}