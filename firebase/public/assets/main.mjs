
import * as ed from '/assets/noble-ed25519-1.0.3.mjs';
import * as base64 from '/assets/base64.mjs';
import * as uuid from '/assets/uuid.mjs';

const CANONICAL_DOMAIN = 'ut-vote.web.app';

if (location.hostname != CANONICAL_DOMAIN) {
    location.hostname = CANONICAL_DOMAIN;
    throw void 0;
}

console.log('loaded');


