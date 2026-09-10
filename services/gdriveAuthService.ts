import { User } from 'firebase/auth';
import { 
  app, 
  auth, 
  db, 
  provider, 
  initAuth, 
  googleSignIn, 
  getAccessToken, 
  logout, 
  OperationType, 
  handleFirestoreError 
} from '../firebase';

// Add specific additional Workspace scopes if not already present
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/documents');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/gmail.modify');
provider.addScope('https://www.googleapis.com/auth/calendar');
provider.addScope('https://www.googleapis.com/auth/forms.body');
provider.addScope('https://www.googleapis.com/auth/presentations');
provider.addScope('https://www.googleapis.com/auth/chat.spaces');
provider.addScope('https://www.googleapis.com/auth/meetings.space.created');
provider.addScope('https://www.googleapis.com/auth/contacts');
provider.addScope('https://www.googleapis.com/auth/tasks');

export { 
  app, 
  auth, 
  db, 
  provider, 
  initAuth, 
  googleSignIn, 
  getAccessToken, 
  logout, 
  OperationType, 
  handleFirestoreError 
};
export type { User };
