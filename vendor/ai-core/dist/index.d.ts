export type Role = "system" | "user" | "assistant" | "tool";
export type ChatMessage = {
    role: Role;
    content: string;
    name?: string;
};
export type ChatRequest = {
    messages: ChatMessage[];
    appId: string;
};
export type ChatResponse = {
    message: ChatMessage;
    provider?: string;
    model?: string;
};
export declare class AiCoreError extends Error {
    readonly cause?: unknown | undefined;
    constructor(message: string, cause?: unknown | undefined);
}
export interface AiProvider {
    readonly name: string;
    chat(req: ChatRequest): Promise<ChatResponse>;
}
export type ProviderRouterOptions = {
    perProviderTimeoutMs?: number;
    providerTimeoutMs?: Partial<Record<string, number>>;
    debug?: boolean;
};
export declare class ProviderRouter implements AiProvider {
    private readonly providers;
    private readonly opts;
    readonly name = "router";
    constructor(providers: AiProvider[], opts?: ProviderRouterOptions);
    chat(req: ChatRequest): Promise<ChatResponse>;
}
//# sourceMappingURL=index.d.ts.map