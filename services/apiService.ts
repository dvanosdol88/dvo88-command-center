const API_BASE_URL = 'http://localhost:3001/api';

// Vendor Data API
export const vendorAPI = {
    // Get all vendors
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/vendors`);
        if (!response.ok) throw new Error('Failed to fetch vendors');
        return response.json();
    },

    // Get specific vendor
    get: async (vendorName: string) => {
        const response = await fetch(`${API_BASE_URL}/vendors/${vendorName}`);
        if (!response.ok) throw new Error('Failed to fetch vendor');
        return response.json();
    },

    // Save vendor data
    save: async (vendorName: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/vendors/${vendorName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to save vendor');
        return response.json();
    }
};

// Images API
export const imagesAPI = {
    // Get images
    get: async (vendorName: string, location: 'front' | 'back') => {
        const response = await fetch(`${API_BASE_URL}/images/${vendorName}/${location}`);
        if (!response.ok) throw new Error('Failed to fetch images');
        return response.json();
    },

    // Save images
    save: async (vendorName: string, location: 'front' | 'back', images: string[]) => {
        const response = await fetch(`${API_BASE_URL}/images/${vendorName}/${location}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images })
        });
        if (!response.ok) throw new Error('Failed to save images');
        return response.json();
    }
};

// Notes API
export const notesAPI = {
    // Get notes
    get: async (vendorName: string) => {
        const response = await fetch(`${API_BASE_URL}/notes/${vendorName}`);
        if (!response.ok) throw new Error('Failed to fetch notes');
        return response.json();
    },

    // Save notes
    save: async (vendorName: string, notes: string) => {
        const response = await fetch(`${API_BASE_URL}/notes/${vendorName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes })
        });
        if (!response.ok) throw new Error('Failed to save notes');
        return response.json();
    }
};

// Weights API
export const weightsAPI = {
    // Get weights
    get: async () => {
        const response = await fetch(`${API_BASE_URL}/weights`);
        if (!response.ok) throw new Error('Failed to fetch weights');
        return response.json();
    },

    // Save weights
    save: async (weights: any) => {
        const response = await fetch(`${API_BASE_URL}/weights`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(weights)
        });
        if (!response.ok) throw new Error('Failed to save weights');
        return response.json();
    }
};

// Health check
export const healthCheck = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch {
        return false;
    }
};
