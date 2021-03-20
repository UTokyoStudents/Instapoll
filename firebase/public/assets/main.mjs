
const CANONICAL_DOMAIN = 'ut-vote.web.app';

if (location.hostname != CANONICAL_DOMAIN) {
    location.hostname = CANONICAL_DOMAIN;
    throw void 0;
}

console.log('loaded');
