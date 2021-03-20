const functions = require('firebase-functions');
const admin = require('firebase-admin');

const ed = require('noble-ed25519');

admin.initializeApp();

const ticketsCollection = admin.firestore().collection('tickets');

exports.addTicket = functions.https.onRequest(async (req, res) => {
    try {
        const publicKey = Buffer.from(String(req.query.publicKey || ''), 'base64');
        if (publicKey.length != 32) {
            throw new TypeError('Invalid public key length');
        }
        const voteId = String(req.query.voteId || '').toLowerCase();
        if (!voteId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
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
            vote_data: data.toString('base64'),
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
