declare module "*.jpg" {
  const content: import("next/image").StaticImageData;
  export default content;
}
