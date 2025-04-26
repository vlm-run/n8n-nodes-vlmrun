import { File } from 'node:buffer';
import { BaseService } from './BaseService';
import { FileResponse } from '../types';

export class FileService extends BaseService {
    async upload(buffer: any, fileName: string): Promise<FileResponse> {
        try {
            const fileObject = new File([buffer], fileName, {
                type: buffer.mimeType || 'application/octet-stream'
            });

            const uploadResponse = await this.client.files.upload({
                file: fileObject as any
            });

            return uploadResponse as FileResponse;
        } catch (error) {
            this.handleApiError(error, 'Failed to upload file');
        }
    }

    async list(skip = 0, limit = 10): Promise<FileResponse[]> {
        try {
            const filesResponse = await this.client.files.list({ limit, skip });
            return filesResponse as FileResponse[];
        } catch (error) {
            this.handleApiError(error, 'Failed to fetch files');
        }
    }
} 