/**
 * Utilidad para optimizar y comprimir imágenes antes de almacenarlas.
 * Convierte fotos de cámara (que pesan entre 5MB y 15MB) a versiones de alta
 * legibilidad de ~80KB a 150KB mediante escalado en Canvas HTML5.
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0
  mimeType?: string;
}

export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.75,
    mimeType = 'image/jpeg'
  } = options;

  // Si es PDF, no se comprime mediante Canvas, se lee directamente
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);

    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('No se pudo leer el archivo'));
        return;
      }

      // Si no es imagen soportada por Image(), devolver dataUrl directa
      if (!file.type.startsWith('image/')) {
        resolve(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // En caso de falla en Image(), fallback a dataUrl original
        resolve(rawDataUrl);
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Calcular nuevas dimensiones manteniendo relación de aspecto
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          // Fondo blanco para imágenes transparentes o JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Renderizado suave
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL(mimeType, quality);
          resolve(compressedDataUrl);
        } catch (canvasErr) {
          console.warn('Falla en compresión de canvas, usando fallback:', canvasErr);
          resolve(rawDataUrl);
        }
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Verifica si un string es un Data URI base64 grande
 */
export function isLargeDataUri(str: unknown, thresholdBytes = 8000): boolean {
  return typeof str === 'string' && str.startsWith('data:') && str.length > thresholdBytes;
}
