// File Upload Security
export interface FileUploadConfig {
  maxSize: number; // in bytes
  allowedTypes: string[];
  allowedExtensions: string[];
}

export const DEFAULT_UPLOAD_CONFIG: FileUploadConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.csv', '.xls', '.xlsx', '.txt']
};

export const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.app', '.deb', '.pkg', '.dmg', '.rpm', '.sh', '.ps1', '.php', '.asp',
  '.jsp', '.py', '.rb', '.pl', '.cgi'
];

export class FileUploadValidator {
  private config: FileUploadConfig;

  constructor(config: FileUploadConfig = DEFAULT_UPLOAD_CONFIG) {
    this.config = config;
  }

  validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size
    if (file.size > this.config.maxSize) {
      errors.push(`Dosya boyutu ${this.formatFileSize(this.config.maxSize)} limitini aşıyor`);
    }

    // Check MIME type
    if (!this.config.allowedTypes.includes(file.type)) {
      errors.push(`Dosya türü desteklenmiyor: ${file.type}`);
    }

    // Check file extension
    const extension = this.getFileExtension(file.name);
    if (!this.config.allowedExtensions.includes(extension)) {
      errors.push(`Dosya uzantısı desteklenmiyor: ${extension}`);
    }

    // Check for dangerous extensions
    if (DANGEROUS_EXTENSIONS.includes(extension)) {
      errors.push('Güvenlik nedeniyle bu dosya türü yüklenemez');
    }

    // Check file name for suspicious patterns
    if (this.hasSuspiciousFileName(file.name)) {
      errors.push('Dosya adı geçersiz karakterler içeriyor');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot !== -1 ? fileName.substring(lastDot).toLowerCase() : '';
  }

  private hasSuspiciousFileName(fileName: string): boolean {
    // Check for path traversal attempts
    if (fileName.includes('../') || fileName.includes('..\\')) {
      return true;
    }

    // Check for null bytes
    if (fileName.includes('\0')) {
      return true;
    }

    // Check for control characters
    if (/[\x00-\x1f\x7f-\x9f]/.test(fileName)) {
      return true;
    }

    return false;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validate multiple files
  validateFiles(files: FileList | File[]): { validFiles: File[]; invalidFiles: { file: File; errors: string[] }[] } {
    const validFiles: File[] = [];
    const invalidFiles: { file: File; errors: string[] }[] = [];

    Array.from(files).forEach(file => {
      const validation = this.validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, errors: validation.errors });
      }
    });

    return { validFiles, invalidFiles };
  }
}

// File upload with progress tracking
export class FileUploader {
  private validator: FileUploadValidator;

  constructor(config?: FileUploadConfig) {
    this.validator = new FileUploadValidator(config);
  }

  async uploadFile(
    file: File,
    uploadUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    // Validate file first
    const validation = this.validator.validateFile(file);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    return new Promise((resolve) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({ success: true, url: response.url });
          } catch {
            resolve({ success: false, error: 'Geçersiz sunucu yanıtı' });
          }
        } else {
          resolve({ success: false, error: `Yükleme hatası: ${xhr.status}` });
        }
      });

      xhr.addEventListener('error', () => {
        resolve({ success: false, error: 'Ağ hatası' });
      });

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  }
}