
export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit' | 'Ekstrem';
  reward: number;
  risk: number;
  type: 'PRANK' | 'STEALTH' | 'SABOTAGE';
}

export interface GameState {
  playerName: string;
  selectedCharacter: string;
  reputation: number;
  suspicion: number;
  missionCount: number;
  inventory: string[];
  currentMission: Mission | null;
  history: string[];
  gameOver: boolean;
  won: boolean;
  isStarted: boolean;
  isExpelled: boolean;
}

export interface AIResponse {
  scenario: string;
  options: {
    text: string;
    risk: number;
    successChance: number;
    outcome: string;
  }[];
}
