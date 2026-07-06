export type QuestionCategory = 'HUMAN' | 'STRANGE' | 'WEBSITE' | 'SILLY';

export interface CuriosityQuestion {
  id: string;
  category: QuestionCategory;
  text: string;
  options: string[];
}

export const CURIOSITY_QUESTIONS: CuriosityQuestion[] = [
  // HUMAN QUESTIONS
  {
    id: 'h_stay',
    category: 'HUMAN',
    text: "why did you stay?",
    options: ["I DON'T KNOW", "IT'S QUIET", "NOTHING BETTER TO DO", "I LIKE THE CATS"]
  },
  {
    id: 'h_before',
    category: 'HUMAN',
    text: "what were you doing\nbefore you opened this website?",
    options: ["WORKING", "SCROLLING", "PROCRASTINATING", "SLEEPING"]
  },
  {
    id: 'h_bored',
    category: 'HUMAN',
    text: "do you think\nyou're actually bored?",
    options: ["YES", "NO", "MAYBE", "I'M JUST AVOIDING SOMETHING"]
  },
  {
    id: 'h_awake',
    category: 'HUMAN',
    text: "how long have you been awake?",
    options: ["TOO LONG", "NOT LONG ENOUGH", "I LOST TRACK", "I REFUSE TO ANSWER"]
  },
  {
    id: 'h_nothing',
    category: 'HUMAN',
    text: "when was the last time\nyou did absolutely nothing?",
    options: ["TODAY", "YESTERDAY", "I DON'T REMEMBER", "IMPOSSIBLE"]
  },
  {
    id: 'h_miss',
    category: 'HUMAN',
    text: "do you miss anything\nfrom the internet?",
    options: ["YES", "NO", "SOMETIMES", "IT USED TO BE QUIETER"]
  },

  // STRANGE QUESTIONS
  {
    id: 's_fish',
    category: 'STRANGE',
    text: "do fish know\nwhen it's raining?",
    options: ["YES", "NO", "PROBABLY", "THEY DON'T CARE"]
  },
  {
    id: 's_trust',
    category: 'STRANGE',
    text: "would your 12-year-old self\ntrust you?",
    options: ["YES", "NO", "MAYBE", "THEY WOULD BE CONFUSED"]
  },
  {
    id: 's_sleep',
    category: 'STRANGE',
    text: "if websites could sleep,\nwhen would this one sleep?",
    options: ["NEVER", "RIGHT NOW", "DURING THE DAY", "WHEN IT RAINS"]
  },
  {
    id: 's_cat_dreams',
    category: 'STRANGE',
    text: "what do you think\nthe cat dreams about?",
    options: ["MOUSE CURSORS", "NOTHING", "BEING ALONE", "FOOD"]
  },
  {
    id: 's_color',
    category: 'STRANGE',
    text: "if tonight had a color,\nwhat would it be?",
    options: ["DARK BLUE", "GREY", "WARM YELLOW", "NO COLOR"]
  },

  // WEBSITE QUESTIONS
  {
    id: 'w_okay',
    category: 'WEBSITE',
    text: "do you think\nwe're doing okay?",
    options: ["YES", "NO", "YOU'RE DOING YOUR BEST", "I DON'T KNOW"]
  },
  {
    id: 'w_cats',
    category: 'WEBSITE',
    text: "should there be more cats?",
    options: ["YES", "NO", "IT'S CROWDED ENOUGH", "ALWAYS"]
  },
  {
    id: 'w_lonely',
    category: 'WEBSITE',
    text: "does this place feel lonely?",
    options: ["YES", "NO", "IT FEELS PEACEFUL", "A LITTLE BIT"]
  },
  {
    id: 'w_back',
    category: 'WEBSITE',
    text: "would you come back here?",
    options: ["YES", "NO", "MAYBE", "IF I REMEMBER"]
  },
  {
    id: 'w_record',
    category: 'WEBSITE',
    text: "should the record player\nstay?",
    options: ["YES", "NO", "IT'S CALMING", "I DIDN'T NOTICE IT"]
  },
  {
    id: 'w_bored',
    category: 'WEBSITE',
    text: "do you think\nthe website is bored?",
    options: ["YES", "NO", "WEBSITES DON'T FEEL", "PROBABLY"]
  },

  // SILLY QUESTIONS
  {
    id: 'si_tabs',
    category: 'SILLY',
    text: "be honest.\n\nhow many tabs\ndo you have open?",
    options: ["JUST THIS ONE", "A FEW", "TOO MANY", "I REFUSE TO LOOK"]
  },
  {
    id: 'si_eaten',
    category: 'SILLY',
    text: "have you eaten today?",
    options: ["YES", "NO", "I WILL SOON", "DO SNACKS COUNT?"]
  },
  {
    id: 'si_expect',
    category: 'SILLY',
    text: "did you expect\nthere to be cats?",
    options: ["YES", "NO", "I EXPECT NOTHING", "THEY SURPRISED ME"]
  },
  {
    id: 'si_taxes',
    category: 'SILLY',
    text: "would you trust\nthe cat with your taxes?",
    options: ["ABSOLUTELY", "NO", "MAYBE?", "THEY WOULD EAT THEM"]
  },
  {
    id: 'si_dog',
    category: 'SILLY',
    text: "do you think\nthe dog is asleep?",
    options: ["WHAT DOG?", "YES", "NO", "I HOPE SO"]
  }
];

export const CURIOSITY_RESPONSES = [
  "interesting.",
  "huh.",
  "thanks.",
  "that's about what we expected.",
  "the cat disagrees.",
  "we'll think about that.",
  "fair.",
  "makes sense.",
  "good to know."
];

export function getRandomQuestion(): CuriosityQuestion {
  return CURIOSITY_QUESTIONS[Math.floor(Math.random() * CURIOSITY_QUESTIONS.length)];
}

export function getRandomResponse(): string {
  return CURIOSITY_RESPONSES[Math.floor(Math.random() * CURIOSITY_RESPONSES.length)];
}
