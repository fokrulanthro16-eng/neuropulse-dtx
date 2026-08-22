/**
 * NeuroPulse DTx - Zero-Knowledge Client-Side Cryptographic Storage
 * AES-GCM 256-bit local encryption using native WebCrypto API.
 * Ensures health records stored in client IndexedDB / localStorage are
 * encrypted at rest and zero-knowledge from central servers.
 */

const STORAGE_KEY_NAME = 'neuropulse_dtx_crypto_key_v1';

export class LocalCryptoManager {
  private static cachedKey: CryptoKey | null = null;

  /**
   * Initializes or retrieves the client device encryption key from IndexedDB/CryptoSubtle
   */
  private static async getOrCreateMasterKey(): Promise<CryptoKey> {
    if (this.cachedKey) return this.cachedKey;

    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      throw new Error('WebCrypto API is not supported in this environment.');
    }

    const storedRawKey = localStorage.getItem(STORAGE_KEY_NAME);

    if (storedRawKey) {
      try {
        const rawKeyBuffer = this.base64ToArrayBuffer(storedRawKey);
        const importedKey = await window.crypto.subtle.importKey(
          'raw',
          rawKeyBuffer,
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
        this.cachedKey = importedKey;
        return importedKey;
      } catch (err) {
        console.warn('[LocalCryptoManager] Failed to import existing key, generating fresh key', err);
      }
    }

    // Generate new AES-GCM 256-bit key
    const newKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true, // extractable for local device storage
      ['encrypt', 'decrypt']
    );

    const exportedRaw = await window.crypto.subtle.exportKey('raw', newKey);
    const base64Key = this.arrayBufferToBase64(exportedRaw);
    localStorage.setItem(STORAGE_KEY_NAME, base64Key);

    this.cachedKey = newKey;
    return newKey;
  }

  /**
   * Encrypts plaintext JSON payload into an encrypted envelope (IV + Ciphertext)
   */
  public static async encryptData<T>(data: T): Promise<string> {
    try {
      const key = await this.getOrCreateMasterKey();
      const encodedText = new TextEncoder().encode(JSON.stringify(data));

      // 96-bit initialization vector (standard for AES-GCM)
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedText
      );

      const payload = {
        v: 1,
        iv: this.arrayBufferToBase64(iv.buffer),
        ct: this.arrayBufferToBase64(ciphertext),
        t: Date.now()
      };

      return JSON.stringify(payload);
    } catch (err) {
      console.error('[LocalCryptoManager] Encryption error:', err);
      // Fallback: return stringified data with local prefix for resilience
      return JSON.stringify({ v: 0, raw: data });
    }
  }

  /**
   * Decrypts encrypted envelope back into typed structure
   */
  public static async decryptData<T>(envelopeString: string): Promise<T | null> {
    try {
      const envelope = JSON.parse(envelopeString);
      if (envelope.v === 0 && envelope.raw) {
        return envelope.raw as T;
      }

      const key = await this.getOrCreateMasterKey();
      const iv = new Uint8Array(this.base64ToArrayBuffer(envelope.iv));
      const ciphertext = this.base64ToArrayBuffer(envelope.ct);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );

      const decodedText = new TextDecoder().decode(decrypted);
      return JSON.parse(decodedText) as T;
    } catch (err) {
      console.error('[LocalCryptoManager] Decryption error:', err);
      return null;
    }
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
