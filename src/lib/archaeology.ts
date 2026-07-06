export type ArtifactCategory = 'phrase' | 'website' | 'behavior' | 'mythology' | 'memory' | 'rare';

export interface Artifact {
  id: string;
  category: ArtifactCategory;
  content: string;
  followUp?: string;
  options?: string[];
  followUpResponses?: string[];
}

const phrases: Artifact[] = [
  { id: 'phrase_1', category: 'phrase', content: 'double click if you agree', followUp: 'we miss this.' },
  { id: 'phrase_2', category: 'phrase', content: 'under construction', followUp: 'people used to put this on purpose.' },
  { id: 'phrase_3', category: 'phrase', content: 'best viewed in internet explorer', followUp: 'we miss this.' },
  { id: 'phrase_4', category: 'phrase', content: 'click here to enter', followUp: 'people used to put this on purpose.' },
  { id: 'phrase_5', category: 'phrase', content: 'welcome to my homepage', followUp: 'we miss this.' },
  { id: 'phrase_6', category: 'phrase', content: 'you are visitor #000143', followUp: 'people used to put this on purpose.' },
  { id: 'phrase_7', category: 'phrase', content: 'please sign my guestbook', followUp: 'we miss this.' },
  { id: 'phrase_8', category: 'phrase', content: 'powered by geocities', followUp: 'people used to put this on purpose.' }
];

const websites: Artifact[] = [
  { id: 'web_1', category: 'website', content: 'someone somewhere still runs a forum.' },
  { id: 'web_2', category: 'website', content: 'club penguin existed.' },
  { id: 'web_3', category: 'website', content: 'miniclip changed lives.' },
  { id: 'web_4', category: 'website', content: 'there are websites older than you\nstill online.' },
  { id: 'web_5', category: 'website', content: 'someone is probably updating a wiki\nright now.' }
];

const behaviors: Artifact[] = [
  { id: 'beh_1', category: 'behavior', content: 'people used to customize their cursors.' },
  { id: 'beh_2', category: 'behavior', content: 'visitor counters were a status symbol.' },
  { id: 'beh_3', category: 'behavior', content: 'there were websites\nfor individual hamsters.' },
  { id: 'beh_4', category: 'behavior', content: 'people wrote blog posts\nfor five readers.' },
  { id: 'beh_5', category: 'behavior', content: 'someone once made\nan entire website about cheese.' }
];

const mythology: Artifact[] = [
  { id: 'myth_1', category: 'mythology', content: 'there are abandoned forums\nstill waiting for replies.' },
  { id: 'myth_2', category: 'mythology', content: "someone's last tumblr post\nwas probably in 2014." },
  { id: 'myth_3', category: 'mythology', content: 'a website disappeared today\nand nobody noticed.' },
  { id: 'myth_4', category: 'mythology', content: 'there are broken hyperlinks\nolder than some countries.' }
];

const userMemory: Artifact[] = [
  { 
    id: 'mem_1', 
    category: 'memory', 
    content: 'what was the first website\nyou loved?',
    options: ['youtube', 'miniclip', 'club penguin', 'tumblr', 'yahoo answers', 'something else'],
    followUpResponses: ['interesting.', "that's a good one.", 'we miss that too.']
  }
];

const rare: Artifact[] = [
  { id: 'rare_1', category: 'rare', content: "someone's neopets are\nprobably still hungry." },
  { id: 'rare_2', category: 'rare', content: "there are websites\nthat haven't changed since 1998." },
  { id: 'rare_3', category: 'rare', content: "one day,\nokayimbored will become\nan internet artifact too." }
];

export const allArtifacts = [
  ...phrases,
  ...websites,
  ...behaviors,
  ...mythology,
  ...userMemory
];

export const rareArtifacts = rare;

export function getRandomArtifact(): Artifact {
  // 0.1% chance of rare artifact (1 in 1000)
  if (Math.random() < 0.001) {
    return rareArtifacts[Math.floor(Math.random() * rareArtifacts.length)];
  }
  
  // Otherwise pick a standard artifact
  return allArtifacts[Math.floor(Math.random() * allArtifacts.length)];
}
