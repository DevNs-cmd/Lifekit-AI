import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { SuccessResponse, PaginatedResponse } from "../utils/api-response.util";

export const ApiCustomResponse = <TModel extends Type<any>>(
  model: TModel,
  description?: string,
) => {
  return applyDecorators(
    ApiExtraModels(SuccessResponse, model),
    ApiOkResponse({
      description: description || "Request completed successfully",
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
};

export const ApiCustomPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
  description?: string,
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedResponse, model),
    ApiOkResponse({
      description: description || "Request completed successfully",
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponse) },
          {
            properties: {
              data: {
                type: "array",
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
