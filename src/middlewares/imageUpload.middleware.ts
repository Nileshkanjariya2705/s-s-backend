import { folderHandler } from '@/utils/general';
import multer from 'multer';
import path from 'path';
const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/svg+xml',
    'video/mp4',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error('Please upload only jpeg/png/jpg file.'));
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.includes('application/pdf')) {
      folderHandler( path.join(__dirname, '../../public/pdf'))
      cb(null, path.join(__dirname, '../../public/pdf'));
    } else {
      folderHandler(path.join(__dirname, '../../public/images'))
      cb(null, path.join(__dirname, '../../public/images'));
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

export const uploadMedia = multer({
  fileFilter: (_, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    imageFilter(_, file, cb);
  },
  limits: {
    // ------ max file size 100MB ------------
    fileSize: 1024 * 1024 * 10 * 10,
    fieldSize: 1024 * 1024 * 10 * 10,
  },
  storage: storage,
});
