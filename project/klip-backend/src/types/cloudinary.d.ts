declare module 'cloudinary' {
  export const v2: {
    config(options: { cloud_name?: string; api_key?: string; api_secret?: string }): void;
    uploader: {
      upload_stream(options: any, callback: (error: any, result: any) => void): any;
      destroy(publicId: string, callback: (error: any, result: any) => void): void;
    };
  };
}
