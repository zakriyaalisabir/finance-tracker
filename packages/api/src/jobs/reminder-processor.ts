import { sendMessage } from '../messaging';

interface ReminderJob {
  subscriptionId: string;
  name: string;
  amount: number;
  currency: string;
  dueDate: string;
  channel: 'whatsapp' | 'line';
  contact: string;
  type: 'pre' | 'due' | 'overdue';
}

export async function processReminder(job: ReminderJob) {
  const { name, amount, currency, dueDate, channel, contact, type } = job;
  
  let text: string;
  switch (type) {
    case 'pre':
      text = `Heads-up: ${name} (${currency} ${amount}) is due on ${dueDate}. Reply "PAID ${name}" when you've paid.`;
      break;
    case 'due':
      text = `Due today: ${name} (${currency} ${amount}). Reply "PAID ${name}" when paid.`;
      break;
    case 'overdue':
      text = `Overdue: ${name} since ${dueDate}. Please settle. Reply "PAID ${name}" after you pay.`;
      break;
    default:
      throw new Error(`Unknown reminder type: ${type}`);
  }

  try {
    const result = await sendMessage({ channel, contact, text });
    console.log(`Reminder sent for ${name}:`, result);
    return result;
  } catch (error) {
    console.error(`Failed to send reminder for ${name}:`, error);
    throw error;
  }
}