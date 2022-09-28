export const DEFAULT_LIMIT = 10;

export const ModelResp = (data, meta) => ({ data, ...(meta ? { meta } : {}) });
