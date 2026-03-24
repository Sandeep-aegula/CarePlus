require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function checkUsers() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await mongoose.connection.db.collection('users')
        .find(
            { email: { $in: ['test@gmail.com', 'testuser@gmail.com'] } },
            { projection: { email: 1, role: 1, name: 1 } }
        ).toArray();
    console.log(JSON.stringify(users, null, 2));
    process.exit();
}

checkUsers().catch(e => { console.error(e); process.exit(1); });
