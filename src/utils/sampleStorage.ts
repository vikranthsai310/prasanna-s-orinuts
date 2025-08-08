import { Product } from '@/types/product';

const SAMPLES_STORAGE_KEY = 'selected_samples';

export interface SelectedSample {
  id: string;
  name: string;
  image: string;
  selectedAt: number; // timestamp
}

export const sampleStorage = {
  // Save selected samples to localStorage
  saveSelectedSamples: (samples: Product[]): void => {
    const selectedSamples: SelectedSample[] = samples.map(sample => ({
      id: sample.id,
      name: sample.name,
      image: sample.image,
      selectedAt: Date.now()
    }));
    
    localStorage.setItem(SAMPLES_STORAGE_KEY, JSON.stringify(selectedSamples));
  },

  // Get selected samples from localStorage
  getSelectedSamples: (): SelectedSample[] => {
    try {
      const stored = localStorage.getItem(SAMPLES_STORAGE_KEY);
      if (!stored) return [];
      
      const samples: SelectedSample[] = JSON.parse(stored);
      
      // Check if samples are not too old (optional: expire after 24 hours)
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      const validSamples = samples.filter(sample => 
        now - sample.selectedAt < twentyFourHours
      );
      
      // If some samples expired, update storage
      if (validSamples.length !== samples.length) {
        if (validSamples.length === 0) {
          sampleStorage.clearSelectedSamples();
        } else {
          localStorage.setItem(SAMPLES_STORAGE_KEY, JSON.stringify(validSamples));
        }
      }
      
      return validSamples;
    } catch (error) {
      console.error('Error reading selected samples from storage:', error);
      return [];
    }
  },

  // Check if user has already selected samples
  hasSamplesSelected: (): boolean => {
    const samples = sampleStorage.getSelectedSamples();
    return samples.length === 2;
  },

  // Clear selected samples
  clearSelectedSamples: (): void => {
    localStorage.removeItem(SAMPLES_STORAGE_KEY);
  },

  // Get sample IDs for quick checking
  getSelectedSampleIds: (): string[] => {
    return sampleStorage.getSelectedSamples().map(sample => sample.id);
  }
};