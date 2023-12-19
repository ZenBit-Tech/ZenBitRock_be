import { Contact } from './contact.type';
import { Lead } from './lead.type';
import { WorkflowStage } from './workflow-stage.type';

type LeadDetailsResponse = {
  data: Lead & {
    contact_name_contact: Contact;
    conversion_status_workflow_stage: WorkflowStage;
  };
};

export { LeadDetailsResponse };
