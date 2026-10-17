import * as fs from 'fs';

/**
 * @method folderHandler
 * @param {String} path
 * @returns {Boolean} true & false
 * @description this method check if folder exist if not then create folder
 */
export const folderHandler = (path: string): boolean => {
  if (fs.existsSync(path)) {
    return true;
  } else {
    fs.mkdirSync(path, { recursive: true });
    return true;
  }
};


// Function to convert file to base64

export const fileToBase64Sync = (filePath,type) => {
  try {
    // Read file synchronously
    const data = fs.readFileSync(filePath);
    // Convert data to base64
    const base64String = `data:${type};base64,${Buffer.from(data).toString('base64')}`;
    return base64String;
  } catch (err) {
    // If an error occurs, throw it
    throw err;
  }
};

