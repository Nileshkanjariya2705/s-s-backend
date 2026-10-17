import Messages from '@/models/messages.model';

export interface BuildMessageArgs {
  data: Request['body'];
  action: 'create' | 'update';
  message?: Messages;
}
