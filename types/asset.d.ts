// This allows to import wav files in typescript
declare module "*.wav" {
  const value: any;
  export default value;
}

declare module "*.html" {
  const value: any;
  export default value;
}
