export const getMousePos = (canvas: HTMLCanvasElement, e: MouseEvent) => {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.round(
      ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width
    ),
    y: Math.round(
      ((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height
    ),
  };
};

// Convert radians to degrees
export const radToDeg = (angle: number) => {
  return angle * (180 / Math.PI);
};

// Convert degrees to radians
export const degToRad = (angle: number) => {
  return angle * (Math.PI / 180);
};

export const randRange = (low: number, high: number) => {
  return Math.floor(low + Math.random() * (high - low + 1));
};
