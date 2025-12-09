import { doc, getDoc, setDoc, getDocs, collection, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Vendor Data API
export const vendorAPI = {
    // Get all vendors
    getAll: async () => {
        const snapshot = await getDocs(collection(db, 'vendors'));
        return snapshot.docs.map(doc => ({ name: doc.id, ...doc.data() }));
    },

    // Get specific vendor
    get: async (vendorName: string) => {
        const docRef = doc(db, 'vendors', vendorName);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { data: docSnap.data() };
        }
        return { data: null };
    },

    // Save vendor data
    save: async (vendorName: string, data: any) => {
        const docRef = doc(db, 'vendors', vendorName);
        await setDoc(docRef, data, { merge: true });
        return { success: true };
    },

    // Add new vendor
    add: async (vendorName: string) => {
        const docRef = doc(db, 'vendors', vendorName);
        const defaultData = {
            name: vendorName,
             // Default scores (all 5s)
            scores: Array(10).fill(5),
            // Default narrative
            bestFor: 'New vendor description...',
            pros: ['Strength 1'],
            cons: ['Weakness 1']
        };
        await setDoc(docRef, defaultData);
        return { success: true };
    },

    // Delete vendor
    delete: async (vendorName: string) => {
        await deleteDoc(doc(db, 'vendors', vendorName));
        return { success: true };
    },

    // Seed vendors if empty
    seed: async (vendors: any[]) => {
        const batch = writeBatch(db);
        vendors.forEach(v => {
            const docRef = doc(db, 'vendors', v.name);
            batch.set(docRef, v);
        });
        await batch.commit();
        return { success: true };
    }
};

// Notes API
export const notesAPI = {
    // Get notes
    get: async (vendorName: string) => {
        const docRef = doc(db, 'notes', vendorName);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return { notes: '' };
    },

    // Save notes
    save: async (vendorName: string, notes: string) => {
        const docRef = doc(db, 'notes', vendorName);
        await setDoc(docRef, { notes }, { merge: true });
        return { success: true };
    }
};

// Weights API
export const weightsAPI = {
    // Get weights
    get: async () => {
        const docRef = doc(db, 'settings', 'weights');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return {};
    },

    // Save weights
    save: async (weights: any) => {
        const docRef = doc(db, 'settings', 'weights');
        await setDoc(docRef, weights, { merge: true });
        return { success: true };
    }
};

// Health check (Simulated)
export const healthCheck = async () => {
    return true;
};

// Capacity Calculator API
export const calculatorAPI = {
    // Get calculator settings
    get: async () => {
        const docRef = doc(db, 'settings', 'capacityCalculator');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    },

    // Save calculator settings
    save: async (data: any) => {
        const docRef = doc(db, 'settings', 'capacityCalculator');
        await setDoc(docRef, data, { merge: true });
        return { success: true };
    }
};

