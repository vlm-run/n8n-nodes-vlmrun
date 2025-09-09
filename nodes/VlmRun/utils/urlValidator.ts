import { NodeOperationError } from 'n8n-workflow';

/**
 * Validates if a URL is properly formatted and uses HTTPS protocol
 * @param url The URL to validate
 * @param fieldName The name of the field being validated (for error messages)
 * @returns true if valid, throws NodeOperationError if invalid
 */
export function validateUrl(url: string, fieldName: string = 'URL'): boolean {
	if (!url || typeof url !== 'string') {
		throw new NodeOperationError(
			{} as any,
			`${fieldName} is required and must be a valid string`
		);
	}

	let parsedUrl: URL;
	try {
		parsedUrl = new URL(url);
	} catch (error) {
		throw new NodeOperationError(
			{} as any,
			`${fieldName} must be a valid URL format`
		);
	}

	if (parsedUrl.protocol !== 'https:') {
		throw new NodeOperationError(
			{} as any,
			`${fieldName} must use HTTPS protocol for security reasons`
		);
	}

	const hostname = parsedUrl.hostname.toLowerCase();
	if (
		hostname === 'localhost' ||
		hostname === '127.0.0.1' ||
		hostname === '::1' ||
		hostname.startsWith('10.') ||
		hostname.startsWith('192.168.') ||
		hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
	) {
		throw new NodeOperationError(
			{} as any,
			`${fieldName} cannot point to localhost or private IP addresses for security reasons`
		);
	}

	return true;
}
