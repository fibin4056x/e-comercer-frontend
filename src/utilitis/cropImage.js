 const getCroppedImg = (imageSrc, crop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 300;
      canvas.height = 300;

      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        300,
        300
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }

          // Convert Blob to proper File with correct type + extension
          const file = new File(
            [blob],
            `profile-${Date.now()}.jpg`,
            { type: "image/jpeg" }
          );

          resolve(file);
        },
        "image/jpeg",
        0.95
      );
    };

    image.onerror = () => reject(new Error("Image load failed"));
  });
};

export default getCroppedImg;