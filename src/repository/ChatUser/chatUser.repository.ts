import BaseRepository from '../base.repository';

import ChatUsers from '@/models/chatUsers.model';
import { BuildChatUserArgs } from '@/interfaces/ChatUsers/chatUsers.interface';

export default class ChatUserRepo extends BaseRepository<ChatUsers> {
  constructor() {
    super(ChatUsers.name);
  }
  readonly createChatUser = async (chatCreateArgs: BuildChatUserArgs, extraParam: { transaction }) => {
    const { data } = chatCreateArgs;

    const { transaction } = extraParam;

    const chat = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return chat;
  };
}
