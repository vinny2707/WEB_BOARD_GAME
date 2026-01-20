/**
 * Game Settings Configuration
 * 
 * Utilities for parsing game settings from API.
 * Settings now come in nested format with value, options, label, etc.
 * 
 * New API format example:
 * {
 *   "timePerTurn": {
 *     "value": 40,
 *     "type": "select",
 *     "options": [
 *       { "value": 0, "label": "Không giới hạn" },
 *       { "value": 30, "label": "30 giây" }
 *     ],
 *     "label": "Thời gian mỗi lượt",
 *     "labelEn": "Time per turn"
 *   }
 * }
 */

import { getGameById } from '../../../api/gamesApi';

/**
 * Fetch game settings from API
 * @param {number} gameId - The game ID to fetch settings for
 * @returns {Promise<{settings: object, gameData: object}>}
 */
export async function fetchGameSettings(gameId) {
    if (!gameId) {
        return { settings: null, gameData: null };
    }

    try {
        const response = await getGameById(gameId);
        if (response.success && response.data) {
            return {
                settings: response.data.settings || {},
                gameData: response.data,
            };
        }
        return { settings: null, gameData: null };
    } catch (error) {
        console.error('Failed to fetch game settings:', error);
        return { settings: null, gameData: null };
    }
}

/**
 * Check if a specific setting exists in API response
 * @param {object} apiSettings - Settings from API (nested format)
 * @param {string} settingKey - The setting key to check
 * @returns {boolean}
 */
export function hasApiSetting(apiSettings, settingKey) {
    return apiSettings && settingKey in apiSettings;
}

/**
 * Get the current value of a setting
 * @param {object} apiSettings - Settings from API
 * @param {string} settingKey - The setting key
 * @returns {any} - The value or undefined
 */
export function getSettingValue(apiSettings, settingKey) {
    if (!hasApiSetting(apiSettings, settingKey)) return undefined;
    const setting = apiSettings[settingKey];
    // Handle both new nested format and old simple format
    return typeof setting === 'object' && setting !== null && 'value' in setting
        ? setting.value
        : setting;
}

/**
 * Get the setting metadata (label, options, etc.)
 * @param {object} apiSettings - Settings from API
 * @param {string} settingKey - The setting key
 * @returns {object|null}
 */
export function getSettingMeta(apiSettings, settingKey) {
    if (!hasApiSetting(apiSettings, settingKey)) return null;
    const setting = apiSettings[settingKey];
    if (typeof setting === 'object' && setting !== null) {
        return setting;
    }
    return null;
}

/**
 * Get options for a select-type setting
 * @param {object} apiSettings - Settings from API
 * @param {string} settingKey - The setting key
 * @returns {array} - Array of options
 */
export function getSettingOptions(apiSettings, settingKey) {
    const meta = getSettingMeta(apiSettings, settingKey);
    return meta?.options || [];
}

/**
 * Get label for a setting
 * @param {object} apiSettings - Settings from API
 * @param {string} settingKey - The setting key
 * @param {string} lang - Language ('vi' or 'en')
 * @returns {string}
 */
export function getSettingLabel(apiSettings, settingKey, lang = 'vi') {
    const meta = getSettingMeta(apiSettings, settingKey);
    if (!meta) return settingKey;
    return lang === 'en' ? (meta.labelEn || meta.label) : meta.label;
}

/**
 * Get display label for a value from options
 * @param {object} apiSettings - Settings from API
 * @param {string} settingKey - The setting key
 * @param {any} value - The value to find label for
 * @param {string} lang - Language ('vi' or 'en')
 * @returns {string}
 */
export function getOptionLabel(apiSettings, settingKey, value, lang = 'vi') {
    const options = getSettingOptions(apiSettings, settingKey);
    const option = options.find(opt => opt.value === value);
    if (!option) return String(value);
    return lang === 'en' ? (option.labelEn || option.label) : option.label;
}

/**
 * Get color for a value (e.g., difficulty)
 * @param {object} apiSettings - Settings from API
 * @param {string} settingKey - The setting key
 * @param {any} value - The value to find color for
 * @returns {string} - Color class or empty string
 */
export function getOptionColor(apiSettings, settingKey, value) {
    const options = getSettingOptions(apiSettings, settingKey);
    const option = options.find(opt => opt.value === value);
    return option?.color || '';
}

/**
 * Get icon for a value
 * @param {object} apiSettings - Settings from API
 * @param {string} settingKey - The setting key
 * @param {any} value - The value to find icon for
 * @returns {string}
 */
export function getOptionIcon(apiSettings, settingKey, value) {
    const options = getSettingOptions(apiSettings, settingKey);
    const option = options.find(opt => opt.value === value);
    return option?.icon || '';
}

/**
 * Extract flat values from nested settings for use in game logic
 * @param {object} apiSettings - Settings from API (nested format)
 * @returns {object} - Flat object with just key: value pairs
 */
export function extractSettingValues(apiSettings) {
    if (!apiSettings) return {};

    const values = {};
    for (const key of Object.keys(apiSettings)) {
        values[key] = getSettingValue(apiSettings, key);
    }
    return values;
}

/**
 * Get setting type (select, number, toggle)
 * @param {object} apiSettings - Settings from API
 * @param {string} settingKey - The setting key
 * @returns {string}
 */
export function getSettingType(apiSettings, settingKey) {
    const meta = getSettingMeta(apiSettings, settingKey);
    return meta?.type || 'select';
}

/**
 * Format display value using option label if available
 * @param {object} apiSettings - Settings from API
 * @param {string} settingKey - The setting key
 * @param {any} value - The current value
 * @returns {string}
 */
export function formatDisplayValue(apiSettings, settingKey, value) {
    const options = getSettingOptions(apiSettings, settingKey);
    if (options.length > 0) {
        return getOptionLabel(apiSettings, settingKey, value);
    }
    // Fallback for simple values
    if (typeof value === 'boolean') {
        return value ? 'Bật' : 'Tắt';
    }
    return String(value);
}

/**
 * Get all setting keys from API response
 * @param {object} apiSettings - Settings from API
 * @returns {string[]}
 */
export function getSettingKeys(apiSettings) {
    if (!apiSettings) return [];
    return Object.keys(apiSettings);
}

/**
 * Legacy compatibility - format setting value for display
 * @deprecated Use formatDisplayValue instead
 */
export function formatSettingValue(settingKey, value) {
    // Simple formatters for backwards compatibility
    if (settingKey === 'boardSize' || settingKey === 'gridSize') {
        return `${value}x${value}`;
    }
    if (settingKey === 'timePerTurn' || settingKey === 'timePerPlayer') {
        if (value === 0) return 'Không giới hạn';
        if (value < 60) return `${value} giây`;
        const mins = Math.floor(value / 60);
        return `${mins} phút`;
    }
    return String(value);
}
