Items that are moved in a CRDT sequence are (instead) *removed* from the sequence.

1. npm run build
2. npm start
3. load `http://localhost:8080`
4. Wait 5 seconds. see a 3 item sequence as json
5. Comment out lines 63 - 66 in `client.js`
6. npm run build; npm start
7. load `http://localhost:8080`
8. 'a' is missing from the sequence
