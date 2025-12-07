import { vendorAPI } from '../services/apiService';

// Vendor data manager with remote storage
export class VendorDataManager {
    private static cache: Map<string, any> = new Map();

    static async getVendorData(vendorName: string) {
        try {
            const data = await vendorAPI.get(vendorName);
            this.cache.set(vendorName, data.data);
            return data.data;
        } catch (error) {
            // Fallback to cache or default
            return this.cache.get(vendorName) || this.getDefaultData(vendorName);
        }
    }

    static async saveVendorData(vendorName: string, data: any) {
        try {
            await vendorAPI.save(vendorName, data);
            this.cache.set(vendorName, data);
            return true;
        } catch (error) {
            console.error('Failed to save vendor data:', error);
            return false;
        }
    }

    static getDefaultData(vendorName: string) {
        return {
            pros: [],
            cons: [],
            bestFor: ''
        };
    }
}
