// lib/types/resemblejs.d.ts
// Type declarations for resemblejs

declare module 'resemblejs' {
  interface ResembleOptions {
    scaleToSameSize?: boolean;
    ignore?: string[];
    output?: {
      errorColor?: {
        red?: number;
        green?: number;
        blue?: number;
      };
      errorType?: string;
      transparency?: number;
      largeImageThreshold?: number;
      useCrossOrigin?: boolean;
      outputDiff?: boolean;
    };
  }

  interface ResembleAnalysis {
    misMatchPercentage: string;
    isSameDimensions: boolean;
    dimensionDifference: {
      width: number;
      height: number;
    };
    getImageDataUrl: () => string;
    getBuffer: () => Buffer;
    rawMisMatchPercentage: number;
  }

  interface ResembleComparison {
    ignoreColors: () => ResembleComparison;
    ignoreAntialiasing: () => ResembleComparison;
    ignoreAlpha: () => ResembleComparison;
    ignoreRectangles: (rectangles: Array<{ left: number; top: number; right: number; bottom: number }>) => ResembleComparison;
    ignoreNothing: () => ResembleComparison;
    scaleToSameSize: () => ResembleComparison;
    useOriginalSize: () => ResembleComparison;
    outputSettings: (options: ResembleOptions['output']) => ResembleComparison;
    onComplete: (callback: (analysis: ResembleAnalysis) => void) => void;
  }

  interface ResembleStatic {
    (image1: string | Buffer): ResembleComparison;
    compare: (image1: string | Buffer, image2: string | Buffer, options?: ResembleOptions) => Promise<ResembleAnalysis>;
    outputSettings: (options: ResembleOptions['output']) => void;
  }

  const resemble: ResembleStatic;
  export = resemble;
}
