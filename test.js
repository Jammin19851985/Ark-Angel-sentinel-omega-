import fs from 'fs';

async function test() {
    try {
        const res = await fetch('http://localhost:3000/spine-bridge/spine-status');
        console.log(res.status);
        console.log(await res.text());
        
        const res2 = await fetch('http://localhost:3000/spine-bridge/direct-status');
        console.log(res2.status);
        console.log(await res2.text());
    } catch(e) {
        console.error(e);
    }
}
test();
