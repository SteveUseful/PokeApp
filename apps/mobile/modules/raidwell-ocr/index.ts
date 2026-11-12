import { requireNativeModule } from 'expo-modules-core';
export type OCRResult = { text: string; engine: string };
export function recognize(uri: string, words: string[]): Promise<OCRResult> { return requireNativeModule('RaidwellOCR').recognize(uri, words); }
