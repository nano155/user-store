
import { envs } from "../../config";
import { CategoryModel, MongoDatabase, ProductModel, UserModel } from "../mongo";
import { seedData } from "./data";


(async () => {
  await MongoDatabase.connect({
    dbName: envs.MONGO_DB_NAME,
    mongoUrl: envs.MONGO_URL,
  });

  await main();

  await MongoDatabase.disconnect();
})();

const randomBetween0andX = ( x: number) =>{

    return Math.floor(Math.random() * x);
}

async function main() {
    // 0. borrar todo!
    await Promise.all([
        UserModel.deleteMany(),
        CategoryModel.deleteMany(),
        ProductModel.deleteMany()
    ])

    // 1. crear usuarios
    const users = await UserModel.insertMany(seedData.users);

    // 2. crear categorias
    const categories = await CategoryModel.insertMany(
        seedData.categories.map(category => ({
            ...category,
            user: users[0].id
        }))
    )

    // 3. crear productos
    const products = await ProductModel.insertMany(
        seedData.products.map(product =>({
            ...product,
            category: categories[randomBetween0andX(seedData.categories.length -1) ].id,
            user: users[randomBetween0andX(seedData.users.length -1) ].id
        }))
    )


    console.log('Seeded');
    
}
