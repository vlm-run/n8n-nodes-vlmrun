import { INodeProperties, NodePropertyTypes } from 'n8n-workflow';

export const createKeyValueCollection = (
    name: string,
    displayName: string,
    keyPlaceholder: string,
    valuePlaceholder: string,
) => ({
    name,
    displayName,
    values: [
        {
            displayName: 'Key',
            name: 'key',
            type: 'string' as NodePropertyTypes,
            default: '',
            description: `Key of the ${name}`,
            placeholder: keyPlaceholder,
        },
        {
            displayName: 'Value',
            name: 'value',
            type: 'string' as NodePropertyTypes,
            default: '',
            description: `Value of the ${name}`,
            placeholder: valuePlaceholder,
        },
    ],
});

export const httpBaseProperties: INodeProperties[] = [
    {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        placeholder: 'e.g. /files, /models',
        required: true,
        description: 'The URL to send the request to',
        displayOptions: {
            show: {
                resource: ['http'],
            },
        },
    },
];

export const createHttpDataSection = (
    type: 'headers' | 'params' | 'jsonBody' | 'formBody',
    showConditions: Record<string, any[]>,
): INodeProperties => {
    const typeMap = {
        headers: {
            displayName: 'Headers',
            buttonText: 'Add Header',
            collection: createKeyValueCollection('header', 'Header', 'Content-Type', 'application/json'),
        },
        params: {
            displayName: 'Query Parameters',
            buttonText: 'Add Parameter',
            collection: createKeyValueCollection('param', 'Parameter', 'limit', '10'),
        },
        jsonBody: {
            displayName: 'JSON Body',
            buttonText: 'Add Field',
            collection: createKeyValueCollection('json', 'JSON', 'name', 'John'),
        },
        formBody: {
            displayName: 'Form Data',
            buttonText: 'Add Field',
            collection: createKeyValueCollection('form', 'Form', 'file', 'data'),
        },
    };

    return {
        displayName: typeMap[type].displayName,
        name: type,
        type: 'fixedCollection',
        typeOptions: {
            multipleValues: true,
            multipleValueButtonText: typeMap[type].buttonText,
        },
        displayOptions: {
            show: showConditions,
        },
        default: {},
        options: [typeMap[type].collection],
    };
}; 