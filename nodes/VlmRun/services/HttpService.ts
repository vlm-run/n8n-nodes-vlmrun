import { IHttpRequestMethods, NodeOperationError } from 'n8n-workflow';
import { BaseService } from './BaseService';

interface HttpRequestOptions {
    url: string;
    method: IHttpRequestMethods;
    headers?: Record<string, any>;
    queryParams?: Array<{ key: string; value: string }>;
    body?: any;
    isBodyRequired?: boolean;
    typeofData?: 'jsonData' | 'formData';
}

export class HttpService extends BaseService {
    async makeRequest(options: HttpRequestOptions): Promise<any> {
        let { url, method, headers = {}, queryParams, body, isBodyRequired, typeofData } = options;

        // Validate URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new NodeOperationError(
                this.ef.getNode(),
                'Invalid URL. Please include the protocol (http:// or https://).',
            );
        }

        // Add authorization header
        const credentials = (await this.ef.getCredentials('vlmRunApi')) as { apiKey: string };
        headers['Authorization'] = `Bearer ${credentials.apiKey}`;

        // Process query parameters
        if (queryParams?.length) {
            const queryString = queryParams
                .map(
                    (param) =>
                        `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`,
                )
                .join('&');
            url = queryString ? `${url}?${queryString}` : url;
        }

        // Process body
        let formData;
        if (isBodyRequired && typeofData === 'formData') {
            const fileBuffer = this.ef.getInputData()[0].binary?.file;
            if (!fileBuffer) {
                throw new NodeOperationError(this.ef.getNode(), "File data is required for form data.");
            }

            formData = {
                file: {
                    value: Buffer.from(fileBuffer.data, 'base64'),
                    options: {
                        filename: fileBuffer.fileName,
                        contentType: fileBuffer.mimeType,
                    },
                },
            };
        }

        const requestOption = {
            method,
            url,
            headers,
            body,
            formData,
            json: true,
        };

        try {
            return await this.ef.helpers.request(requestOption);
        } catch (error) {
            this.handleApiError(error, 'HTTP request failed');
        }
    }
} 