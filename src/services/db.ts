import { collection, addDoc, onSnapshot, DocumentData, QuerySnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const addItem = async (collectionName: string, data: any) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const subscribeToItems = (collectionName: string, callback: (items: any[]) => void) => {
    const q = collection(db, collectionName);
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
        const items: any[] = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
        });
        callback(items);
    });
    return unsubscribe;
};
