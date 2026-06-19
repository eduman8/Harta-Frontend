import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./productCard.css";

const normalizeGalleryImages = (images) => {
  if (!Array.isArray(images)) return [];

  return images.reduce((galleryImages, image) => {
    const normalizedImage = typeof image === "string" ? image.trim() : "";

    if (!normalizedImage || galleryImages.includes(normalizedImage)) {
      return galleryImages;
    }

    return [...galleryImages, normalizedImage];
  }, []);
};

function ProductImageLightbox({ images, initialIndex = 0, productName, onClose }) {
  const galleryImages = normalizeGalleryImages(images);
  const [currentImageIndex, setCurrentImageIndex] = useState(() => {
    const maxIndex = Math.max(galleryImages.length - 1, 0);
    return Math.min(Math.max(initialIndex, 0), maxIndex);
  });
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [failedImages, setFailedImages] = useState({});
  const hasMultipleImages = galleryImages.length > 1;
  const currentImage = galleryImages[currentImageIndex] || galleryImages[0] || "";
  const currentImageFailed = Boolean(failedImages[currentImage]);

  const closeLightbox = () => {
    setTouchStartX(null);
    setTouchDeltaX(0);
    onClose?.();
  };

  const goToImage = (index) => {
    if (!hasMultipleImages) return;
    const total = galleryImages.length;
    setCurrentImageIndex(((index % total) + total) % total);
  };

  const showPreviousImage = () => {
    goToImage(currentImageIndex - 1);
  };

  const showNextImage = () => {
    goToImage(currentImageIndex + 1);
  };

  const handleLightboxTouchStart = (event) => {
    if (!hasMultipleImages) return;
    setTouchStartX(event.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const handleLightboxTouchMove = (event) => {
    if (touchStartX === null) return;
    setTouchDeltaX(event.touches[0].clientX - touchStartX);
  };

  const handleLightboxTouchEnd = () => {
    if (touchStartX === null) return;

    const swipeThreshold = 48;
    if (touchDeltaX > swipeThreshold) {
      showPreviousImage();
    } else if (touchDeltaX < -swipeThreshold) {
      showNextImage();
    }

    setTouchStartX(null);
    setTouchDeltaX(0);
  };


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setTouchStartX(null);
        setTouchDeltaX(0);
        onClose?.();
      }

      if (event.key === "ArrowLeft" && hasMultipleImages) {
        setCurrentImageIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length);
      }

      if (event.key === "ArrowRight" && hasMultipleImages) {
        setCurrentImageIndex((index) => (index + 1) % galleryImages.length);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [galleryImages.length, hasMultipleImages, onClose]);

  if (!currentImage) return null;

  return createPortal(
    <div
      className="product-image-lightbox"
      role="dialog"
      aria-modal="true"
      onClick={closeLightbox}
      onTouchStart={handleLightboxTouchStart}
      onTouchMove={handleLightboxTouchMove}
      onTouchEnd={handleLightboxTouchEnd}
    >
      <button
        type="button"
        className="product-image-lightbox__close"
        onClick={closeLightbox}
        aria-label="Cerrar imagen"
      >
        ×
      </button>

      {hasMultipleImages && (
        <button
          type="button"
          className="product-image-lightbox__nav product-image-lightbox__nav--prev"
          onClick={(event) => {
            event.stopPropagation();
            showPreviousImage();
          }}
          aria-label="Imagen anterior"
        >
          ‹
        </button>
      )}

      <div className="product-image-lightbox__stage" onClick={(event) => event.stopPropagation()}>
        {!currentImageFailed ? (
          <img
            className="product-image-lightbox__image"
            src={currentImage}
            alt={productName || "Producto"}
            onLoad={() => {
              setFailedImages((current) => {
                if (!current[currentImage]) return current;
                const next = { ...current };
                delete next[currentImage];
                return next;
              });
            }}
            onError={() => {
              setFailedImages((current) => ({ ...current, [currentImage]: true }));
            }}
          />
        ) : (
          <div className="product-image-lightbox__fallback" role="img" aria-label="Imagen no disponible">
            Sin imagen
          </div>
        )}
      </div>

      {hasMultipleImages && (
        <button
          type="button"
          className="product-image-lightbox__nav product-image-lightbox__nav--next"
          onClick={(event) => {
            event.stopPropagation();
            showNextImage();
          }}
          aria-label="Imagen siguiente"
        >
          ›
        </button>
      )}

      {hasMultipleImages && (
        <div
          className="product-image-lightbox__gallery"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="product-image-lightbox__counter">
            {currentImageIndex + 1}/{galleryImages.length}
          </p>
          <div className="product-image-lightbox__dots" aria-label="Imágenes del producto">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={
                  index === currentImageIndex
                    ? "product-image-lightbox__dot product-image-lightbox__dot--active"
                    : "product-image-lightbox__dot"
                }
                onClick={() => goToImage(index)}
                aria-label={`Ver imagen ${index + 1}`}
                aria-current={index === currentImageIndex ? "true" : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}

export default ProductImageLightbox;
