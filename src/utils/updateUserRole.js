import { ref, update } from 'firebase/database';
import { database, auth } from '../config/firebase';

// Run this function once to update your role to admin
export const updateCurrentUserToAdmin = async () => {
  const user = auth.currentUser;
  if (user) {
    const userRef = ref(database, `users/${user.uid}`);
    await update(userRef, {
      role: 'admin'
    });
    console.log('User role updated to admin! Please refresh the page.');
    window.location.reload();
  }
};

// Call this in browser console: window.updateToAdmin()
if (typeof window !== 'undefined') {
  window.updateToAdmin = updateCurrentUserToAdmin;
}
