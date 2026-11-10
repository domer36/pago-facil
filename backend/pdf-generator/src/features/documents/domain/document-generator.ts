export interface DocumentGenerator<TInput> {
  generate(input: TInput): Uint8Array;
}
