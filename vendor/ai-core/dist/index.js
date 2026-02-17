export class AiCoreError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = "AiCoreError";
    }
}
function withTimeout(p, ms, label) {
    if (!Number.isFinite(ms) || ms <= 0)
        return p;
    return Promise.race([
        p,
        new Promise((_resolve, reject) => {
            const t = setTimeout(() => reject(new AiCoreError(`${label} timed out after ${ms}ms`)), ms);
            // Avoid keeping the process alive solely for the timeout timer.
            // @ts-expect-error - Node has unref(), browsers don't.
            if (typeof t?.unref === "function")
                t.unref();
        }),
    ]);
}
// Minimal router: sequential failover with optional per-provider timeouts.
export class ProviderRouter {
    providers;
    opts;
    name = "router";
    constructor(providers, opts = {}) {
        this.providers = providers;
        this.opts = opts;
        if (providers.length === 0)
            throw new AiCoreError("ProviderRouter requires at least one provider");
    }
    async chat(req) {
        let lastError;
        for (const provider of this.providers) {
            try {
                const timeoutMs = this.opts.providerTimeoutMs?.[provider.name] ?? this.opts.perProviderTimeoutMs ?? 0;
                const res = await withTimeout(provider.chat(req), timeoutMs, `provider:${provider.name}`);
                return { ...res, provider: provider.name };
            }
            catch (err) {
                lastError = err;
                if (this.opts.debug) {
                    // eslint-disable-next-line no-console
                    console.warn(`[ai-core] provider failed: ${provider.name}:`, err instanceof Error ? err.message : err);
                }
            }
        }
        throw new AiCoreError("All providers failed", lastError);
    }
}
//# sourceMappingURL=index.js.map