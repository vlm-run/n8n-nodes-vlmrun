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
