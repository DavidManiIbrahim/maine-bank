const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave('a', 'b');
console.log('FLW keys:', Object.keys(flw));
if (flw.Payment) console.log('flw.Payment keys:', Object.keys(flw.Payment));
if (flw.Standard) console.log('flw.Standard keys:', Object.keys(flw.Standard));
if (flw.Transaction) console.log('flw.Transaction keys:', Object.keys(flw.Transaction));
