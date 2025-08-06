import { db } from '../../config/database';
import { users } from '../schema/users';
import * as bcrypt from '@node-rs/bcrypt';
import { eq } from 'drizzle-orm';

async function hashExistingPasswords() {
  try {
    const allUsers = await db.select().from(users);
    const hashedPassword = await bcrypt.hash('changeme', 10);

    for (const user of allUsers) {
      if (user.password === 'changeme') {
        await db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, user.id));
      }
    }
    
    console.log('Successfully hashed default passwords');
  } catch (error) {
    console.error('Error hashing passwords:', error);
    throw error;
  }
}

if (require.main === module) {
  hashExistingPasswords()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { hashExistingPasswords };
