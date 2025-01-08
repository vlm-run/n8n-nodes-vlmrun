import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { INodeExecutionData, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { VlmRun } from '../VlmRun.node';
import * as ApiService from '../ApiService';
import { PredictionResponse } from '../types';

describe('VlmRun Node - Image AI Operations', () => {
  describe('Success Cases', () => {
    let node: VlmRun;
    let mockExecuteFunctions: IExecuteFunctions;
    const fakeBase64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    beforeEach(() => {
      jest.clearAllMocks();
      node = new VlmRun();
      
      // Mock API responses
      jest.spyOn(ApiService, 'generateImageRequest').mockResolvedValue({
        id: 'test-id-1',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        status: 'completed',
        response: { result: 'TestCaption' }
      } as PredictionResponse);

      jest.spyOn(ApiService, 'generateImageEmbedding').mockResolvedValue({
        id: 'test-id-2',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        status: 'completed',
        response: { embeddings: [0.123, 0.456] }
      } as PredictionResponse);

      // Setup mock execute functions
      mockExecuteFunctions = {
        getInputData: () => [{
          binary: {
            data: {
              data: fakeBase64Image,
              mimeType: 'image/png',
              fileName: 'test.png',
            },
          },
          json: {},
        }],
        helpers: {
          returnJsonArray: (items: INodeExecutionData[]) => items,
        },
      } as unknown as IExecuteFunctions;
    });

  it('should exist', () => {
    expect(VlmRun).toBeDefined();
  });

  it('should perform Image Cataloging successfully', async () => {
    // Arrange
    Object.assign(mockExecuteFunctions, {
      getNodeParameter: (paramName: string): string => {
        if (paramName === 'resource') return 'imageAi';
        if (paramName === 'operation') return 'imageCataloging';
        if (paramName === 'model') return 'vlm-1';
        return '';
      },
    });

    // Act
    const result = await node.execute.call(mockExecuteFunctions);

    // Assert
    const response = result[0][0].json as IDataObject;
    expect(response.status).toBe('completed');
    expect((response.response as IDataObject).result).toBe('TestCaption');
  });

  it('should perform Image Captioning successfully', async () => {
    // Arrange
    Object.assign(mockExecuteFunctions, {
      getNodeParameter: (paramName: string): string => {
        if (paramName === 'resource') return 'imageAi';
        if (paramName === 'operation') return 'imageCaptioning';
        if (paramName === 'model') return 'vlm-1';
        return '';
      },
    });

    // Act
    const result = await node.execute.call(mockExecuteFunctions);

    // Assert
    const response = result[0][0].json as IDataObject;
    expect(response.status).toBe('completed');
    expect((response.response as IDataObject).result).toBe('TestCaption');
  });

  it('should perform Image Embedding successfully', async () => {
    // Arrange
    Object.assign(mockExecuteFunctions, {
      getNodeParameter: (paramName: string): string => {
        if (paramName === 'resource') return 'experimental';
        if (paramName === 'operation') return 'imageEmbedding';
        if (paramName === 'model') return 'vlm-1';
        return '';
      },
    });

    // Act
    const result = await node.execute.call(mockExecuteFunctions);

    // Assert
    const response = result[0][0].json as IDataObject;
    expect(response.status).toBe('completed');
    expect((response.response as IDataObject).embeddings).toEqual([0.123, 0.456]);
  });
  });

  describe('Error Cases', () => {
    let node: VlmRun;
    const fakeBase64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    beforeEach(() => {
      jest.clearAllMocks();
      node = new VlmRun();
    });

    it('should handle missing binary data', async () => {
      // Arrange
      const mockExecuteFunctions = {
        getNodeParameter: (paramName: string): string => {
          if (paramName === 'resource') return 'imageAi';
          if (paramName === 'operation') return 'imageCataloging';
          if (paramName === 'model') return 'vlm-1';
          return '';
        },
        getInputData: () => [{
          json: {},
        }],
        helpers: {
          returnJsonArray: (items: INodeExecutionData[]) => items,
        },
        continueOnFail: () => true,
      } as unknown as IExecuteFunctions;

      // Act
      const result = await node.execute.call(mockExecuteFunctions);

      // Assert
      const response = result[0][0].json as IDataObject;
      expect(response).toHaveProperty('error');
      expect(typeof response.error).toBe('string');
    });

    it('should handle API errors', async () => {
      // Arrange
      const mockError = new Error('API Error');
      jest.spyOn(ApiService, 'generateImageRequest').mockRejectedValue(mockError);

      const mockExecuteFunctions = {
        getNodeParameter: (paramName: string): string => {
          if (paramName === 'resource') return 'imageAi';
          if (paramName === 'operation') return 'imageCataloging';
          if (paramName === 'model') return 'vlm-1';
          return '';
        },
        getInputData: () => [{
          binary: {
            data: {
              data: fakeBase64Image,
              mimeType: 'image/png',
              fileName: 'test.png',
            },
          },
          json: {},
        }],
        helpers: {
          returnJsonArray: (items: INodeExecutionData[]) => items,
        },
        continueOnFail: () => true,
      } as unknown as IExecuteFunctions;

      // Act
      const result = await node.execute.call(mockExecuteFunctions);

      // Assert
      const response = result[0][0].json as IDataObject;
      expect(response).toHaveProperty('error');
      expect(response.error).toBe('API Error');
    });

    it('should handle invalid image data', async () => {
      // Arrange
      const mockExecuteFunctions = {
        getNodeParameter: (paramName: string): string => {
          if (paramName === 'resource') return 'imageAi';
          if (paramName === 'operation') return 'imageCataloging';
          if (paramName === 'model') return 'vlm-1';
          return '';
        },
        getInputData: () => [{
          binary: {
            data: {
              data: 'invalid-base64-data',
              mimeType: 'image/png',
              fileName: 'test.png',
            },
          },
          json: {},
        }],
        helpers: {
          returnJsonArray: (items: INodeExecutionData[]) => items,
        },
        continueOnFail: () => true,
      } as unknown as IExecuteFunctions;

      // Act
      const result = await node.execute.call(mockExecuteFunctions);

      // Assert
      const response = result[0][0].json as IDataObject;
      expect(response).toHaveProperty('error');
      expect(typeof response.error).toBe('string');
    });
  });
});
