import { WriteAction } from "@/constants";
import { writeStory } from "@/redux/appReducer";
import { store } from "@/redux/store";

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

export const circleIntersection = (
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
) => {
  // Calculate the distance between the centers
  var dx = x1 - x2;
  var dy = y1 - y2;
  var len = Math.sqrt(dx * dx + dy * dy);

  if (len < r1 + r2) {
    // Circles intersect
    return true;
  }

  return false;
};

export const drawCenterText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number
) => {
  var textdim = context.measureText(text);
  context.fillText(text, x + (width - textdim.width) / 2, y);
};

export const triggerWriteStory = (tileType: number, end = false) => {
  const state = store.getState();
  const { assets } = state.app;
  const emojiName = assets[tileType].name;
  const action = end ? WriteAction.END : WriteAction.CONTINUE;
  store.dispatch(writeStory(emojiName, action));
};
