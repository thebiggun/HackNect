/**
 * Browser-side image compression utility using HTML5 Canvas.
 * Solves Vercel's 4.5MB Serverless Function payload limit (FUNCTION_PAYLOAD_TOO_LARGE).
 * 
 * @param {File} file - Original File from input
 * @param {Object} options
 * @param {number} [options.maxWidth=1920] - Max allowed width in pixels
 * @param {number} [options.maxHeight=1080] - Max allowed height in pixels
 * @param {number} [options.quality=0.8] - Image compression quality (0.1 - 1.0)
 * @param {number} [options.maxSizeBytes=3500000] - Ceiling in bytes (default ~3.5MB to stay well under Vercel's 4.5MB limit)
 * @returns {Promise<File>} Compressed File
 */
export async function compressImage(file, options = {}) {
    // If not running in browser or invalid file, return original
    if (typeof window === 'undefined' || !file || !(file instanceof File)) {
        return file;
    }

    // Only process images
    if (!file.type.startsWith('image/')) {
        return file;
    }

    const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        maxSizeBytes = 3.5 * 1024 * 1024,
    } = options;

    // Preserve SVGs and GIFs if they're within reasonable size
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        if (file.size <= maxSizeBytes) {
            return file;
        }
    }

    return new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = async () => {
            URL.revokeObjectURL(objectUrl);

            try {
                let { width, height } = img;

                // If already small in file size and within max dimensions, skip re-encoding
                if (file.size <= 300 * 1024 && width <= maxWidth && height <= maxHeight) {
                    resolve(file);
                    return;
                }

                // Compute aspect-ratio-preserving dimensions
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
                    resolve(file);
                    return;
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // Helper to get blob from canvas
                const getCanvasBlob = (mimeType, q) => new Promise((res) => {
                    canvas.toBlob((b) => res(b), mimeType, q);
                });

                // Try WebP first for optimal compression
                let mimeType = 'image/webp';
                let blob = await getCanvasBlob(mimeType, quality);

                // If WebP is unsupported or returns null, fallback to JPEG
                if (!blob) {
                    mimeType = 'image/jpeg';
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    blob = await getCanvasBlob(mimeType, quality);
                }

                // Step-down compression if still above safe ceiling
                let currentQuality = quality;
                let attempts = 0;
                while (blob && blob.size > maxSizeBytes && attempts < 3) {
                    currentQuality -= 0.2;
                    if (currentQuality < 0.2) currentQuality = 0.2;
                    blob = await getCanvasBlob(mimeType, currentQuality);
                    attempts++;
                }

                if (!blob) {
                    resolve(file);
                    return;
                }

                const ext = blob.type === 'image/webp' ? 'webp' : (blob.type === 'image/png' ? 'png' : 'jpg');
                const originalBase = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                const newFileName = `${originalBase}.${ext}`;

                const compressedFile = new File([blob], newFileName, {
                    type: blob.type,
                    lastModified: Date.now(),
                });

                resolve(compressedFile);
            } catch (err) {
                console.warn('Image compression encountered an error, falling back to original:', err);
                resolve(file);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            console.warn('Failed to load image for compression, falling back to original');
            resolve(file);
        };

        img.src = objectUrl;
    });
}
