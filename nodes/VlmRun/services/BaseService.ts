import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { VlmRunClient } from '../VlmRunClient';

export abstract class BaseService {
	protected client: VlmRunClient;
	protected ef: IExecuteFunctions;

	constructor(ef: IExecuteFunctions, client: VlmRunClient) {
		this.ef = ef;
		this.client = client;
	}

	protected handleApiError(error: any, customMessage: string): never {
		if (error.response?.data?.detail) {
			throw new NodeOperationError(this.ef.getNode(), `API Error: ${error.response.data.detail}`);
		} else {
			throw new Error(`${customMessage}: ${error.message}`);
		}
	}
}
