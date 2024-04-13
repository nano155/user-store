import { CategoryModel } from "../../data";
import {
  CreateCategoryDto,
  CustomError,
  UserEntity,
  PaginationDto,
} from "../../domain";

export class CategoryService {
  constructor() {}

  async createCategory(createCategoryDto: CreateCategoryDto, user: UserEntity) {
    const categoryExists = await CategoryModel.findOne({
      name: createCategoryDto.name,
    });

    if (categoryExists) throw CustomError.badRequest("Category already exists");

    try {
      const category = new CategoryModel({
        ...createCategoryDto,
        user: user.id,
      });

      await category.save();

      return {
        id: category.id,
        name: category.name,
        available: category.available,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getCategories(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    try {

        const [total, categories]= await Promise.all([
            CategoryModel.countDocuments(),
            CategoryModel.find()
            .skip((page - 1) * limit)
            .limit(limit) 
        ])
      const totalPages = Math.ceil((total/limit))

      return {
        page: ( page > totalPages)?null: page,
        limit: limit,
        total: total,
        totalPages:totalPages,
        prev: (page -1 > 0 && page < totalPages)?`/api/categories?page=${page - 1}&limit=${limit}`:null,
        next: (page + 1 > totalPages)?null:`/api/categories?page=${page +1}&limit=${limit}`,
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          available: category.available,
        })),
      };
    } catch (error) {
      throw CustomError.internalServer("Internal server error");
    }
  }
}
