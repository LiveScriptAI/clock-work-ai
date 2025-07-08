// Enhanced mobile-first camera service optimized for iOS
// Uses Capacitor Camera API with proper permission handling and fallbacks

export enum CameraResultType {
  DataUrl = 'dataUrl',
  Base64 = 'base64'
}

export enum CameraSource {
  Camera = 'CAMERA',
  Photos = 'PHOTOS'
}

export enum CameraDirection {
  Rear = 'REAR',
  Front = 'FRONT'
}

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType: CameraResultType;
  source: CameraSource;
  direction?: CameraDirection;
  width?: number;
  height?: number;
}

export interface CameraPhoto {
  dataUrl?: string;
  base64String?: string;
}

// Check if we're running in a Capacitor environment
const isCapacitorEnvironment = () => {
  return !!(window as any).Capacitor;
};

export const Camera = {
  async getPhoto(options: CameraOptions): Promise<CameraPhoto> {
    // If we're in a Capacitor environment, use the real Capacitor Camera
    if (isCapacitorEnvironment()) {
      try {
        const { Camera: CapacitorCamera } = await import('@capacitor/camera');
        
        // Enhanced options for iOS compatibility
        const enhancedOptions = {
          ...options,
          quality: options.quality || 80,
          direction: options.direction || CameraDirection.Rear,
          width: options.width || 1920,
          height: options.height || 1080,
          allowEditing: options.allowEditing || false,
          saveToGallery: false, // Don't save to gallery to prevent permission issues
          correctOrientation: true // Fix orientation issues on iOS
        };

        console.log('Opening camera with options:', enhancedOptions);
        
        const photo = await CapacitorCamera.getPhoto(enhancedOptions);
        
        if (!photo.dataUrl && !photo.base64String) {
          throw new Error('Camera returned empty image data');
        }
        
        console.log('Camera photo captured successfully');
        return photo;
        
      } catch (error: any) {
        console.error('Capacitor Camera error:', error);
        
        // Provide user-friendly error messages
        if (error.message?.includes('permission') || error.message?.includes('denied')) {
          throw new Error('Camera access is needed to take a photo. Please enable camera permissions in your device settings.');
        } else if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
          throw new Error('Camera was cancelled');
        } else {
          throw new Error('Unable to access camera. Please try again or check your device permissions.');
        }
      }
    }

    // Web fallback implementation
    console.log('Using web fallback for camera');
    return new Promise((resolve, reject) => {
      // Create a hidden file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      // Set capture attribute for camera if source is Camera
      if (options.source === CameraSource.Camera) {
        input.setAttribute('capture', 'camera');
      }

      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          reject(new Error('Selected file is not an image'));
          return;
        }

        // Convert to base64 with compression
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          
          // Optional: Compress image for mobile performance
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set max dimensions for mobile optimization
            const maxWidth = options.width || 1920;
            const maxHeight = options.height || 1080;
            
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx?.drawImage(img, 0, 0, width, height);
            
            const compressedDataUrl = canvas.toDataURL('image/jpeg', (options.quality || 80) / 100);
            
            resolve({
              dataUrl: compressedDataUrl,
              base64String: compressedDataUrl.split(',')[1]
            });
          };
          
          img.src = dataUrl;
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
      };

      input.oncancel = () => {
        reject(new Error('User cancelled camera'));
      };

      // Trigger the file picker
      input.click();
    });
  },
  
  // Helper method to check camera permissions
  async checkPermissions() {
    if (isCapacitorEnvironment()) {
      try {
        const { Camera: CapacitorCamera } = await import('@capacitor/camera');
        return await CapacitorCamera.checkPermissions();
      } catch (error) {
        console.error('Could not check camera permissions:', error);
        return { camera: 'prompt' };
      }
    }
    return { camera: 'granted' }; // Web assumes granted
  },
  
  // Helper method to request camera permissions
  async requestPermissions() {
    if (isCapacitorEnvironment()) {
      try {
        const { Camera: CapacitorCamera } = await import('@capacitor/camera');
        return await CapacitorCamera.requestPermissions();
      } catch (error) {
        console.error('Could not request camera permissions:', error);
        return { camera: 'denied' };
      }
    }
    return { camera: 'granted' }; // Web assumes granted
  }
};