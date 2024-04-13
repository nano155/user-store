import { ProductModel } from "../../data";
import {
  CreateProductDto,
  CustomError,
  PaginationDto,
} from "../../domain";

export class ProductService {
  constructor() {}

  async createProduct(createProductDto: CreateProductDto) {
    const productExists = await ProductModel.findOne({
      name: createProductDto.name,
    });

    if (productExists) throw CustomError.badRequest("Category already exists");

    try {
      const product = new ProductModel({
        ...createProductDto
      });

      await product.save();

      return product;

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getProducts(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    try {

        const [total, products]= await Promise.all([
            ProductModel.countDocuments(),
            ProductModel.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user')
            .populate('category')
        ])
      const totalPages = Math.ceil((total/limit))

      return {
        page: ( page > totalPages)?null: page,
        limit: limit,
        total: total,
        totalPages:totalPages,
        prev: (page -1 > 0 && page < totalPages)?`/api/products?page=${page - 1}&limit=${limit}`:null,
        next: (page + 1 > totalPages)?null:`/api/products?page=${page +1}&limit=${limit}`,
        products: products
      };
    } catch (error) {
      throw CustomError.internalServer("Internal server error");
    }
  }
}