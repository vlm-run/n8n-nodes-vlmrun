import { IDataObject } from 'n8n-workflow';

export interface FileRequest {
	fileId: string;
	model: Model.VLM_1;
	domain?: string;
	batch?: boolean;
	session_id?: string;
	callbackUrl?: string;
}

export interface ImageRequest {
	fileId?: string;
	image: string;
	mimeType: string;
	model: Model.VLM_1;
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

export const Resource = {
	DOCUMENT: 'document',
	IMAGE: 'image',
	VIDEO: 'video',
	AUDIO: 'audio',
	FILE: 'file',
	HTTP: 'http',
};

export const Operation = {
	RESUME_PARSER: 'resumeParser',
	INVOICE_PARSER: 'invoiceParser',
	PRESENTATION_PARSER: 'presentationParser',
	UTILITY_BILL_PARSER: 'utilityBillParser',
	FORM_FILLING: 'formFilling',
	PRODUCT_CATALOG_PARSER: 'productCatalogParser',
	US_DRIVER_LICENSE_PARSER: 'usDriverLicenseParser',
	IMAGE_CATALOGING: 'imageCataloging',
	IMAGE_CAPTIONING: 'imageCaptioning',
	FILE_LIST: 'fileList',
	FILE_UPLOAD: 'fileUpload',
	GITHUB_AGENT: 'githubAgent',
	LINKEDIN_AGENT: 'linkedinAgent',
	MARKET_RESEARCH_AGENT: 'marketResearchAgent',
	WEB_GENERATION: 'webGeneration',
	AUDIO_TRANSCRIPTION: 'audioTranscription',
	IMAGE_EMBEDDING: 'imageEmbedding',
	DOCUMENT_EMBEDDING: 'documentEmbedding',
	GET: 'GET',
	POST: 'POST',
	OTHER: 'other',
};

export enum Model {
	VLM_1 = 'vlm-1',
	VLM_1_EMBEDDINGS = 'vlm-1-embeddings',
}
