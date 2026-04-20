import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Category } from "@prisma/client";

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) {}

    async create(data: CreateCategoryDto): Promise<Category> {
        // Sprawdzenie czy slug jest unikalny
        const existingCategory = await this.prisma.category.findUnique({
            where: { slug: data.slug }
        });

        if (existingCategory) {
            throw new BadRequestException('Kategoria z takim slug\'iem już istnieje');
        }

        // Jeśli parent_id jest podane, sprawdzenie czy istnieje
        if (data.parent_id) {
            const parentCategory = await this.prisma.category.findUnique({
                where: { id: data.parent_id }
            });

            if (!parentCategory) {
                throw new NotFoundException(`Kategoria nadrzędna o ID ${data.parent_id} nie znaleziona`);
            }
        }

        return await this.prisma.category.create({
            data,
            include: {
                children: true,
                attributes: true
            }
        });
    }

    async getAll() {
        return await this.prisma.category.findMany({
            include: {
                children: true,
                attributes: true,
                listings: {
                    select: {
                        id: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async getRootCategories() {
        return await this.prisma.category.findMany({
            where: {
                parent_id: null
            },
            include: {
                children: true,
                attributes: true
            },
            orderBy: { name: 'asc' }
        });
    }

    async getById(id: number): Promise<Category> {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
                parent: true,
                attributes: true,
                listings: true
            }
        });

        if (!category) {
            throw new NotFoundException(`Kategoria o ID ${id} nie znaleziona`);
        }

        return category;
    }

    async getBySlug(slug: string): Promise<Category> {
        const category = await this.prisma.category.findUnique({
            where: { slug },
            include: {
                children: true,
                parent: true,
                attributes: true
            }
        });

        if (!category) {
            throw new NotFoundException(`Kategoria ze slug\'iem "${slug}" nie znaleziona`);
        }

        return category;
    }

    async update(id: number, data: UpdateCategoryDto): Promise<Category> {
        const category = await this.prisma.category.findUnique({ where: { id } });

        if (!category) {
            throw new NotFoundException(`Kategoria o ID ${id} nie znaleziona`);
        }

        // Jeśli zmienia się slug, sprawdzić unikalność
        if (data.slug && data.slug !== category.slug) {
            const existingCategory = await this.prisma.category.findUnique({
                where: { slug: data.slug }
            });

            if (existingCategory) {
                throw new BadRequestException('Kategoria z takim slug\'iem już istnieje');
            }
        }

        return await this.prisma.category.update({
            where: { id },
            data,
            include: {
                children: true,
                attributes: true
            }
        });
    }

    async delete(id: number): Promise<void> {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
                listings: true
            }
        });

        if (!category) {
            throw new NotFoundException(`Kategoria o ID ${id} nie znaleziona`);
        }

        if (category.children.length > 0) {
            throw new BadRequestException('Nie można usunąć kategorii, która ma podkategorie');
        }

        if (category.listings.length > 0) {
            throw new BadRequestException('Nie można usunąć kategorii, która ma ogłoszenia');
        }

        await this.prisma.category.delete({ where: { id } });
    }

    async getChildren(parentId: number) {
        return await this.prisma.category.findMany({
            where: {
                parent_id: parentId
            },
            include: {
                children: true,
                attributes: true
            },
            orderBy: { name: 'asc' }
        });
    }
}
