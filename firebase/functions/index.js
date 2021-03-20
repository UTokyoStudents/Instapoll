const functions = require('firebase-functions');
const admin = require('firebase-admin');

const ed = require('noble-ed25519');

admin.initializeApp();

const ticketsCollection = admin.firestore().collection('tickets');

const validateUuid = uuid => !!String(uuid).match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

const formatUuid = buffer => [
    buffer.slice(0, 4).toString('hex'),
    buffer.slice(4, 6).toString('hex'),
    buffer.slice(6, 8).toString('hex'),
    buffer.slice(8, 10).toString('hex'),
    buffer.slice(10, 16).toString('hex'),
].join('-');

exports.addTicket = functions.https.onRequest(async (req, res) => {
    try {
        const publicKey = Buffer.from(String(req.query.publicKey || ''), 'base64');
        if (publicKey.length != 32) {
            throw new TypeError('Invalid public key length');
        }
        const voteId = String(req.query.voteId || '').toLowerCase();
        if (!validateUuid(voteId)) {
            throw new TypeError('Invalid UUID');
        }
        const base64PublicKey = publicKey.toString('base64');
        const ticketDoc = await ticketsCollection.doc(base64PublicKey).get();
        if (ticketDoc.exists) {
            throw new TypeError('Duplicate public key detected');
        }
        await ticketsCollection.doc(base64PublicKey).set({
            public_key: base64PublicKey,
            vote_id: voteId,
            voted: false,
            vote_data: '',
            signature: '',
        });
    } catch (e) {
        res.json({
            error: String(e),
        });
    }
});

exports.vote = functions.https.onRequest(async (req, res) => {
    try {
        const publicKey = Buffer.from(String(req.query.publicKey || ''), 'base64');
        if (publicKey.length != 32) {
            throw new TypeError('Invalid public key length');
        }
        const base64PublicKey = publicKey.toString('base64');
        const signature = Buffer.from(String(req.query.signature || ''), 'base64');
        if (signature.length != 32) {
            throw new TypeError('Invalid signature length');
        }
        const data = Buffer.from(String(req.query.data || ''), 'base64');
        if (data.length != 16) {
            throw new TypeError('Invalid data');
        }
        const ticketDoc = await ticketsCollection.doc(base64PublicKey).get();
        if (!ticketDoc.exists) {
            throw new TypeError('Ticket not found');
        }
        const ticket = ticketDoc.data();
        if (ticket.voted) {
            throw new TypeError('Already voted');
        }
        if (!await ed.verify(signature, data, publicKey)) {
            throw 'Broken signature';
        }
        await ticketsCollection.doc(base64PublicKey).set({
            voted: true,
            vote_data: formatUuid(data),
            signature: signature.toString('base64'),
        }, {merge: true});
        res.status(200).json({
            error: null,
        });
    } catch (e) {
        res.status(400).json({
            error: String(e),
        });
    }
});

exports.count = functions.https.onRequest(async (req, res) => {
    try {
        const voteId = String(req.query.voteId || '');
        if (!validateUuid(voteId)) {
            throw new TypeError('Invalid UUID');
        }
        const ticketsSnapshot = await ticketsCollection.where('vote_id', '==', voteId).get();
        const results = Object.create(null);
        const votesCount = 0;
        for (const ticket of ticketsSnapshot) {
            if (!ticket.voted) {
                continue;
            }
            votesCount++;
            results[ticket.vote_data] = 1 + 0 | results[ticket.vote_data];
        }
        res.status(200).json({
            error: null,
            votesCount,
            results,
        });
    } catch (e) {
        res.status(400).json({
            error: String(e),
        });
    }
});
