import joi from 'joi';

export const SupportTicketSchema = joi
  .object({
    subject: joi.string().required(),
    text: joi.string().required(),
    entity_type: joi.string().required(),
    entity_uuid: joi.string().required(),
    user_uuid: joi.string().required(),
    language: joi.string().required(),
    attachment: joi.alternatives().try(
      joi.optional(),
      joi.string().optional(),
      joi.array().items(
        joi.object({
          fileName: joi.optional(),
        }),
      ),
    ),
  })
  .options({
    abortEarly: false,
  });

export const SupportTicketMessageSchema = joi.object({
  text: joi.optional(),
  attachment: joi.alternatives().try(
    joi.optional(),
    joi.string().optional(),
    joi.array().items(
      joi.object({
        fileName: joi.optional(),
      }),
    ),
  ),
  user_uuid: joi.string().required(),
  entity_type: joi.string().required(),
  support_ticket_uuid: joi.string().required(),
});
