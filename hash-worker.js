/* jslint browser: true, indent: 4 */
/* global self, importScripts, postMessage, asmCrypto, console */

importScripts('asmcrypto.js');

var activeHashes = {};

function updateHashes(filename, block) {
    "use strict";

    var currentState = activeHashes[filename];

    for (var hashName in currentState) { // jshint -W089
        currentState[hashName].process(block);
    }
}

self.addEventListener('message', function(evt) {
    "use strict";

    var d = evt.data,
        response = {'filename': d.filename, 'action': d.action};

    switch (d.action) {
        case 'start':
            activeHashes[d.filename] = {
                'sha1': new asmCrypto.SHA1(),
                'sha256': new asmCrypto.SHA256()
            };
            break;

        case 'update':
            updateHashes(d.filename, d.bytes);
            break;

        case 'stop':
            var output = response.output = {},
                currentState = activeHashes[d.filename];

            for (var hashName in currentState) { // jshint -W089
                var i = currentState[hashName].finish();
                output[hashName] = asmCrypto.bytes_to_hex(i.result);
            }

            delete activeHashes[d.filename];
            break;

        default:
            console.error('Unknown action', d.action);
    }

    postMessage(response);
});