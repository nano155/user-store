import { Router } from 'express';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { ProductsController } from './controller';
import { ProductService } from '../services/product.service';






export class ProductsRoutes {


  static get routes(): Router {

    const router = Router();
    const productService = new ProductService()
    const controller = new  ProductsController(productService)
    
    // Definir las rutas
    router.get('/', controller.getProducts);
    router.post('/',[AuthMiddleware.validateJWT], controller.createProduct);

  

    return router;
  }
  }