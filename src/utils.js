export const ModelResp = (data, meta) => ({ data, ...(meta ? { meta } : {}) });
