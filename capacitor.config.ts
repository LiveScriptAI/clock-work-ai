import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.81a1333706fb4e8498ba2564fed9cd48',
  appName: 'Clock Work Pal',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'This app needs access to camera to take photos for timesheet documentation.',
        photos: 'This app needs access to photo library to select existing photos.'
      }
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#000000'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff'
  },
  android: {
    backgroundColor: '#ffffff'
  }
};

export default config;