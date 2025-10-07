import esTranslations from '../../lang/es.json';
import enTranslations from '../../lang/en.json';

const translations = {
    es: esTranslations,
    en: enTranslations
};

const getCurrentLang = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('language') || 'es';
    }
    return 'es';
};

const getCurrentTranslations = () => {
    const lang = getCurrentLang();
    return translations[lang] || translations.es;
};

export default getCurrentTranslations();