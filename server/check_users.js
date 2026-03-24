require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Update test@gmail.com role to doctor
    const result = await mongoose.connection.db.collection('users').updateOne(
        { email: 'test@gmail.com' },
        { $set: { role: 'doctor' } }
    );
    console.log('Updated test@gmail.com to doctor:', result.modifiedCount > 0 ? 'SUCCESS' : 'NO CHANGE');
    
    // Verify all users
    const users = await mongoose.connection.db.collection('users')
        .find({}, { projection: { email: 1, role: 1, name: 1 } })
        .toArray();
    users.forEach(u => {
        console.log(u.email + ' | role: ' + u.role + ' | name: ' + u.name);
    });
    
    process.exit();
}

main().catch(e => { console.error(e); process.exit(1); });
