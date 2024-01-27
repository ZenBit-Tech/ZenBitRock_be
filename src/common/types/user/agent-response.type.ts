import { Contact } from '../lead';

type AgentResponse = {
  id: string;
  description: string | null;
  agent_type: string;
  agency: string | null;
  primary_contact_contact: Contact;
};

export { type AgentResponse };
