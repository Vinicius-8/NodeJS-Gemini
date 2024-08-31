
export function isValidBase64Image(base64String: string): boolean {
    // Regex to verify if  base64 is an image (starts with data:image/)
    const base64ImagePattern: RegExp = /^data:image\/(jpeg|png|gif);base64,/;
    
    if (base64ImagePattern.test(base64String)) {
        // Removes the prefix to verify if the rest is a base64 valid string
        const base64Data: string = base64String.replace(base64ImagePattern, '');
        const isBase64: boolean = /^[A-Za-z0-9+/=]+$/.test(base64Data);
        return isBase64 && base64Data.length % 4 === 0;
    }

    return false;
}

