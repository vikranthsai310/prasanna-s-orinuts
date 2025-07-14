import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Dynamically loads an external script
 * @param src URL of the script to load
 * @returns Promise that resolves to true if the script loaded successfully, false otherwise
 */
export const loadScript = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve(true);
      return;
    }

    // Create and add the script element
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error(`Failed to load script: ${src}`);
      resolve(false);
    };
    document.body.appendChild(script);
  });
};
