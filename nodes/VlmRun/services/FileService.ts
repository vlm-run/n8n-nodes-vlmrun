import { BaseService } from './BaseService';
import { FileResponse } from '../types';

export class FileService extends BaseService {
	async upload(buffer: any, fileName: string): Promise<FileResponse> {
		try {
			// Create a File object using standard Web API
			const blob = new Blob([buffer], {
				type: buffer.mimeType || 'application/octet-stream',
			});

			// Create File object with proper filename
			const file = new File([blob], fileName, {
				type: buffer.mimeType || 'application/octet-stream',
			});

			const uploadResponse = await this.client.files.upload({
				file: file,
			});

			return uploadResponse as FileResponse;
		} catch (error) {
			this.handleApiError(error, 'Failed to upload file');
		}
	}

	async list(skip = 0, limit = 100): Promise<FileResponse[]> {
		try {
			const filesResponse = await this.client.files.list({ limit, skip });
			return filesResponse as FileResponse[];
		} catch (error) {
			this.handleApiError(error, 'Failed to fetch files');
		}
	}
}
