import BaseRepository from '../base.repository';
import Chat from '@/models/chat.model';
import { BuildChatArgs } from '@/interfaces/Chat/chat.interface';

export default class ChatRepo extends BaseRepository<Chat> {
  constructor() {
    super(Chat.name);
  }
  readonly createChat = async (chatCreateArgs: BuildChatArgs, extraParam: { transaction }) => {
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
