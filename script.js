document.addEventListener("DOMContentLoaded", function () {
  const canvasContainer = document.getElementById("canvas-container");
  const { canvas, ctx } = initializeCanvas(canvasContainer, 1024, 1024);
  let img = new Image();
  let offset = { y: 0 };

  const drawImageHandler = createDrawImageHandler(ctx, img, canvas, offset);
  const updateImagePositionHandler = createUpdateImagePositionHandler(canvas, ctx, img, offset, drawImageHandler);

  const imageInput = document.getElementById("image-input");
  imageInput.addEventListener("change", function (e) {
    handleImageUpload(e, img, drawImageHandler);
  });

  ['click', 'touchend'].forEach((eventType) => {
    canvas.addEventListener(eventType, function (e) {
      updateImagePositionHandler(e);
    });
  });

  const downloadButton = document.getElementById("download-button");
  downloadButton.addEventListener("click", function () {
    // Ensure the canvas is redrawn with the image in its adjusted position before downloading
    drawImageHandler();
    // Create a blob from the canvas
    canvas.toBlob(function(blob) {
      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'business_card.png';
      
      // Simulate a click on the link after a slight delay
      setTimeout(function() {
        link.click();
        // Release the object URL
        URL.revokeObjectURL(link.href);
      }, 100);
    }, 'image/png');
  });
});

function initializeCanvas(container, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

function handleImageUpload(event, img, drawImageHandler) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      img.src = e.target.result;
      img.onload = function() {
        drawImageHandler();
      };
    };
    reader.readAsDataURL(file);
  }
}

function createDrawImageHandler(ctx, img, canvas, offset) {
  return function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const imgAspectRatio = img.width / img.height;
    const canvasAspectRatio = canvas.width / canvas.height;

    if (imgAspectRatio > canvasAspectRatio) {
      img.height = canvas.height;
      img.width = canvas.height * imgAspectRatio;
    } else {
      img.width = canvas.width;
      img.height = canvas.width / imgAspectRatio;
    }
    ctx.drawImage(img, (canvas.width - img.width) / 2, offset.y, img.width, img.height);
  };
}

function createUpdateImagePositionHandler(canvas, ctx, img, offset, drawImageHandler) {
  return function (event) {
    const rect = canvas.getBoundingClientRect();
    const y = ('clientY' in event) ? event.clientY : event.changedTouches[0].clientY;
    const delta = y - rect.top - canvas.height / 2;
    
    offset.y += delta;

    if (offset.y > 0) offset.y = 0;
    if (offset.y < canvas.height - img.height) offset.y = canvas.height - img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, (canvas.width - img.width) / 2, offset.y, img.width, img.height);
    drawImageHandler();
  };
}