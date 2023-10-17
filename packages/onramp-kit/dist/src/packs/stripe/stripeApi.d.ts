import { StripeDefaultOpenOptions, StripeSession } from './types'
export declare const createSession: (
  baseUrl: string,
  defaultOptions: StripeDefaultOpenOptions
) => Promise<StripeSession>
export declare const getSession: (baseUrl: string, sessionId: string) => Promise<any>
