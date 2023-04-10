import { emojiNames, WriteAction } from "./constants";

export const randRange = (low: number, high: number) => {
  return Math.floor(low + Math.random() * (high - low + 1));
};

export const getRandomEmojiNames = (count: number) => {
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    let nextName = emojiNames[randRange(0, emojiNames.length - 1)];
    while (names.includes(nextName)) {
      nextName = emojiNames[randRange(0, emojiNames.length - 1)];
    }
    names.push(nextName);
  }
  return names;
};

export const loadImage = (url: string) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.src = url;
  });

export const getPrompt = (keywords: string, action: WriteAction) => {
  switch (action) {
    case WriteAction.START:
      return `Write a one-line story about ${keywords}. Word limit is 50.`;
    case WriteAction.CONTINUE:
      return `Continue the story with ${keywords} using one sentence.`;
    case WriteAction.END:
      return `Write a surprising ending for the story with ${keywords} using one sentence.`;
  }
};
