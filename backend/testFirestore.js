const db = require('./firestore');

async function test() {
  await db.collection('test').add({ hello: 'world', timestamp: new Date() });
  console.log('Test document written!');
}

test(); 