import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "../firebaseConfig";

export interface DocMetadata {
    id?: string;
    name: string;
    url: string;
    type: 'vendor' | 'research' | 'vendor_image';
    location?: 'front' | 'back'; // Specific for vendor images
    vendorId?: string; // Only if type === 'vendor'
    size: number;
    mimeType: string;
    createdAt?: any;
}

const getMimeTypeFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'pdf': return 'application/pdf';
        case 'doc': return 'application/msword';
        case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'xls': return 'application/vnd.ms-excel';
        case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'txt': return 'text/plain';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        default: return 'application/octet-stream';
    }
};

/**
 * Uploads a file to Storage and saves metadata to Firestore
 */
export const uploadDocument = async (
    file: File,
    type: 'vendor' | 'research' | 'vendor_image',
    vendorId?: string,
    location?: 'front' | 'back'
): Promise<DocMetadata> => {
    try {
        // 1. Upload to Storage
        // Path structure: documents/{type}/{optional_vendorId}/{filename}
        let path = `documents/${type}/`;
        if (vendorId) path += `${vendorId}/`;
        if (location) path += `${location}/`;
        path += `${Date.now()}_${file.name}`; // Time-prefixed to avoid collisions

        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // 2. Save Metadata to Firestore
        const mimeType = file.type || getMimeTypeFromExtension(file.name);
        const metadata: Omit<DocMetadata, 'id'> = {
            name: file.name,
            url: downloadURL,
            type,
            size: file.size,
            mimeType,
            createdAt: serverTimestamp()
        };

        if (vendorId) metadata.vendorId = vendorId;
        if (location) metadata.location = location;

        const docRef = await addDoc(collection(db, "documents"), metadata);

        return { id: docRef.id, ...metadata };

    } catch (error) {
        console.error("Error uploading document:", error);
        throw error;
    }
};

/**
 * Deletes a file from Storage and its metadata from Firestore
 */
export const deleteDocument = async (docId: string, fileUrl: string) => {
    try {
        // 1. Delete from Firestore first (for UI responsiveness)
        await deleteDoc(doc(db, "documents", docId));

        // 2. Delete from Storage
        const storageRef = ref(storage, fileUrl);
        await deleteObject(storageRef);

    } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
    }
};
