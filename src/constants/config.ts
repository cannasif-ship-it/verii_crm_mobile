import appConfig from "../../config.json";

export const API_BASE_URL = (appConfig as { apiUrl?: string }).apiUrl ?? "https://crmapi.v3rii.com";
export const API_TIMEOUT = (appConfig as { apiTimeout?: number }).apiTimeout ?? 10000;
