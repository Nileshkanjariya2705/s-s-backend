import BaseRepository from '../base.repository';
import Chat from '@/models/chat.model';
import { BuildChatArgs } from '@/interfaces/Chat/chat.interface';
import Messages from '@/models/messages.model';
import { BuildMessageArgs } from '@/interfaces/Messages/message.interface';

export default class MessageRepo extends BaseRepository<Messages> {
  constructor() {
    super(Messages.name);
  }
  readonly createMessage = async (messageCreateArgs: BuildMessageArgs, extraParam?: { transaction }) => {
    try {
      const { data } = messageCreateArgs;

      const { transaction } = extraParam;

      const message = await this.create(
        {
          ...data,
        },
        { transaction },
      );
      return message;
    } catch (error) {
     
    }
  };
}
