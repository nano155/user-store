import { Router } from 'express';

import { AuthMiddleware } from '../../middleware/auth.middleware';
import { CategoryService } from '../services/category.service';
import { FileUploadController } from './controller';
import { FileUploadService } from '../services/file-upload.service';
import { FileUploadMiddelware } from '../../middleware/file-upload-middelware';
import { TypeMiddelware } from '../../middleware/type.middleware';






export class FileUploadRoutes {


  static get routes(): Router {

    const router = Router();
    
    const fileUploadService = new FileUploadService()
    const controller = new  FileUploadController(fileUploadService)

    router.use(FileUploadMiddelware.containFiles);
    router.use(TypeMiddelware.validTypes(['users', 'products', 'categories']))
    
    // Definir las rutas
    router.post('/single/:type', controller.uploadFile);
    router.post('/multiple/:type', controller.uploadFileMultipleFiles);

  

    return router;
  }
  }