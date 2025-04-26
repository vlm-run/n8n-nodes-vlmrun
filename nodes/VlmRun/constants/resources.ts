import { INodeProperties } from 'n8n-workflow';
import { Operation, Resource } from '../types';

export const createResourceOperation = (
    resource: typeof Resource[keyof typeof Resource],
    operations: Array<{ name: string; value: typeof Operation[keyof typeof Operation] }>,
    defaultValue: string,
): INodeProperties => ({
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    displayOptions: {
        show: {
            resource: [resource],
        },
    },
    options: operations,
    required: true,
    default: defaultValue,
    noDataExpression: true,
});

export const commonResourceProperties: INodeProperties[] = [
    {
        displayName: 'File',
        name: 'file',
        type: 'string',
        displayOptions: {
            show: {
                resource: [Resource.DOCUMENT, Resource.IMAGE, Resource.AUDIO, Resource.VIDEO],
            },
        },
        default: 'data',
        required: true,
        description: 'File data from previous node',
    },
    {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        displayOptions: {
            show: {
                resource: [Resource.DOCUMENT, Resource.IMAGE, Resource.AUDIO, Resource.VIDEO],
            },
        },
        options: [
            {
                name: 'VLM-1',
                value: 'vlm-1',
            },
        ],
        default: 'vlm-1',
        description: 'The model to use for processing',
        noDataExpression: true,
    },
    {
        displayName: 'Domain Name or ID',
        name: 'domain',
        type: 'options',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        displayOptions: {
            show: {
                resource: [Resource.DOCUMENT, Resource.IMAGE, Resource.AUDIO, Resource.VIDEO],
            },
        },
        typeOptions: {
            loadOptionsMethod: 'loadDomains',
        },
        default: '',
        hint: 'Select a domain to use for the operation',
        required: true,
        noDataExpression: true,
    },
]; 