import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64, encodeUTF8 } from 'tweetnacl-util';

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

export const verifySignature = (payload: object, signatureB64: string, publicKeyB64: string): boolean => {
    try {
        const messageUint8 = encodeUTF8(JSON.stringify(payload));
        const signature = decodeBase64(signatureB64);
        const publicKey = decodeBase64(publicKeyB64);
        return nacl.sign.detached.verify(messageUint8, signature, publicKey);
    } catch (e) {
        console.error("Signature verification failed:", e);
        return false;
    }
};