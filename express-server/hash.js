const bcrypt = require('bcrypt');

async function run() {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('123411', salt);
    console.log(salt);
    console.log(hashed);
}

run();
