import { INodeProperties } from 'n8n-workflow';
import { Operation, Resource } from '../types';
import { createHttpDataSection, httpBaseProperties } from './http';
import { createResourceOperation, commonResourceProperties } from './resources';

export const fileCategories: INodeProperties = {
    displayName: 'Resource',
    name: 'resource',
    type: 'options',
    options: [
        { name: 'Document', value: Resource.DOCUMENT },
        { name: 'Image', value: Resource.IMAGE },
        { name: 'Video', value: Resource.VIDEO },
        { name: 'Audio', value: Resource.AUDIO },
        { name: 'File', value: Resource.FILE },
        { name: 'HTTP', value: Resource.HTTP },
    ],
    default: 'document',
    noDataExpression: true,
    required: true,
    hint: 'Select a document type to use for the operation',
};

const documentOperations = [
    { name: 'Resume', value: Operation.RESUME_PARSER },
    { name: 'Invoice', value: Operation.INVOICE_PARSER },
    { name: 'Utility Bill', value: Operation.UTILITY_BILL_PARSER },
    { name: 'Other', value: Operation.OTHER },
];

const imageOperations = [
    { name: 'Product Catalog', value: Operation.PRODUCT_CATALOG_PARSER },
    { name: 'US Driver License', value: Operation.US_DRIVER_LICENSE_PARSER },
    { name: 'Other', value: Operation.OTHER },
];

const fileOperations = [
    { name: 'List', value: Operation.FILE_LIST },
    { name: 'Upload', value: Operation.FILE_UPLOAD },
];

const httpOperations = [
    { name: 'Custom GET', value: Operation.GET, displayName: 'Perform a GET call.' },
    { name: 'Custom POST', value: Operation.POST, displayName: 'Perform a POST call.' },
];

export const vlmRunOperations: INodeProperties[] = [
    createResourceOperation(Resource.DOCUMENT, documentOperations, 'resumeParser'),
    createResourceOperation(Resource.IMAGE, imageOperations, 'productCatalogParser'),
    createResourceOperation(Resource.FILE, fileOperations, 'fileList'),
    createResourceOperation(Resource.HTTP, httpOperations, 'GET'),
    ...commonResourceProperties,
];

export const vlmRunOptions: INodeProperties[] = [
    {
        displayName: 'File',
        name: 'file',
        type: 'string',
        displayOptions: {
            show: {
                resource: [Resource.FILE],
                operation: [Operation.FILE_UPLOAD],
            },
        },
        default: 'data',
        required: true,
        description: 'File data from previous node',
    },
];

export const httpOperation: INodeProperties[] = [
    ...httpBaseProperties,
    {
        displayName: 'Send Header',
        name: 'isHeaderRequired',
        type: 'boolean',
        default: false,
        required: true,
        description: 'Whether to send headers with the request',
        displayOptions: {
            show: {
                resource: ['http'],
            },
        },
    },
    createHttpDataSection('headers', { resource: ['http'], isHeaderRequired: [true] }),
    {
        displayName: 'Send Query Params',
        name: 'isQueryParamRequired',
        type: 'boolean',
        default: false,
        required: true,
        description: 'Whether to send query parameters with the request',
        displayOptions: {
            show: {
                resource: ['http'],
            },
        },
    },
    createHttpDataSection('params', { resource: ['http'], isQueryParamRequired: [true] }),
    {
        displayName: 'Send Body',
        name: 'isBodyRequired',
        type: 'boolean',
        default: false,
        required: true,
        description: 'Whether to send body data with the request',
        displayOptions: {
            show: {
                resource: ['http'],
                operation: ['POST'],
            },
        },
    },
    {
        displayName: 'Body Type',
        name: 'typeofData',
        type: 'options',
        displayOptions: {
            show: {
                resource: ['http'],
                operation: ['POST'],
                isBodyRequired: [true],
            },
        },
        options: [
            { name: 'JSON', value: 'jsonData' },
            { name: 'Form Data', value: 'formData' },
        ],
        default: 'jsonData',
        description: 'The type of data to send in the request body',
    },
    createHttpDataSection('jsonBody', {
        resource: ['http'],
        operation: ['POST'],
        isBodyRequired: [true],
        typeofData: ['jsonData'],
    }),
    createHttpDataSection('formBody', {
        resource: ['http'],
        operation: ['POST'],
        isBodyRequired: [true],
        typeofData: ['formData'],
    }),
]; 