export interface StoryPage {
  pageNumber: number;
  bgSceneDesc: string;
  bgImage?: string;
  title: string;
  subtitle: string;
  prose: string;
  mascotComment: string;
  instruction: string;
}

export interface StoryBook {
  id: number;
  realm: string;
  title: string;
  ageRange: string;
  difficulty: 1 | 2 | 3;
  rewardStars: number;
  badgeName: string;
  themeColor: 'pink' | 'sky' | 'grass' | 'violet';
  pages: StoryPage[];
}

export const REALM_STORIES_DATA: Record<number, StoryBook> = {
  // STORY 1: The Whispering Library
  1: {
    id: 1,
    realm: 'Reading Quest 🌸',
    title: 'The Whispering Library',
    ageRange: '6-8',
    difficulty: 1,
    rewardStars: 30,
    badgeName: 'Story Explorer',
    themeColor: 'pink',
    pages: [
      {
        pageNumber: 1,
        bgSceneDesc: 'A cozy, sunlit library at the edge of a small town, tall wooden shelves curving up into shadow, dust motes floating in a beam of afternoon light from a round window shaped like an open book.',
        bgImage: '/stories/whispering_library_p1.png',
        title: 'The Quiet Afternoon',
        subtitle: 'Every book held its breath...',
        prose: "Mira loved the old library on Maple Street, but today something was different. As she stepped inside, the door creaked — and every book on every shelf let out the tiniest sigh, like they'd all been holding their breath.\n\n\"Finally,\" whispered a small voice. \"A reader.\"",
        mascotComment: 'Listen closely! The books are talking to you! 📚',
        instruction: 'Tap NEXT to search between the quiet wooden shelves!',
      },
      {
        pageNumber: 2,
        bgSceneDesc: 'Close-up among the shelves, one book glowing faintly gold, its pages fluttering on their own even though no window is open nearby, warm amber light pooling around it.',
        bgImage: '/stories/whispering_library_p2.png',
        title: 'The Glowing Cover',
        subtitle: '"Are you brave enough to try?"',
        prose: "Mira found the glowing book tucked between two ordinary ones. Its cover read nothing at all — just a blank, waiting space.\n\n\"I'm the Whispering Book,\" it said. \"I only tell my story to someone who can finish my sentences. Are you brave enough to try?\"\n\nMira grinned. \"Try me.\"",
        mascotComment: 'Oooh! A magic glowing book! ✨',
        instruction: 'Tap NEXT to open the first page of the story!',
      },
      {
        pageNumber: 3,
        bgSceneDesc: 'The library seems to widen and blur into a moonlit forest painted right onto the walls — as if the book\'s story is leaking into the room, shelves fading at the edges into painted trees.',
        bgImage: '/stories/whispering_library_p3.png',
        title: 'The Book-Forest Path',
        subtitle: 'Stepping-stone words appear on the floor!',
        prose: "The moment Mira answered a rhyme correctly, the room around her began to change. Bookshelves melted into tall painted trees. A path of stepping-stone words appeared on the floor, each one a piece of a sentence waiting to be finished.\n\n\"Come on then,\" the book whispered, delighted. \"Walk my story with me.\"",
        mascotComment: 'Watch your step on the word-stones! 🌳',
        instruction: 'Press NEXT to follow the painted path into the woods!',
      },
      {
        pageNumber: 4,
        bgSceneDesc: 'A twilight clearing inside the "book-forest," fireflies made of tiny glowing letters drifting in the air, an old stone archway covered in vines at the center.',
        bgImage: '/stories/whispering_library_p4.png',
        title: 'The Crumbling Archway',
        subtitle: 'Piecing the old story back together...',
        prose: "At the heart of the forest stood an archway with words carved into the stone — but half of them had crumbled away. Mira had to read what remained and guess what came next, piecing the old story back together, one word at a time.\n\nEach correct guess made the archway glow a little brighter.",
        mascotComment: 'Look at those glowing letter-fireflies! 🪲✨',
        instruction: 'Press NEXT to complete the last sentence of the archway!',
      },
      {
        pageNumber: 5,
        bgSceneDesc: 'Full daylight returns, the library restored around Mira, but now every shelf glows softly gold, warm and alive, sunlight golden through the round window.',
        bgImage: '/stories/whispering_library_p5.png',
        title: 'The Whispering Resolved',
        subtitle: 'Every story just wants someone to finish it!',
        prose: "When the last word slotted into place, the archway shimmered and the whole library seemed to exhale — happy, at last, to have been read.\n\n\"Thank you,\" said the book, its voice warm now instead of whispering. \"Every story just wants someone to finish it with them.\"\n\nMira smiled and pulled a new book off the shelf.",
        mascotComment: 'You did it! You restored the library! 🎉⭐',
        instruction: 'Press NEXT to claim your 30★ reward!',
      },
    ],
  },

  // STORY 2: Message in a Bottle Cap
  2: {
    id: 2,
    realm: 'Reading Quest 🌸',
    title: 'Message in a Bottle Cap',
    ageRange: '8-10',
    difficulty: 2,
    rewardStars: 40,
    badgeName: 'Riddle Master',
    themeColor: 'pink',
    pages: [
      {
        pageNumber: 1,
        bgSceneDesc: 'A windswept, pebbly beach at early morning, grey-blue waves rolling in, a lighthouse in the far distance, seagulls circling overhead.',
        bgImage: '/stories/bottle_cap_p1.png',
        title: 'The Morning Tide',
        subtitle: 'A tiny glass bottle in the sand...',
        prose: "Theo wasn't looking for anything special that morning — just smooth stones for skipping. But the tide had left something odd half-buried in the sand: a tiny glass bottle, no bigger than his thumb, with a rolled-up scrap of paper inside.",
        mascotComment: 'What could be hidden inside? Let\'s see! 🌊',
        instruction: 'Tap NEXT to uncork the bottle!',
      },
      {
        pageNumber: 2,
        bgSceneDesc: 'Close-up on a weathered wooden dock, the little bottle now open on a plank, sunlight glinting off the glass, a curious crab peeking out from under the dock nearby.',
        title: 'The Coded Note',
        subtitle: '"Read between the lines to find X..."',
        prose: "Inside was a message, written in careful, looping handwriting:\n\n\"If you find this, I need your help. Meet me where the map says X — but you'll have to read between the lines to find it.\"\n\nTheo turned the paper over. On the back was a strange little map with three riddle-clues.",
        mascotComment: 'A secret map! Time to solve the clues! 🗺️',
        instruction: 'Tap NEXT to follow Clue #1 to the tide pools!',
      },
      {
        pageNumber: 3,
        bgSceneDesc: 'A rocky tide-pool area at midday, sunlight sparkling on shallow blue-green water, starfish and small crabs visible among the rocks, the lighthouse now much closer on a nearby cliff.',
        title: 'The Tide Pool Clue',
        subtitle: 'Searching among shells and starfish...',
        prose: "The first clue led Theo to the tide pools. \"Where the sea leaves its small treasures behind,\" the note read. He knelt by a pool full of shells and tiny fish — and there, wedged between two rocks, was the second clue.",
        mascotComment: 'Look between the two rocks! Found it! 🦀',
        instruction: 'Press NEXT to follow the clue to the lighthouse stairs!',
      },
      {
        pageNumber: 4,
        bgSceneDesc: 'The base of the lighthouse at golden-hour sunset, long shadows stretching across the grass, the lighthouse beam just beginning to sweep across a darkening sky.',
        title: 'The Lighthouse Climb',
        subtitle: 'Spiral stairs leading into the sky...',
        prose: "The final clue pointed straight up — to the lighthouse itself. Theo climbed the spiral stairs, his heart thudding with every step, until he reached the top... and found a girl about his age, sitting by the great lamp with a notebook of half-finished stories.\n\n\"You actually came,\" she said, amazed.",
        mascotComment: 'Up, up, up we go! Almost at the top! 🕯️',
        instruction: 'Press NEXT to step into the lamp room!',
      },
      {
        pageNumber: 5,
        bgSceneDesc: 'Inside the lighthouse lamp room at full sunset, warm orange light flooding through the glass, the whole coastline visible below, the ocean turning gold.',
        title: 'The Mystery Author',
        subtitle: '"Want to help me write the next one?"',
        prose: "Her name was Priya, and she'd been writing stories nobody ever read — so she'd hidden this one in a bottle, hoping someone curious enough would follow it all the way.\n\n\"Want to help me write the next one?\" she asked, holding out a blank page.\n\nTheo took it, grinning. \"Only if it has more clues.\"",
        mascotComment: 'New friends and new stories! Amazing! 🎉⭐',
        instruction: 'Press NEXT to claim your 40★ reward!',
      },
    ],
  },

  // STORY 3: The Last Punctuation Wizard
  3: {
    id: 3,
    realm: 'Reading Quest 🌸',
    title: 'The Last Punctuation Wizard',
    ageRange: '9-12',
    difficulty: 3,
    rewardStars: 50,
    badgeName: 'Grammar Guardian',
    themeColor: 'pink',
    pages: [
      {
        pageNumber: 1,
        bgSceneDesc: 'A grand but crumbling castle library, floating scrolls drifting lazily through the air, sentences visibly falling apart mid-air — words scattering like leaves because their punctuation has vanished.',
        title: 'The Breathless Kingdom',
        subtitle: 'Sentences falling apart mid-air!',
        prose: "In the Kingdom of Fullstop, sentences were starting to fall apart. Without commas to pause on or periods to land on, words just... kept... going... forever, tumbling into confused, breathless nonsense.\n\nOnly one wizard remembered how to fix it — and he was old, tired, and running out of magic.",
        mascotComment: 'Oh no! The sentences are tumbling away! 📜',
        instruction: 'Tap NEXT to enter the Wizard\'s Study!',
      },
      {
        pageNumber: 2,
        bgSceneDesc: 'A dim wizard\'s study lit by floating candle-flames shaped like tiny commas and periods, shelves lined with jars containing swirling, glowing punctuation marks.',
        title: 'The Inkwell Wand',
        subtitle: '"Are you ready, apprentice?"',
        prose: "\"I am the last Punctuation Wizard,\" the old man said, \"but my magic is fading. I need someone with sharp eyes and a sharper mind to help me mend the broken sentences before the whole kingdom forgets how to speak clearly.\"\n\nHe handed over a small wand shaped like an inkwell.",
        mascotComment: 'Hold tight to the Inkwell Wand! 🪄',
        instruction: 'Tap NEXT to cross the Cracked Stone Bridge!',
      },
      {
        pageNumber: 3,
        bgSceneDesc: 'A cracked stone bridge suspended over a foggy chasm, sentence-fragments floating below like lost clouds, each fragment glowing faintly where a punctuation mark should be.',
        title: 'The Chasm of Commas',
        subtitle: 'Placing pauses to mend the bridge...',
        prose: "The first broken sentence hung in the air over the bridge, missing its commas entirely — a tangled, breathless mess. The apprentice studied it carefully, found the natural pauses, and placed each comma with a flick of the wand.\n\nThe sentence untangled itself with a relieved little shimmer.",
        mascotComment: 'A flick of the wand and... comma restored! ✨',
        instruction: 'Press NEXT to enter the Royal Throne Room!',
      },
      {
        pageNumber: 4,
        bgSceneDesc: 'A grand throne room, its walls covered in enormous scrolls, one massive run-on sentence stretching floor to ceiling like a wild, snarled vine.',
        title: 'The Wild Run-On Vine',
        subtitle: 'The ultimate grammar challenge!',
        prose: "The final challenge waited in the throne room: one giant, chaotic run-on sentence, tangled around the pillars like a wild vine. This one needed more than commas — it needed to be split apart entirely, rewritten into sentences that could finally breathe.",
        mascotComment: 'Deep breath... let\'s untangle this giant sentence! 🌿',
        instruction: 'Press NEXT to place the final period!',
      },
      {
        pageNumber: 5,
        bgSceneDesc: 'The same throne room, now bathed in warm restored light, the vine-sentence transformed into neat, glowing rows of tidy, well-punctuated text hanging peacefully in the air.',
        title: 'The Voice Restored',
        subtitle: 'Fullstop speaks clearly once more!',
        prose: "When the last period clicked into place, the whole kingdom seemed to sigh in relief. Sentences all across Fullstop straightened themselves out, calm and clear again.\n\nThe old wizard smiled. \"You didn't just fix a sentence,\" he said. \"You gave the whole kingdom its voice back.\"",
        mascotComment: 'Hooray! The Punctuation Wizard of Fullstop! 🎉⭐',
        instruction: 'Press NEXT to claim your 50★ reward!',
      },
    ],
  },

  // STORY 4: Captain Fraction and the Treasure Split
  4: {
    id: 4,
    realm: 'Math Island 🌊',
    title: 'Captain Fraction and the Treasure Split',
    ageRange: '7-9',
    difficulty: 1,
    rewardStars: 35,
    badgeName: 'Fraction Captain',
    themeColor: 'sky',
    pages: [
      {
        pageNumber: 1,
        bgSceneDesc: 'The weathered wooden deck of a pirate ship at sunrise, sails catching the first light, a large wooden treasure chest sitting center-deck surrounded by four curious pirate crewmates.',
        bgImage: '/stories/captain_fraction_p1.png',
        title: 'Half-Moon Bay Treasure',
        subtitle: 'Four pirates, one chest of gold!',
        prose: "Captain Fraction's crew had finally found the treasure of Half-Moon Bay — but the moment the chest creaked open, a new problem appeared: four pirates, one pile of gold, and absolutely no idea how to split it fairly.",
        mascotComment: 'Ahoy! Time to share the gold! 🏴‍☠️',
        instruction: 'Tap NEXT to step onto the main deck!',
      },
      {
        pageNumber: 2,
        bgSceneDesc: 'Close-up on the open chest, gold coins spilling out in glittering piles onto a large wooden table marked with a chalk-drawn circle divided into sections.',
        title: 'The Chalk Circle',
        subtitle: 'Splitting into equal, fair shares...',
        prose: "\"Equal shares!\" the Captain declared, drawing a big circle in chalk. \"If we split this into four equal parts, everyone gets exactly the same amount. That's what a fraction is — a fair, equal slice of the whole.\"\n\nThe crew watched as the gold was divided into four matching piles.",
        mascotComment: 'Four equal shares = 1/4 for everyone! 🪙',
        instruction: 'Tap NEXT to climb to the crow\'s nest!',
      },
      {
        pageNumber: 3,
        bgSceneDesc: 'The ship\'s crow\'s nest at midday, blue sky and open ocean stretching in every direction, a small floating scoreboard-style chalkboard tied to the mast comparing two piles of coins.',
        title: 'The Parrot\'s Objection',
        subtitle: 'Comparing halves and quarters...',
        prose: "But then Grumbleback the parrot squawked, \"Wait — my pile looks smaller than Finn's!\" Captain Fraction climbed to the crow's nest to check. Sure enough, one pile was a quarter, and the other was a half — and a half is bigger than a quarter!",
        mascotComment: '1/2 is bigger than 1/4! Good eye, parrot! 🦜',
        instruction: 'Press NEXT to sail toward the Vault Island!',
      },
      {
        pageNumber: 4,
        bgSceneDesc: 'A stormy patch of sea, dark clouds gathering, the ship rocking, an enormous locked treasure vault door on a nearby island glowing faintly with fraction symbols carved into its surface.',
        title: 'The Vault of Riddles',
        subtitle: 'Solving fraction puzzles before the storm!',
        prose: "The real prize — a vault twice the size of the first chest — waited on a nearby island, locked behind a door covered in fraction riddles. Only by solving each one, splitting numbers into fair, equal parts, could the crew unlock it before the storm rolled in.",
        mascotComment: 'Quick! Solve the fraction riddles before rain falls! ⚡',
        instruction: 'Press NEXT to solve the final fraction riddle!',
      },
      {
        pageNumber: 5,
        bgSceneDesc: 'Golden late-afternoon sun breaking through the clouds, the vault door wide open, glittering treasure spilling out onto a sandy beach, the whole crew celebrating together.',
        title: 'The Fair Sail',
        subtitle: '"Fair shares make the best crews!"',
        prose: "With the last riddle solved, the vault swung open. This time, there was no argument — the crew split the treasure fairly, four equal shares, exactly the way Captain Fraction had taught them.\n\n\"Fair shares,\" the Captain said, raising a coin, \"make the best crews.\"",
        mascotComment: 'Smooth sailing with Captain Fraction! 🎉⭐',
        instruction: 'Press NEXT to claim your 35★ reward!',
      },
    ],
  },

  // STORY 5: The Pattern Bridge
  5: {
    id: 5,
    realm: 'Math Island 🌊',
    title: 'The Pattern Bridge',
    ageRange: '8-10',
    difficulty: 2,
    rewardStars: 40,
    badgeName: 'Pattern Builder',
    themeColor: 'sky',
    pages: [
      {
        pageNumber: 1,
        bgSceneDesc: 'A deep, misty canyon at dawn, a broken rope-and-plank bridge dangling uselessly on one side, the far side barely visible through fog, a small village of treehouses in the background.',
        title: 'The Collapsed Canyon Bridge',
        subtitle: 'A village stranded across the fog...',
        prose: "The bridge to Skywood Village had collapsed in the night, and without it, no one could cross the canyon to reach the market, the school, or home. An old engineer named Nell stood at the edge, scratching her head over a strange set of numbers carved into the remaining planks.",
        mascotComment: 'The canyon is so deep! How will we cross? 🌉',
        instruction: 'Tap NEXT to examine the carved numbers!',
      },
      {
        pageNumber: 2,
        bgSceneDesc: 'Close-up on the first surviving plank of the bridge, numbers glowing faintly along its edge: 2, 4, 6, __, with empty space where the bridge should continue.',
        title: 'Number Magic Planks',
        subtitle: '2, 4, 6... What comes next?',
        prose: "\"This bridge was never ordinary,\" Nell explained. \"It was built with number magic. Each plank only appears if you can guess what comes next in the pattern.\" She pointed to the first sequence: 2, 4, 6... \"What do you think comes next?\"",
        mascotComment: 'Skip counting by 2s! 8 comes next! 🔢',
        instruction: 'Tap NEXT to build the next section of planks!',
      },
      {
        pageNumber: 3,
        bgSceneDesc: 'Midday, more of the bridge now visible stretching out over the misty canyon, each newly-appeared plank glowing briefly gold before settling into solid wood.',
        title: 'Plank by Plank',
        subtitle: 'Counting by 5s and 10s into the mist...',
        prose: "Plank by plank, the bridge grew longer as each pattern was solved — counting by twos, then by fives, then by tens. Nell cheered from the edge as the path stretched further and further into the fog.\n\n\"You're doing it,\" she called. \"Just a little further!\"",
        mascotComment: 'Look! The bridge is growing out of mid-air! ✨',
        instruction: 'Press NEXT to reach the final boss plank!',
      },
      {
        pageNumber: 4,
        bgSceneDesc: 'The middle of the canyon, high above swirling mist, the final and trickiest plank glowing with a two-step pattern that shifts by different amounts each time.',
        title: 'The Two-Step Pattern',
        subtitle: 'The hardest plank in the canyon!',
        prose: "The last plank was the hardest of all — the numbers didn't just count up evenly, they jumped by different amounts each time, like a puzzle within a puzzle. Nell held her breath as the pattern was worked out, step by careful step.",
        mascotComment: 'Stay steady high above the mist! ☁️',
        instruction: 'Press NEXT to lock the final plank in place!',
      },
      {
        pageNumber: 5,
        bgSceneDesc: 'Full daylight, the completed bridge stretching solid and golden across the canyon, sunlight breaking through the last of the mist, Skywood Village visible and welcoming on the far side.',
        title: 'Skywood Village Reached',
        subtitle: '"Number patterns hold this village together!"',
        prose: "With a final shimmer, the last plank locked into place, and the whole bridge glowed warm and solid from end to end. Nell was the first to cross, laughing with relief.\n\n\"Number patterns,\" she said, \"hold this whole village together.\"",
        mascotComment: 'Hooray! The bridge is safe and solid! 🎉⭐',
        instruction: 'Press NEXT to claim your 40★ reward!',
      },
    ],
  },

  // STORY 6: Buddy's Backyard Expedition
  6: {
    id: 6,
    realm: 'Science Lab 🔬',
    title: "Buddy's Backyard Expedition",
    ageRange: '6-8',
    difficulty: 1,
    rewardStars: 30,
    badgeName: 'Eco Explorer',
    themeColor: 'grass',
    pages: [
      {
        pageNumber: 1,
        bgSceneDesc: 'A sunny, overgrown backyard garden just after breakfast, dew still on the grass, a small wooden fence, sunflowers taller than the fence line, Buddy the Owl perched on a garden gnome with a tiny explorer\'s hat.',
        bgImage: '/stories/backyard_expedition_p1.png',
        title: 'The Tiny Explorer',
        subtitle: 'An expedition right in the backyard!',
        prose: "\"Today,\" announced Buddy the Owl, adjusting his tiny explorer hat, \"we are going on an expedition — right here in the backyard!\"\n\nHe hopped down into the grass, notebook in wing, ready to meet whoever — or whatever — lived among the flowers.",
        mascotComment: 'I have my tiny hat ready! Let\'s explore! 🦉🎩',
        instruction: 'Tap NEXT to hop down into the tall grass!',
      },
      {
        pageNumber: 2,
        bgSceneDesc: 'Ground-level view among tall blades of grass, a ladybug and a caterpillar visible on a nearby leaf, dappled sunlight filtering through leaves overhead.',
        title: 'The Munching Caterpillar',
        subtitle: 'Plant → Caterpillar...',
        prose: "The first creature Buddy met was a caterpillar, slowly munching a leaf. \"What do you eat?\" Buddy asked.\n\n\"Just leaves,\" said the caterpillar between bites. \"Plants are where I get my energy — from the sun, through the leaf, into me.\"\n\nBuddy wrote: Plant → Caterpillar.",
        mascotComment: 'Plants get energy straight from the sun! ☀️🌱',
        instruction: 'Tap NEXT to visit the garden pond!',
      },
      {
        pageNumber: 3,
        bgSceneDesc: 'A small pond corner of the garden, lily pads floating on still water, a frog sitting on a rock, dragonflies hovering above the surface.',
        title: 'The Sunbathing Frog',
        subtitle: 'Plant → Caterpillar → Frog...',
        prose: "Next, Buddy found a frog sunning itself by the pond. \"And what do you eat?\" he asked.\n\n\"Caterpillars, mostly,\" said the frog with a satisfied burp. \"And the occasional fly, if I'm lucky.\"\n\nBuddy added to his notebook: Plant → Caterpillar → Frog.",
        mascotComment: 'Ribbit! The frog eats the caterpillar! 🐸',
        instruction: 'Press NEXT to look up at the fence post!',
      },
      {
        pageNumber: 4,
        bgSceneDesc: 'A tall garden fence post with a bird perched on top, wings catching afternoon sunlight, the whole garden visible below in miniature, the pond and flower beds all connected.',
        title: 'The Watching Bird',
        subtitle: 'Everyone is connected in one big team...',
        prose: "High on the fence post sat a bird, watching everything below. \"I eat frogs, sometimes,\" the bird admitted. \"It's just how it works around here — everyone eats something, and something eats them too.\"\n\nBuddy nodded. It wasn't scary — it was just how the whole garden stayed connected.",
        mascotComment: 'Look at the whole garden from up high! 🐦',
        instruction: 'Press NEXT to see the glowing web of life!',
      },
      {
        pageNumber: 5,
        bgSceneDesc: 'A wide, golden-hour view of the entire backyard from above, soft glowing lines connecting each creature Buddy met — plant to caterpillar to frog to bird — like a gentle, glowing web across the garden.',
        title: 'The Glowing Food Web',
        subtitle: '"Nature really is one big team!"',
        prose: "Buddy closed his notebook and looked out over the garden — plant, caterpillar, frog, bird, all linked together in one great, glowing chain.\n\n\"If even one link disappeared,\" he said softly, \"the whole chain would change.\" He smiled. \"Nature really is one big team.\"",
        mascotComment: 'We are all part of Nature\'s team! 🎉⭐',
        instruction: 'Press NEXT to claim your 30★ reward!',
      },
    ],
  },
};
