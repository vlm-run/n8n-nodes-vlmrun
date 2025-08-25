import { IExecuteFunctions, IDataObject, ILoadOptionsFunctions } from 'n8n-workflow';
import { FileRequest, PredictionResponse, FileResponse, ImageRequest } from './types';
import { AgentCreateRequest, VlmRunClient } from './VlmRunClient';
import { FileService, PredictionService, DomainService } from './services';

export class ApiService {
	private static async initializeVlmRun(ef: IExecuteFunctions): Promise<VlmRunClient> {
		const credentials = (await ef.getCredentials('vlmRunApi')) as {
			apiBaseUrl: string;
			agentBaseUrl: string;
		};

		return new VlmRunClient(ef, {
			baseURL: credentials.apiBaseUrl.trim(),
			agentBaseURL: credentials.agentBaseUrl.trim(),
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

	// Agent Operations
	static async getAgents(ef: ILoadOptionsFunctions): Promise<{ name: string; value: string }[]> {
		const client = await this.initializeVlmRun(ef as unknown as IExecuteFunctions);
		const agents = await client.agent.get();

		// Check if agents is an array, if not, handle single agent response
		const agentList = Array.isArray(agents) ? agents : [agents];

		return agentList.map((agent: any) => ({
			name: agent.name,
			value: agent.id || agent.name,
		}));
	}

	static async executeAgent(
		ef: IExecuteFunctions,
		agentId: string,
		inputs: { url?: string },
	): Promise<IDataObject> {
		const client = await this.initializeVlmRun(ef);
		const request = {
			agent_id: agentId,
			inputs,
		};
		return client.agent.execute(request);
	}
	
	static async createAgent(
        ef: IExecuteFunctions,
        prompt: string,
    ): Promise<IDataObject> {
        const client = await this.initializeVlmRun(ef);
        const request: AgentCreateRequest = {
            config: {
                prompt,
            },
        };
		
        return (await client.agent.create(request)) as unknown as IDataObject;
    }

    static async getAgentDetail(
        ef: IExecuteFunctions,
        agentId: string,
    ): Promise<IDataObject> {
        const client = await this.initializeVlmRun(ef);

        return (await client.agent.detail(agentId)) as unknown as IDataObject;
    }

	static async uploadUsingPresignedUrl(
		ef: IExecuteFunctions,
		fileName: string,
		buffer: Buffer,
		purpose = 'assistants', 
		expiration = 86400
	): Promise<{ url: string }> {
		const client = await this.initializeVlmRun(ef);
		const response = await client.agent.generatePresignedUrl({
			filename: fileName,
			purpose,
			expiration,
		});

		await client.agent.putImage({ url: response.url, buffer, fileName });

		const url = await client.agent.getPresignedUrl({
			file_id: response.file_id
		});

		return { url };
	}
}
