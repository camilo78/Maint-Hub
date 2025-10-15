import axios from 'axios';

/**
 * Configure Axios to send CSRF token with every request
 */
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Get CSRF token from cookies or meta tag
 */
const token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
} else {
    // If no meta tag, try to get from cookie
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken) {
        window.axios.defaults.headers.common['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
    }
}
