// Web-compatible camera service that mimics Capacitor's Camera API
// Falls back to HTML file input with camera capture for web environments

export enum CameraResultType {
  DataUrl = 'dataUrl',
  Base64 = 'base64'
}

export enum CameraSource {
  Camera = 'CAMERA',
  Photos = 'PHOTOS'
}

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType: CameraResultType;
  source: CameraSource;
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
        return await CapacitorCamera.getPhoto(options);
      } catch (error) {
        console.error('Capacitor Camera not available, falling back to web implementation');
      }
    }

    // Web fallback implementation
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

        // Convert to base64
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          resolve({
            dataUrl: dataUrl,
            base64String: dataUrl.split(',')[1] // Remove data:image/...;base64, prefix
          });
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
  }
};