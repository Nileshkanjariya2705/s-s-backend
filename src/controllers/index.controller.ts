// =================== import packages ==================
import { NextFunction, Request, Response } from 'express';
// ======================================================
// import { ActivityService } from '@/services/activity.service';

class IndexController {
  //   public activityService = new ActivityService();

  public index = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  public webhookCallback = (req: Request, res: Response, next: NextFunction): void => {
    try {
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };
}

export default IndexController;
