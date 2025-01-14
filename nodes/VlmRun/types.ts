import { IDataObject } from 'n8n-workflow';

export interface DocumentRequest {
	fileId: string;
	model: Model.VLM_1;
	domain?: Domain
	batch?: boolean;
	session_id?: string;
}

export interface DocumentEmbeddingRequest {
	fileId: string;
	model: Model.VLM_1_EMBEDDINGS;
	domain?: Domain
	batch?: boolean;
	session_id?: string;
}

export interface ImageRequest {
	fileId?: string;
	image: string;
	mimeType: string;
	model: Model.VLM_1;
	domain?: Domain
}

export interface ImageEmbeddingRequest {
	fileId?: string;
	image: string;
	mimeType: string;
	model: Model.VLM_1_EMBEDDINGS;
	domain?: Domain;
}

export interface AudioRequest {
	fileId: string;
	model: Model.VLM_1;
	domain?: Domain.AudioTranscription;
	batch?: boolean;
	session_id?: string;
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

export interface WebpagePredictionRequest {
	url: string;
	model: Model.VLM_1;
	domain?: string;
	mode: 'fast' | 'accurate';
}

export const Resource = {
	DOCUMENT_AI: 'documentAi',
	AUDIO_AI: 'audioAi',
	IMAGE_AI: 'imageAi',
	AGENT_AI: 'agentAi',
	FILE: 'file',
	EXPERIMENTAL: 'experimental',
	HTTP: 'http',
};

export const Operation = {
	RESUME_PARSER: 'resumeParser',
	INVOICE_PARSER: 'invoiceParser',
	PRESENTATION_PARSER: 'presentationParser',
	FORM_FILLING: 'formFilling',
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
};



export enum Model {
	VLM_1 = 'vlm-1',
	VLM_1_EMBEDDINGS = 'vlm-1-embeddings',
}

export enum Domain {
	// Public schemas
	DocumentGenerative = 'document.generative',
	DocumentPresentation = 'document.presentation',
	DocumentVisualGrounding = 'document.visual-grounding',

	// Document extraction
	DocumentInvoice = 'document.invoice',
	DocumentResume = 'document.resume',
	DocumentHealthInsuranceCard = 'document.health-insurance-card',
	DocumentDriversLicense = 'document.drivers-license',
	DocumentReceipt = 'document.receipt',

	// Document schema extraction
	DocumentSchemaCreation = 'document.schema-creation',

	// Document with paragraphs, tables, charts, etc.
	DocumentPdf = 'document.pdf',
	DocumentFile = 'document.file',
	DocumentPdfAutofill = 'document.pdf-autofill',
	DocumentHardwareSpecSheet = 'document.hardware-spec-sheet',

	// Audio
	AudioTranscription = 'audio.transcription',

	// Image
	ImageEmbeddings = 'image.embeddings',
	ImageCaptioning = 'image.caption',
	// Video
	VideoTranscription = 'video.transcription',
	VideoEmbeddings = 'video.embeddings',
	VideoGenerativeEmbeddings = 'video.generative-embeddings',

	// Experimental / sports
	SportsNfl = 'sports.nfl',
	SportsNba = 'sports.nba',
	SportsSoccer = 'sports.soccer',

	// Experimental / TV
	VideoTvNews = 'video.tv-news',
	VideoTvIntelligence = 'video.tv-intelligence',

	// Experimental / web + social
	WebEcommerceProductCatalog = 'web.ecommerce-product-catalog',
	WebGithubDeveloperStats = 'web.github-developer-stats',
	WebMarketResearch = 'web.market-research',
	SocialTwitterCard = 'social.twitter-card',

	// Experimental / multi-modal RAG
	DocumentMultimodalEmbeddings = 'document.multimodal-embeddings',
	DocumentMultimodalRag = 'document.multimodal-rag',
}

//create operation to domain mapping
export const OperationToDomain = {
	[Operation.RESUME_PARSER]: Domain.DocumentResume,
	[Operation.INVOICE_PARSER]: Domain.DocumentInvoice,
	[Operation.PRESENTATION_PARSER]: Domain.DocumentPresentation,
	[Operation.FORM_FILLING]: Domain.DocumentPdfAutofill,
	[Operation.IMAGE_CAPTIONING]: Domain.DocumentGenerative,
	// [Operation.IMAGE_CAPTIONING]: Domain.ImageCaptioning,
	[Operation.GITHUB_AGENT]: Domain.WebGithubDeveloperStats,
	[Operation.MARKET_RESEARCH_AGENT]: Domain.WebMarketResearch,
};
