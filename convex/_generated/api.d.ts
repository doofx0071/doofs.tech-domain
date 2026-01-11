/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as contact from "../contact.js";
import type * as crons from "../crons.js";
import type * as dns from "../dns.js";
import type * as dnsJobs from "../dnsJobs.js";
import type * as dnsProvider_cloudflare from "../dnsProvider/cloudflare.js";
import type * as domains from "../domains.js";
import type * as domainsInternal from "../domainsInternal.js";
import type * as emailService from "../emailService.js";
import type * as emailTemplates_adminNotification from "../emailTemplates/adminNotification.js";
import type * as http from "../http.js";
import type * as lib from "../lib.js";
import type * as platformDns from "../platformDns.js";
import type * as platformDomains from "../platformDomains.js";
import type * as profile from "../profile.js";
import type * as ratelimit from "../ratelimit.js";
import type * as settings from "../settings.js";
import type * as storage from "../storage.js";
import type * as users from "../users.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  contact: typeof contact;
  crons: typeof crons;
  dns: typeof dns;
  dnsJobs: typeof dnsJobs;
  "dnsProvider/cloudflare": typeof dnsProvider_cloudflare;
  domains: typeof domains;
  domainsInternal: typeof domainsInternal;
  emailService: typeof emailService;
  "emailTemplates/adminNotification": typeof emailTemplates_adminNotification;
  http: typeof http;
  lib: typeof lib;
  platformDns: typeof platformDns;
  platformDomains: typeof platformDomains;
  profile: typeof profile;
  ratelimit: typeof ratelimit;
  settings: typeof settings;
  storage: typeof storage;
  users: typeof users;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
