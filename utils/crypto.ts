import nacl from 'tweetnacl';

// The 'tweetnacl' library does not include the 'util' helper functions for encoding.
// To fix this, we implement these helpers using the browser's built-in TextEncoder, atob, and btoa.
const decodeBase64 = (str: string): Uint8Array => {
    return Uint8Array.from(atob(str), c => c.charCodeAt(0));
};

const encodeBase64 = (data: Uint8Array): string => {
    // Using apply is safer for large arrays than the spread operator.
    return btoa(String.fromCharCode.apply(null, Array.from(data)));
};

const encodeUTF8 = (str: string): Uint8Array => new TextEncoder().encode(str);

export const generateKeyPair = () => {
    const keyPair = nacl.sign.keyPair();
    return {
        publicKey: encodeBase64(keyPair.publicKey),
        secretKey: encodeBase64(keyPair.secretKey),
    };
};

export const signPayload = (payload: object, secretKeyB64: string) => {
    const secretKey = decodeBase64(secretKeyB64);
    const messageUint8 = encodeUTF8(JSON.stringify(payload));
    const signature = nacl.sign.detached(messageUint8, secretKey);
    return encodeBase64(signature);
};

export const verifySignature = (payload: object, signatureB64: string, publicKeyB64: string) => {
    try {
        const messageUint8 = encodeUTF8(JSON.stringify(payload));
        const signature = decodeBase64(signatureB64);
        const publicKey = decodeBase64(publicKeyB64);
        return nacl.sign.detached.verify(messageUint8, signature, publicKey);
    } catch (e) {
        console.error("Verification failed:", e);
        return false;
    }
};
