
import * as rand from './random.mjs';
import * as hex from './hex.mjs';

export const random = () => {
    const bytes = new Uint8Array(16);
    rand.fill(bytes);
    bytes[6] = bytes[6] & 0x0f ^ 0x40;
    bytes[8] = bytes[8] & 0x3f ^ 0x80;
    const hexStr = hex.encode(bytes);
    return [
        hexStr.substr(0, 8),
        hexStr.substr(8, 4),
        hexStr.substr(12, 4),
        hexStr.substr(16, 4),
        hexStr.substr(20, 12),
    ].join('-');
};

export const validate = uuid => !!String(uuid).match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
);
