import { multerSaveFilesOrg } from "multer-savefilesorg";
import multer from "multer";

export const remoteUpload = multer({
  storage: multerSaveFilesOrg({
    apiAccessToken: process.env.SAVEFILESORG_API_KEY,
    relativePath: "/bus_logo_uploads/*",
  }),
});
