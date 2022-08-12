import {
  AnyRouter,
  Dict,
  ProcedureType,
  ResponseMeta,
  TRPCError,
  inferRouterContext,
  inferRouterError,
} from '@trpc/server';
import { URLSearchParams } from 'url';
import { BaseHandlerOptions } from '../../internals/baseHandlerOptions';
import { TRPCResponse } from '../../rpc';

export type HTTPHeaders = Dict<string | string[]>;

export interface HTTPResponse {
  status: number;
  headers?: HTTPHeaders;
  body?: string;
}

export interface HTTPRequest {
  method: string;
  query: URLSearchParams;
  headers: HTTPHeaders;
  body: unknown;
}

export type InferPathForType<
  TRouter extends AnyRouter,
  TType extends ProcedureType | 'unknown',
> = TType extends 'query'
  ? keyof TRouter['_def']['queries']
  : TType extends 'mutation'
  ? keyof TRouter['_def']['mutations']
  : TType extends 'subscription'
  ? keyof TRouter['_def']['subscriptions']
  : string;

export type ResponseMetaFnPayloadPaths<
  TRouter extends AnyRouter,
  TType extends ProcedureType | 'unknown',
> = TType extends ProcedureType | 'unknown'
  ? InferPathForType<TRouter, TType> extends never
    ? never
    : InferPathForType<TRouter, TType>[]
  : never;

export type ResponseMetaFnPayload<
  TRouter extends AnyRouter,
  TType extends ProcedureType | 'unknown' = ProcedureType | 'unknown',
> = {
  data: TRPCResponse<unknown, inferRouterError<TRouter>>[];
  ctx?: inferRouterContext<TRouter>;
  errors: TRPCError[];
  type: TType;
  paths?: ResponseMetaFnPayloadPaths<TRouter, TType>;
};

export type ResponseMetaFn<
  TRouter extends AnyRouter,
  TType extends ProcedureType | 'unknown' = ProcedureType | 'unknown',
> = (
  opts: TType extends any ? ResponseMetaFnPayload<TRouter, TType> : never,
) => ResponseMeta;

/**
 * Base interface for anything using HTTP
 */
export interface HTTPBaseHandlerOptions<TRouter extends AnyRouter, TRequest>
  extends BaseHandlerOptions<TRouter, TRequest> {
  /**
   * Add handler to be called before response is sent to the user
   * Useful for setting cache headers
   * @link https://trpc.io/docs/caching
   */
  responseMeta?: ResponseMetaFn<TRouter>;
}
