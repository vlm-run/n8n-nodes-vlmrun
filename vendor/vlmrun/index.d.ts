import { ZodType } from 'zod';
import { RawAxiosResponseHeaders, AxiosResponseHeaders } from 'axios';

interface Client {
    apiKey: string;
    baseURL: string;
    timeout?: number;
    maxRetries?: number;
}
declare class APIRequestor {
    private client;
    private axios;
    private timeout;
    private maxRetries;
    constructor(client: Client);
    request<T>(method: string, url: string, params?: Record<string, any>, data?: any, files?: {
        [key: string]: any;
    }): Promise<[T, number, Record<string, string>]>;
}

type JobStatus = string;
type FilePurpose = string;
type DetailLevel = string;
interface FileResponse {
    id: string;
    filename: string;
    bytes: number;
    purpose: FilePurpose;
    created_at: string;
    object: "file";
}
interface PresignedUrlResponse {
    id?: string;
    url?: string;
    filename?: string;
    expiration?: number;
    method?: string;
    content_type?: string;
    created_at: string;
}
interface CreditUsage {
    elements_processed?: number;
    element_type?: "image" | "page" | "video" | "audio";
    credits_used?: number;
}
interface ModelInfoResponse {
    model: string;
    domain: string;
}
interface PredictionResponse {
    id: string;
    created_at: string;
    completed_at?: string;
    response?: any;
    status: JobStatus;
    message?: string;
    usage?: CreditUsage;
}
interface ListParams {
    skip?: number;
    limit?: number;
}
interface FileUploadParams {
    filePath?: string;
    file?: File;
    purpose?: string;
    checkDuplicate?: boolean;
    method?: "auto" | "direct" | "presigned-url";
    expiration?: number;
    force?: boolean;
}
interface PredictionGenerateParams {
    model?: string;
    domain: string;
    config?: GenerationConfigParams;
    metadata?: RequestMetadataParams;
    callbackUrl?: string;
}
type RequestMetadataParams = {
    environment?: "dev" | "staging" | "prod";
    sessionId?: string | null;
    allowTraining?: boolean;
};
declare class RequestMetadata {
    /**
     * The environment where the request was made.
     */
    environment: "dev" | "staging" | "prod";
    /**
     * The session ID of the request
     */
    sessionId: string | null;
    /**
     * Whether the file can be used for training
     */
    allowTraining: boolean;
    constructor(params?: Partial<RequestMetadata>);
    /**
     * Creates the metadata object in the format expected by the API
     */
    toJSON(): {
        environment: "dev" | "staging" | "prod";
        session_id: string | null;
        allow_training: boolean;
    };
}
type RequestMetadataInput = RequestMetadata | RequestMetadataParams;
type GenerationConfigParams = {
    detail?: "auto" | "hi" | "lo";
    responseModel?: ZodType;
    zodToJsonParams?: any;
    jsonSchema?: Record<string, any> | null;
    confidence?: boolean;
    grounding?: boolean;
    gqlStmt?: string | null;
};
declare class GenerationConfig {
    /**
     * The detail level to use for processing the images or documents.
     */
    detail: "auto" | "hi" | "lo";
    /**
     * The JSON schema to use for the model.
     */
    jsonSchema: Record<string, any> | null;
    /**
     * Include confidence scores in the response (included in the `_metadata` field).
     */
    confidence: boolean;
    /**
     * Include grounding in the response (included in the `_metadata` field).
     */
    grounding: boolean;
    /**
     * The GraphQL statement to use for the model.
     */
    gqlStmt: string | null;
    constructor(params?: Partial<GenerationConfig>);
    /**
     * Creates the config object in the format expected by the API
     */
    toJSON(): {
        detail: "auto" | "hi" | "lo";
        json_schema: Record<string, any> | null;
        confidence: boolean;
        grounding: boolean;
        gql_stmt: string | null;
    };
}
type GenerationConfigInput = GenerationConfig | GenerationConfigParams;
interface SchemaResponse {
    json_schema: Record<string, any>;
    schema_version: string;
    schema_hash: string;
    domain: string;
    gql_stmt: string;
    description: string;
}
interface ImagePredictionParams extends PredictionGenerateParams {
    batch?: boolean;
    images?: string[];
    urls?: string[];
}
interface FilePredictionParams extends PredictionGenerateParams {
    batch?: boolean;
    fileId?: string;
    url?: string;
}
interface FilePredictionSchemaParams {
    fileId?: string;
    url?: string;
}
interface WebPredictionParams extends PredictionGenerateParams {
    url: string;
    mode: "fast" | "accurate";
}
interface FinetuningResponse {
    id: string;
    created_at: string;
    completed_at?: string;
    status: JobStatus;
    model: string;
    training_file_id: string;
    validation_file_id?: string;
    num_epochs: number;
    batch_size: number | string;
    learning_rate: number;
    suffix?: string;
    wandb_url?: string;
    message?: string;
}
interface FinetuningProvisionResponse {
    id: string;
    created_at: string;
    model: string;
    duration: number;
    concurrency: number;
    status: JobStatus;
    message?: string;
}
interface FinetuningCreateParams {
    callbackUrl?: string;
    model: string;
    trainingFile: string;
    validationFile?: string;
    numEpochs?: number;
    batchSize?: number | string;
    learningRate?: number;
    suffix?: string;
    wandbApiKey?: string;
    wandbBaseUrl?: string;
    wandbProjectName?: string;
}
interface FinetuningGenerateParams {
    images: string[];
    model: string;
    prompt?: string;
    domain?: string;
    jsonSchema?: Record<string, any>;
    maxNewTokens?: number;
    temperature?: number;
    detail?: "auto" | "hi" | "lo";
    batch?: boolean;
    metadata?: Record<string, any>;
    callbackUrl?: string;
    maxRetries?: number;
    maxTokens?: number;
    confidence?: boolean;
    grounding?: boolean;
    environment?: string;
    sessionId?: string;
    allowTraining?: boolean;
    responseModel?: string;
}
interface FinetuningProvisionParams {
    model: string;
    duration?: number;
    concurrency?: number;
}
interface FinetuningListParams {
    skip?: number;
    limit?: number;
}
interface DatasetListParams {
    skip?: number;
    limit?: number;
}
interface HubInfoResponse {
    version: string;
}
interface DomainInfo {
    domain: string;
    name: string;
    description: string;
}
interface HubSchemaResponse {
    json_schema: Record<string, any>;
    schema_version: string;
    schema_hash: string;
    domain: string;
    gql_stmt: string;
    description: string;
}
interface DatasetResponse {
    id: string;
    created_at: string;
    completed_at?: string;
    status: JobStatus;
    domain: string;
    dataset_name: string;
    dataset_type: "images" | "videos" | "documents";
    file_id: string;
    wandb_url?: string;
    message?: string;
}
interface DatasetCreateParams {
    datasetDirectory: string;
    domain: string;
    datasetName: string;
    datasetType: "images" | "videos" | "documents";
    wandbBaseUrl?: string;
    wandbProjectName?: string;
    wandbApiKey?: string;
}
interface VlmRunError extends Error {
    message: string;
    code?: string;
    cause?: Error;
}
interface HubSchemaParams {
    domain: string;
    gql_stmt?: string;
}
interface AgentGetParams {
    name: string;
    version?: string;
}
interface AgentExecuteParams {
    name: string;
    version?: string;
    fileIds?: string[];
    urls?: string[];
    batch?: boolean;
    config?: GenerationConfigInput;
    metadata?: RequestMetadataInput;
    callbackUrl?: string;
}
interface FeedbackSubmitRequest {
    request_id: string;
    response?: Record<string, any> | null;
    notes?: string | null;
}
interface FeedbackItem {
    id: string;
    created_at: string;
    response: Record<string, any> | null;
    notes: string | null;
}
interface FeedbackListResponse {
    request_id: string;
    items: FeedbackItem[];
}
interface FeedbackSubmitResponse {
    id: string;
    request_id: string;
    created_at: string;
}
interface FileExecuteParams {
    name: string;
    version?: string;
    fileId?: string;
    url?: string;
    batch?: boolean;
    config?: GenerationConfigInput;
    metadata?: RequestMetadataInput;
    callbackUrl?: string;
}

declare class Models {
    private client;
    private requestor;
    constructor(client: Client);
    list(): Promise<ModelInfoResponse[]>;
}

declare class Files {
    private client;
    private requestor;
    constructor(client: Client);
    list(params?: ListParams): Promise<FileResponse[]>;
    /**
     * Calculate the MD5 hash of a file by reading it in chunks
     * @param filePath Path to the file to hash
     * @returns MD5 hash of the file as a hex string
     * @private
     */
    private calculateMD5;
    /**
     * Get a cached file from the API by calculating its MD5 hash
     * @param filePath Path to the file to check
     * @returns FileResponse if the file exists, null otherwise
     */
    getCachedFile(filePath: string): Promise<FileResponse | null>;
    checkFileExists(filePath: string): Promise<FileResponse | null>;
    upload(params: FileUploadParams): Promise<FileResponse>;
    get(fileId: string): Promise<FileResponse>;
    delete(fileId: string): Promise<void>;
}

declare class Predictions {
    protected client: Client;
    protected requestor: APIRequestor;
    constructor(client: Client);
    /**
     * Cast response to schema if a schema is provided
     * @param prediction - The prediction response
     * @param domain - The domain used for the prediction
     * @param config - The generation config used for the prediction
     * @protected
     */
    protected _castResponseToSchema(prediction: PredictionResponse, domain: string, config?: GenerationConfigParams): void;
    list(params?: ListParams): Promise<PredictionResponse[]>;
    get(id: string): Promise<PredictionResponse>;
    /**
     * Wait for prediction to complete
     * @param params.id - ID of prediction to wait for
     * @param params.timeout - Timeout in seconds (default: 60)
     * @param params.sleep - Sleep time in seconds (default: 1)
     * @returns Promise containing the prediction response
     * @throws TimeoutError if prediction doesn't complete within timeout
     */
    wait(id: string, timeout?: number, sleep?: number): Promise<PredictionResponse>;
}
declare class ImagePredictions extends Predictions {
    /**
     * Handle images and URLs input validation and processing
     * @param images - Array of image inputs (file paths or base64 encoded strings)
     * @param urls - Array of URL strings pointing to images
     * @returns Processed image data array
     * @private
     */
    private _handleImagesOrUrls;
    /**
     * Generate predictions from images
     * @param params.images - Array of image inputs. Each image can be:
     *   - A local file path string
     *   - A base64 encoded image string
     * @param params.urls - Array of URL strings pointing to images
     * @param params.model - Model ID to use for prediction eg. 'vlm-1'
     * @param params.domain - Domain for the prediction eg. 'document.invoice'
     * @param params.batch - Whether to process as batch (default: false)
     * @param params.config - Configuration options for the prediction
     * @param params.metadata - Additional metadata to include
     * @param params.callbackUrl - URL to receive prediction completion webhook
     * @returns Promise containing the prediction response
     */
    generate(params: ImagePredictionParams): Promise<PredictionResponse>;
    /**
     * Auto-generate a schema for a given image or document.
     * @param params - Schema generation parameters
     * @param params.images - Array of image inputs. Each image can be:
     *   - A local file path string
     *   - A base64 encoded image string
     * @param params.urls - Array of URL strings pointing to images
     * @returns Promise containing the prediction response with schema information
     */
    schema(params: {
        images?: string[];
        urls?: string[];
    }): Promise<PredictionResponse>;
}
declare class FilePredictions extends Predictions {
    private route;
    constructor(client: Client, route: "document" | "audio" | "video");
    /**
     * Handle file or URL input validation
     * @param fileId - File ID to use
     * @param url - URL to use
     * @returns Object with the appropriate parameter name and value
     * @private
     */
    private _handleFileOrUrl;
    generate(params: FilePredictionParams): Promise<PredictionResponse>;
    /**
     * Execute a named model/agent on files
     * @param params.name - Name of the model/agent to execute
     * @param params.version - Version of the model/agent (default: "latest")
     * @param params.fileId - File ID to use
     * @param params.url - URL to use
     * @param params.batch - Whether to process as batch (default: false)
     * @param params.config - Configuration options for the prediction
     * @param params.metadata - Additional metadata to include
     * @param params.callbackUrl - URL to receive prediction completion webhook
     * @returns Promise containing the prediction response
     */
    execute(params: FileExecuteParams): Promise<PredictionResponse>;
    /**
     * Auto-generate a schema for a given document, audio, or video file
     * @param params - Schema generation parameters
     * @param params.fileId - File ID to generate schema from
     * @param params.url - URL to generate schema from
     * @returns Promise containing the prediction response with schema information
     */
    schema(params: {
        fileId?: string;
        url?: string;
    }): Promise<PredictionResponse>;
}
declare class WebPredictions extends Predictions {
    generate(params: WebPredictionParams): Promise<PredictionResponse>;
}
declare const DocumentPredictions: (client: Client) => FilePredictions;
declare const AudioPredictions: (client: Client) => FilePredictions;
declare const VideoPredictions: (client: Client) => FilePredictions;

declare class Feedback {
    private client;
    private requestor;
    constructor(client: Client);
    get(requestId: string, limit?: number, offset?: number): Promise<FeedbackListResponse>;
    submit(requestId: string, response?: Record<string, any> | null, notes?: string | null): Promise<FeedbackSubmitResponse>;
}

declare class Finetuning {
    private requestor;
    constructor(client: Client);
    /**
     * Create a fine-tuning job
     * @param {Object} params - Fine-tuning parameters
     * @param {string} params.model - Base model to fine-tune
     * @param {string} params.training_file_id - File ID for training data
     * @param {string} [params.validation_file_id] - File ID for validation data
     * @param {number} [params.num_epochs=1] - Number of epochs
     * @param {number|string} [params.batch_size="auto"] - Batch size for training
     * @param {number} [params.learning_rate=2e-4] - Learning rate for training
     * @param {string} [params.suffix] - Suffix for the fine-tuned model
     * @param {string} [params.wandb_api_key] - Weights & Biases API key
     * @param {string} [params.wandb_base_url] - Weights & Biases base URL
     * @param {string} [params.wandb_project_name] - Weights & Biases project name
     */
    create(params: FinetuningCreateParams): Promise<FinetuningResponse>;
    /**
     * Provision a fine-tuning model
     * @param {Object} params - Provisioning parameters
     * @param {string} params.model - Model to provision
     * @param {number} [params.duration=600] - Duration for the provisioned model (in seconds)
     * @param {number} [params.concurrency=1] - Concurrency for the provisioned model
     */
    provision(params: FinetuningProvisionParams): Promise<FinetuningProvisionResponse>;
    /**
     * Generate a prediction using a fine-tuned model
     * @param {FinetuningGenerateParams} params - Generation parameters
     */
    generate(params: FinetuningGenerateParams): Promise<PredictionResponse>;
    /**
     * List all fine-tuning jobs
     * @param {FinetuningListParams} params - List parameters
     */
    list(params?: FinetuningListParams): Promise<FinetuningResponse[]>;
    /**
     * Get fine-tuning job details
     * @param {string} jobId - ID of job to retrieve
     */
    get(jobId: string): Promise<FinetuningResponse>;
    /**
     * Cancel a fine-tuning job
     * @param {string} jobId - ID of job to cancel
     */
    cancel(jobId: string): Promise<Record<string, any>>;
}

declare class Datasets {
    private requestor;
    private files;
    constructor(client: Client);
    /**
     * Create a dataset from a directory of files.
     *
     * @param params Dataset creation parameters.
     * @returns The dataset creation response.
     */
    create(params: DatasetCreateParams): Promise<DatasetResponse>;
    /**
     * Get dataset information by its ID.
     *
     * @param datasetId The ID of the dataset to retrieve.
     * @returns The dataset information.
     */
    get(datasetId: string): Promise<DatasetResponse>;
    /**
     * List all datasets with pagination support.
     *
     * @param skip Number of datasets to skip.
     * @param limit Maximum number of datasets to return.
     * @returns A list of dataset responses.
     */
    list(params?: DatasetListParams): Promise<DatasetResponse[]>;
}

declare class Hub {
    private client;
    private requestor;
    constructor(client: Client);
    /**
     * Get the hub info.
     * @returns HubInfoResponse containing hub version
     * @throws APIError if the request fails
     */
    info(): Promise<HubInfoResponse>;
    /**
     * Get the list of supported domains.
     * @returns List of domain information
     * @throws APIError if the request fails
     */
    listDomains(): Promise<DomainInfo[]>;
    /**
     * Get the JSON schema for a given domain.
     * @param params Object containing domain and optional gql_stmt
     * @param params.domain Domain identifier (e.g. "document.invoice")
     * @param params.gql_stmt Optional GraphQL statement for the domain
     * @returns HubSchemaResponse containing schema details
     * @throws APIError if the request fails or domain is not found
     */
    getSchema(params: HubSchemaParams): Promise<HubSchemaResponse>;
}

/**
 * VLM Run API Agent resource.
 */

declare class Agent {
    /**
     * Agent resource for VLM Run API.
     */
    private client;
    private requestor;
    constructor(client: Client);
    /**
     * Get an agent by name.
     *
     * @param params - Agent request parameters
     * @returns Agent response
     */
    get(params: AgentGetParams): Promise<PredictionResponse>;
    /**
     * Execute an agent with the given arguments.
     *
     * @param params - Agent execution parameters
     * @returns Agent execution response
     * @throws {Error} If neither fileIds nor urls are provided, or if both are provided
     */
    execute(params: AgentExecuteParams): Promise<PredictionResponse>;
}

declare class Domains {
    private client;
    private requestor;
    constructor(client: Client);
    /**
     * Get the list of supported domains.
     * @returns List of domain information
     * @throws APIError if the request fails
     */
    list(): Promise<DomainInfo[]>;
}

/**
 * Base exception for all VLM Run errors.
 */
declare class VLMRunError extends Error {
    constructor(message: string);
}
/**
 * Base exception for API errors.
 */
declare class APIError extends VLMRunError {
    /**
     * HTTP status code
     */
    http_status?: number;
    /**
     * Response headers
     */
    headers?: Record<string, string>;
    /**
     * Request ID from the server
     */
    request_id?: string;
    /**
     * Error type from the server
     */
    error_type?: string;
    /**
     * Suggestion on how to fix the error
     */
    suggestion?: string;
    constructor(message: string, http_status?: number, headers?: Record<string, string> | RawAxiosResponseHeaders | AxiosResponseHeaders, request_id?: string, error_type?: string, suggestion?: string);
    toString(): string;
}
/**
 * Exception raised when authentication fails.
 */
declare class AuthenticationError extends APIError {
    constructor(message?: string, http_status?: number, headers?: Record<string, string> | RawAxiosResponseHeaders | AxiosResponseHeaders, request_id?: string, error_type?: string, suggestion?: string);
}
/**
 * Exception raised when request validation fails.
 */
declare class ValidationError extends APIError {
    constructor(message?: string, http_status?: number, headers?: Record<string, string> | RawAxiosResponseHeaders | AxiosResponseHeaders, request_id?: string, error_type?: string, suggestion?: string);
}
/**
 * Exception raised when rate limit is exceeded.
 */
declare class RateLimitError extends APIError {
    constructor(message?: string, http_status?: number, headers?: Record<string, string> | RawAxiosResponseHeaders | AxiosResponseHeaders, request_id?: string, error_type?: string, suggestion?: string);
}
/**
 * Exception raised when server returns 5xx error.
 */
declare class ServerError extends APIError {
    constructor(message?: string, http_status?: number, headers?: Record<string, string> | RawAxiosResponseHeaders | AxiosResponseHeaders, request_id?: string, error_type?: string, suggestion?: string);
}
/**
 * Exception raised when resource is not found.
 */
declare class ResourceNotFoundError extends APIError {
    constructor(message?: string, http_status?: number, headers?: Record<string, string> | RawAxiosResponseHeaders | AxiosResponseHeaders, request_id?: string, error_type?: string, suggestion?: string);
}
/**
 * Base exception for client-side errors.
 */
declare class ClientError extends VLMRunError {
    /**
     * Error type
     */
    error_type?: string;
    /**
     * Suggestion on how to fix the error
     */
    suggestion?: string;
    constructor(message: string, error_type?: string, suggestion?: string);
    toString(): string;
}
/**
 * Exception raised when client configuration is invalid.
 */
declare class ConfigurationError extends ClientError {
    constructor(message?: string, error_type?: string, suggestion?: string);
}
/**
 * Exception raised when a required dependency is missing.
 */
declare class DependencyError extends ClientError {
    constructor(message?: string, error_type?: string, suggestion?: string);
}
/**
 * Exception raised when input is invalid.
 */
declare class InputError extends ClientError {
    constructor(message?: string, error_type?: string, suggestion?: string);
}
/**
 * Exception raised when a request times out.
 */
declare class RequestTimeoutError extends APIError {
    constructor(message?: string, http_status?: number, headers?: Record<string, string> | RawAxiosResponseHeaders | AxiosResponseHeaders, request_id?: string, error_type?: string, suggestion?: string);
}
/**
 * Exception raised when a network error occurs.
 */
declare class NetworkError extends APIError {
    constructor(message?: string, http_status?: number, headers?: Record<string, string> | RawAxiosResponseHeaders | AxiosResponseHeaders, request_id?: string, error_type?: string, suggestion?: string);
}

/**
 * Encodes an image file to base64
 * @param imagePath Path to the image file
 * @returns Base64 encoded image with data URI prefix
 */
declare function encodeImage(imagePath: string): string;
/**
 * Checks if a file is an image based on its extension
 * @param image Path to the file or base64 encoded image
 * @returns string with base64 encoded image
 */
declare function processImage(image: string): string;

declare const readFileFromPathAsFile: (filePath: string) => Promise<File>;
declare const createArchive: (directory: string, archiveName: string) => Promise<string>;

/**
 * Converts a value to JSON schema if it's a Zod schema, otherwise returns it as-is
 * @param schema - The schema to convert (can be Zod schema or plain JSON schema)
 * @returns Converted JSON schema or the original value
 */
declare function convertToJsonSchema(schema: ZodType | Record<string, any> | null | undefined, zodToJsonParams?: any): Record<string, any> | null | undefined;

interface VlmRunConfig {
    apiKey: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
}
declare class VlmRun {
    private client;
    readonly models: Models;
    readonly files: Files;
    readonly predictions: Predictions;
    readonly image: ImagePredictions;
    readonly document: ReturnType<typeof DocumentPredictions>;
    readonly audio: ReturnType<typeof AudioPredictions>;
    readonly video: ReturnType<typeof VideoPredictions>;
    readonly web: WebPredictions;
    readonly feedback: Feedback;
    readonly finetuning: Finetuning;
    readonly dataset: Datasets;
    readonly hub: Hub;
    readonly agent: Agent;
    readonly domains: Domains;
    constructor(config: VlmRunConfig);
}

export { APIError, APIRequestor, Agent, type AgentExecuteParams, type AgentGetParams, AudioPredictions, AuthenticationError, type Client, ClientError, ConfigurationError, type CreditUsage, type DatasetCreateParams, type DatasetListParams, type DatasetResponse, DependencyError, type DetailLevel, DocumentPredictions, type DomainInfo, Feedback, type FeedbackItem, type FeedbackListResponse, type FeedbackSubmitRequest, type FeedbackSubmitResponse, type FileExecuteParams, type FilePredictionParams, type FilePredictionSchemaParams, FilePredictions, type FilePurpose, type FileResponse, type FileUploadParams, Files, Finetuning, type FinetuningCreateParams, type FinetuningGenerateParams, type FinetuningListParams, type FinetuningProvisionParams, type FinetuningProvisionResponse, type FinetuningResponse, GenerationConfig, type GenerationConfigInput, type GenerationConfigParams, type HubInfoResponse, type HubSchemaParams, type HubSchemaResponse, type ImagePredictionParams, ImagePredictions, InputError, type JobStatus, type ListParams, type ModelInfoResponse, Models, NetworkError, type PredictionGenerateParams, type PredictionResponse, Predictions, type PresignedUrlResponse, RateLimitError, RequestMetadata, type RequestMetadataInput, type RequestMetadataParams, RequestTimeoutError, ResourceNotFoundError, type SchemaResponse, ServerError, VLMRunError, ValidationError, VideoPredictions, VlmRun, type VlmRunConfig, type VlmRunError, type WebPredictionParams, WebPredictions, convertToJsonSchema, createArchive, encodeImage, processImage, readFileFromPathAsFile };
