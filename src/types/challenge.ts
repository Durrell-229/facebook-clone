export type TChallengeCategory =
  | 'Algorithmes'
  | 'Frontend'
  | 'Backend'
  | 'Fullstack'
  | 'Cybersécurité'
  | 'Data & IA'
  | 'DevOps'
  | 'Mobile'
  | 'Open Source'
  | 'Hackathon';

export interface IChallenge {
  _id: string;
  title: string;
  image: string;
  category: TChallengeCategory;
  participants?: { _id: string; dp: string }[];
}

export interface IChallengeEvent {
  _id: string;
  challengeTitle: string;
  challengeIcon: string;
  eventImage: string;
  title: string;
  description: string;
  endsInDays: number;
}
