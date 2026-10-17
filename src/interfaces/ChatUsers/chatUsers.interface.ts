import ChatUsers from '@/models/chatUsers.model';

export interface BuildChatUserArgs {
  data: Request['body'];
  action: 'create' | 'update';
  chatUsers?: ChatUsers;
}
