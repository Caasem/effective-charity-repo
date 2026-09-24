/**
 * `node-fetch` v2 never reads `HTTPS_PROXY`/`https_proxy` — it only proxies
 * when an explicit `agent` option is passed. Sandboxed environments that
 * gate egress through a forward proxy (this one included) reject a direct
 * connection outright, which looks exactly like an ordinary upstream 403 —
 * it isn't. This wraps `node-fetch` so every ingester actually routes
 * through the configured proxy instead of silently failing closed.
 */
import fetch, { RequestInit, Response } from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

export function proxiedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, proxyAgent ? { ...init, agent: proxyAgent as unknown as RequestInit['agent'] } : init);
}
