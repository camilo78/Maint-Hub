import type { route as routeFn } from 'ziggy-js';
import type { AxiosInstance } from 'axios';

declare global {
    const route: typeof routeFn;

    interface Window {
        axios: AxiosInstance;
    }
}
