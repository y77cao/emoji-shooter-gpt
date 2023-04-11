

## Emoji Shooter GPT

A creative bubble shooter game, powered by GPT-3. You play the bubble shooter (with emojis), and GPT writes a story according to your game process.

NOTE: I am not a game dev so would not recommend looking at the game logic code here for reference. I am interested in the randomness(or creativity!) that AI can bring to game plots and to AI itself as a game nerd. Some improvements can make this more interesting are: editing the story changes the game state (pops emoji of the corresponding deleted word, etc.), reorganizing the story updates the gamee map, certain words end the game, etc. The feedback sent between game and AI can generate more possibility of outcomes than defined game rules. Maybe finally we can build a game with infinite plays:)

![bubble-shooter-gpt-demo](https://user-images.githubusercontent.com/16827269/231067609-d2eff70e-8fbf-432c-9e75-ec2ac076e27d.gif)

Getting Started

Create a `.env` file with your OpenAI API key as environment variable
```
NEXT_PUBLIC_OPENAI_API_KEY={your key here}
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
