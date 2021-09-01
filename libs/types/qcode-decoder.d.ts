declare class QCodeDecoder {
  decodeFromImage(
    image: HTMLImageElement,
    callback: (error: Error, result: string) => void
  ): void
}

declare function QCodeDecoder(): QCodeDecoder