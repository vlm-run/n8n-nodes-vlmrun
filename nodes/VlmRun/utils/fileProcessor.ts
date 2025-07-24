import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

export interface ProcessedFile {
	buffer: any;
	fileName: string;
}

export async function processFile(
	ef: IExecuteFunctions,
	nodeData: INodeExecutionData,
	index: number,
	binaryPropertyName = 'data',
): Promise<ProcessedFile> {
	if (!nodeData.binary) {
		throw new NodeOperationError(ef.getNode(), 'No binary data exists on item!');
	}

	const binaryData = nodeData.binary[binaryPropertyName];

	if (binaryData === undefined) {
		throw new NodeOperationError(
			ef.getNode(),
			`Binary data property "${binaryPropertyName}" does not exist on item!`,
		);
	}

	const fileName = binaryData.fileName || 'unnamed_file';
	const buffer = await ef.helpers.getBinaryDataBuffer(index, binaryPropertyName);

	return { buffer, fileName };
}
