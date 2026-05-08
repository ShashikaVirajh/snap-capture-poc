export const getPitch = (y: number, z: number): number => {
    if (Math.abs(z) < 0.5) return 90;
    return Math.atan2(y, Math.abs(z)) * (180 / Math.PI);
};

export const getRoll = (x: number, z: number): number => {
    if (Math.abs(z) < 0.5) return 90;
    return Math.atan2(x, Math.abs(z)) * (180 / Math.PI);
};

export const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
