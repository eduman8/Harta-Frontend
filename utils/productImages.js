const MAX_PRODUCT_IMAGES = 3;

const normalizeImageValue = (image) => {
  if (typeof image === "string") return image.trim();
  if (image === null || image === undefined) return "";
  return String(image).trim();
};

const readImageCandidate = (image) => {
  if (typeof image === "string") return image;
  if (!image || typeof image !== "object") return "";

  return (
    image.url ??
    image.image_url ??
    image.imageUrl ??
    image.src ??
    image.image ??
    ""
  );
};

export const normalizeProductImages = (images = [], { limit = MAX_PRODUCT_IMAGES } = {}) => {
  const list = Array.isArray(images) ? images : [];
  const normalizedImages = [];

  for (const image of list) {
    const normalizedImage = normalizeImageValue(readImageCandidate(image));

    if (!normalizedImage || normalizedImages.includes(normalizedImage)) {
      continue;
    }

    normalizedImages.push(normalizedImage);

    if (Number.isFinite(limit) && normalizedImages.length >= limit) {
      break;
    }
  }

  return normalizedImages;
};

export const getProductImages = (product = {}, { limit = MAX_PRODUCT_IMAGES } = {}) => {
  const candidates = [
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(product.product_images) ? product.product_images : []),
    ...(Array.isArray(product.image_urls) ? product.image_urls : []),
    product.image_url,
    product.image,
  ];

  return normalizeProductImages(candidates, { limit });
};

export const toProductImageInputs = (images = [], slots = MAX_PRODUCT_IMAGES) => {
  const normalizedImages = normalizeProductImages(images, { limit: slots });
  return [...normalizedImages, ...Array(slots).fill("")].slice(0, slots);
};

export const buildProductImagesPayload = (images = []) =>
  normalizeProductImages(images, { limit: MAX_PRODUCT_IMAGES });

export { MAX_PRODUCT_IMAGES };
