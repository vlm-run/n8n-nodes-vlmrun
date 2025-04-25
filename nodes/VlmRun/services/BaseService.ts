import {
    IExecuteFunctions,
    NodeOperationError,
} from 'n8n-workflow';
import { VlmRun } from 'vlmrun';

export abstract class BaseService {
    protected client: VlmRun;
    protected ef: IExecuteFunctions;

    constructor(ef: IExecuteFunctions, client: VlmRun) {
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