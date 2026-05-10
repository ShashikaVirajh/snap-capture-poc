import { ORIENTATION_THRESHOLD } from "./constants";

export const isPitchAligned = (pitch: number): boolean => {
    return Math.abs(pitch) <= ORIENTATION_THRESHOLD;
};

export const isRollAligned = (roll: number): boolean => {
    return Math.abs(roll) <= ORIENTATION_THRESHOLD;
};

export const isDeviceAligned = (pitch: number, roll: number): boolean => {
    return isPitchAligned(pitch) && isRollAligned(roll);
};

export const getLargestPictureSize = (sizes: string[]): string => {
    return sizes.reduce((largestSize, currentSize) => {
        const [currentWidth, currentHeight] = currentSize.split("x").map(Number);
        const [largestWidth, largestHeight] = largestSize.split("x").map(Number);
        return currentWidth * currentHeight > largestWidth * largestHeight ? currentSize : largestSize;
    });
};

export const getPitch = (y: number, z: number): number => {
    if (Math.abs(z) < 0.5) return 90;
    return Math.atan2(y, Math.abs(z)) * (180 / Math.PI);
};

export const getRoll = (x: number, z: number): number => {
    if (Math.abs(z) < 0.5) return 90;
    return Math.atan2(x, Math.abs(z)) * (180 / Math.PI);
};

export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const getImageFormat = (uri: string): string => {
    const ext = uri.split(".").pop()?.toLowerCase();
    if (ext === "heic" || ext === "heif") return "HEIF";
    if (ext === "png") return "PNG";
    return "JPEG";
};
