export interface Contact {
  id: string;
  name: string;
  phone: string;
  status: 'pending' | 'sent' | 'skipped';
}

export interface MessageTemplate {
  text: string;
}

export enum AppStep {
  IMPORT = 'IMPORT',
  COMPOSE = 'COMPOSE',
  SEND = 'SEND',
}
