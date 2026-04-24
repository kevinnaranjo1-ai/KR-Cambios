import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface ScamReport {
  id?: string;
  number: string;
  name?: string;
  reason: string;
  date: string;
  status: 'verified' | 'pending' | 'suspicious';
  reporterUid?: string;
}

const COLLECTION_NAME = 'scam_reports';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const reportScammer = async (report: Omit<ScamReport, 'id' | 'status' | 'reporterUid' | 'date'>) => {
  // Ensure date format matches security rules regex: YYYY-MM-DDTHH:MM:SS...
  const now = new Date();
  const dateStr = now.toISOString().split('.')[0] + 'Z'; // Format: YYYY-MM-DDTHH:MM:SSZ

  const newReport: Omit<ScamReport, 'id'> = {
    ...report,
    date: dateStr,
    status: 'pending',
    reporterUid: auth.currentUser?.uid || 'anonymous'
  };

  try {
    return await addDoc(collection(db, COLLECTION_NAME), newReport);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
  }
};

export const subscribeToReports = (callback: (reports: ScamReport[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ScamReport));
    callback(reports);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  });
};

export const searchReports = async (number: string) => {
  const q = query(collection(db, COLLECTION_NAME), where('number', '==', number));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ScamReport));
};
