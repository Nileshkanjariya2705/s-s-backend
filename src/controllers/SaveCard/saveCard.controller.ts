import { TAP_AUTHORIZATION } from '@/config';
import { generalResponse, responseType } from '@/helper/common.helper';
import { SAVE_CARD_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import SaveCard from '@/models/saveCard.model';
import User from '@/models/user.model';
import SaveCardRepo from '@/repository/SaveCard/saveCard.repository';

import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';

export class SaveCardController {
  constructor(private readonly saveCardRepository: SaveCardRepo) {}

  public readonly createNewCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { card_name, store_info_uuid, customer_id, card_id } = req.body;

      const findCustomerWithSameCard = await this.saveCardRepository.get({
        where: { card_id: card_id, customer_id: customer_id },
      });

      const findOnlyCustomer = await this.saveCardRepository.get({
        where: { customer_id: customer_id, card_id: null },
      });

      if (findOnlyCustomer) {
        const updateMemberUser = await SaveCard.update(
          {
            card_id: card_id,
            card_name: card_name,
          },
          {
            where: {
              customer_id: customer_id,
            },
          },
        );
        return generalResponse(res, null, SAVE_CARD_MESSAGES.CARD_ADDED, responseType.SUCCESS, true, 200);
      } else if (!findCustomerWithSameCard) {
        const result = await db.transaction(async (t) => {
          const createCard = await this.saveCardRepository.createSaveCard(
            {
              data: {
                card_name: card_name,
                store_info_uuid: store_info_uuid,
                customer_id: customer_id,
                card_id: card_id,
              },
              action: 'create',
            },
            { transaction: t },
          );
        });

        return generalResponse(res, null, SAVE_CARD_MESSAGES.CARD_ADDED, responseType.SUCCESS, true, 200);
      } else {
        return generalResponse(res, null, SAVE_CARD_MESSAGES.UNIQUE_CARD_ERROR, responseType.FAILURE, true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getCardList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { store_info_uuid, apiParams } = req.query as { store_info_uuid: string; apiParams: object };
      const { page, limit, sort, isAsc, searchText } = apiParams as any;

      const isOrderAsc = isAsc === 'true';
      let order;
      if (sort) {
        if (sort === 'created_at' || sort === 'card_name') {
          order = [[sort, isOrderAsc ? 'ASC' : 'DESC']];
        }
      }

      let srch = {};

      if (searchText) {
        srch = {
          [Op.or]: [
            {
              card_name: {
                [Op.like]: `%${searchText}%`,
              },
            },
          ],
        };
      }

      const findAllCard = await this.saveCardRepository.getAllData({
        where: { store_info_uuid: store_info_uuid, ...srch, card_name: { [Op.ne]: null } },
        order: order ? order : [['created_at', 'DESC']],
        limit: +limit,
        offset: (+page - 1) * +limit,
      });
      if (findAllCard?.count !== 0) {
        return generalResponse(res, findAllCard, SAVE_CARD_MESSAGES.CARD_FETCHED, responseType.SUCCESS, true, 200);
      } else {
        return generalResponse(res, null, SAVE_CARD_MESSAGES.UNIQUE_CARD_ERROR, responseType.FAILURE, true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deleteCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, name } = req.params;
      const getCard = await this.saveCardRepository.get({
        where: {
          uuid: id,
          card_name: name,
        },
      });
      if (getCard) {
        await this.saveCardRepository.deleteData({
          where: {
            uuid: id,
            card_name: name,
          },
        });
        return generalResponse(res, null, SAVE_CARD_MESSAGES.CARD_DELETED, responseType.SUCCESS, true, 200);
      } else {
        return generalResponse(res, null, SAVE_CARD_MESSAGES.FAILED_CARD_DELETE, responseType.FAILURE, true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly editCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { card_name, store_info_uuid, customer_id, card_id } = req.body;
      const updateCard = await SaveCard.update(
        {
          card_name: card_name,
        },
        {
          where: {
            card_id: card_id,
            customer_id: customer_id,
            store_info_uuid: store_info_uuid,
          },
        },
      );
      return generalResponse(res, null, SAVE_CARD_MESSAGES.CARD_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}
