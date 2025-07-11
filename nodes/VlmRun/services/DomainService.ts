import { BaseService } from './BaseService';

export class DomainService extends BaseService {
    async listDomains(): Promise<{ name: string; value: string }[]> {
        try {
            const domains = await this.client.domains.list();
            return domains.map((domain: any) => ({
                name: domain.domain,
                value: domain.domain,
            }));
        } catch (error) {
            this.handleApiError(error, 'Failed to fetch domains');
        }
    }
} 