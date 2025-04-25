import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { INodeExecutionData, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { VlmRun } from '../VlmRun.node';
import { ApiService } from '../ApiService';
import { PredictionResponse, Resource, Operation } from '../types';

const TEST_IMAGE = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ';

interface TestCase {
  resource: string;
  operation: string;
  model: string;
  expectedResult: Record<string, unknown>;
}

const createMockExecuteFunctions = (
  params: Partial<Record<string, string>>,
  withBinaryData = true,
  continueOnFail = false,
): IExecuteFunctions => ({
  getNodeParameter: (paramName: string): string => params[paramName] || '',
  getInputData: () => [{
    ...(withBinaryData ? {
      binary: {
        data: {
          data: TEST_IMAGE,
          mimeType: 'image/png',
          fileName: 'test.png',
        },
      },
    } : {}),
    json: {},
  }],
  helpers: {
    returnJsonArray: (items: INodeExecutionData[]) => items,
  },
  continueOnFail: () => continueOnFail,
}) as unknown as IExecuteFunctions;

const createPredictionResponse = (data: Partial<PredictionResponse>): PredictionResponse => ({
  id: 'test-id',
  created_at: new Date().toISOString(),
  completed_at: new Date().toISOString(),
  status: 'completed',
  ...data,
});

describe('VlmRun Node', () => {
  let node: VlmRun;

  beforeEach(() => {
    jest.clearAllMocks();
    node = new VlmRun();
  });

  describe('Image AI Operations - Success Cases', () => {
    const testCases: TestCase[] = [
      {
        resource: Resource.IMAGE,
        operation: Operation.PRODUCT_CATALOG_PARSER,
        model: 'vlm-1',
        expectedResult: { result: 'TestCaption' },
      },
      {
        resource: Resource.IMAGE,
        operation: Operation.US_DRIVER_LICENSE_PARSER,
        model: 'vlm-1',
        expectedResult: { result: 'TestCaption' },
      },
    ];

    beforeEach(() => {
      jest.spyOn(ApiService, 'generateImageRequest').mockResolvedValue(
        createPredictionResponse({ response: { result: 'TestCaption' } })
      );
    });

    testCases.forEach(({ resource, operation, model, expectedResult }) => {
      it(`should perform ${operation} successfully`, async () => {
        // Arrange
        const mockExecuteFunctions = createMockExecuteFunctions({
          resource,
          operation,
          model,
        });

        // Act
        const result = await node.execute.call(mockExecuteFunctions);

        // Assert
        const response = result[0][0].json as IDataObject;
        expect(response.status).toBe('completed');
        expect(response.response).toEqual(expectedResult);
      });
    });
  });

  describe('Error Cases', () => {
    const errorTestCases = [
      {
        name: 'missing binary data',
        setup: () => createMockExecuteFunctions(
          {
            resource: Resource.IMAGE,
            operation: Operation.PRODUCT_CATALOG_PARSER,
            model: 'vlm-1',
          },
          false,
          true
        ),
      },
      {
        name: 'API errors',
        setup: () => {
          jest.spyOn(ApiService, 'generateImageRequest')
            .mockRejectedValue(new Error('API Error'));
          return createMockExecuteFunctions(
            {
              resource: Resource.IMAGE,
              operation: Operation.PRODUCT_CATALOG_PARSER,
              model: 'vlm-1',
            },
            true,
            true
          );
        },
        expectedError: 'API Error',
      },
      {
        name: 'invalid image data',
        setup: () => {
          const mockFunctions = createMockExecuteFunctions(
            {
              resource: Resource.IMAGE,
              operation: Operation.PRODUCT_CATALOG_PARSER,
              model: 'vlm-1',
            },
            true,
            true
          );
          mockFunctions.getInputData = () => [{
            binary: {
              data: {
                data: 'invalid-base64-data',
                mimeType: 'image/png',
                fileName: 'test.png',
              },
            },
            json: {},
          }];
          return mockFunctions;
        },
      },
    ];

    errorTestCases.forEach(({ name, setup, expectedError }) => {
      it(`should handle ${name}`, async () => {
        // Arrange
        const mockExecuteFunctions = setup();

        // Act
        const result = await node.execute.call(mockExecuteFunctions);

        // Assert
        const response = result[0][0].json as IDataObject;
        expect(response).toHaveProperty('error');
        if (expectedError) {
          expect(response.error).toBe(expectedError);
        } else {
          expect(typeof response.error).toBe('string');
        }
      });
    });
  });
});
