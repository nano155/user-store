import { Router } from 'express';
import { ImagesController } from './controller';



export class ImagesRoutes {

    static get routes(){
        const router = Router()

        const controller = new ImagesController()

        router.get('/:type/:img', controller.getImage)

        return router
    }
}