import Chat from '@/models/chat.model';

export interface BuildChatArgs {
  data: Request['body'];
  action: 'create' | 'update';
  chat?: Chat;
}
