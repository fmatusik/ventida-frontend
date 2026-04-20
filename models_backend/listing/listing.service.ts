import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateListingDto } from "./dto/create-listing.dto";
import { UpdateListingDto } from "./dto/update-listing.dto";
import { Listing } from "@prisma/client";

@Injectable()
export class ListingService{
    constructor(private prisma: PrismaService){}

    async create(data: CreateListingDto, userId: number): Promise<Listing> {
        try {
            return await this.prisma.listing.create({
                data: {
                    ...data,
                    userId
                },
                include: {
                    category: true,
                    images: true,
                    _count: { select: { views: true, favourites: true } }
                }
            });
        } catch (error) {
            throw new BadRequestException('Nie udało się utworzyć ogłoszenia');
        }
    }

    async getAll(skip = 0, take = 20, categoryId?: number): Promise<Listing[]> {
        const where: any = {};
        if (categoryId) {
            where.categoryId = categoryId;
        }
        
        return await this.prisma.listing.findMany({
            where,
            skip,
            take,
            include: {
                category: true,
                images: true,
                _count: { select: { views: true, favourites: true } }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    async getById(id: number): Promise<Listing> {
        const listing = await this.prisma.listing.findUnique({
            where: { id },
            include: {
                category: true,
                images: true,
                user: true,
                _count: { select: { views: true, favourites: true, chats: true } }
            }
        });

        if (!listing) {
            throw new NotFoundException(`Ogłoszenie o ID ${id} nie znalezione`);
        }

        return listing;
    }

    async getByUserId(userId): Promise<any[]> {
        return await this.prisma.listing.findMany({
            where: { userId },
            include: { 
                _count: { select: { views: true, favourites: true } }, 
                category: true 
            },
            orderBy: { created_at: 'desc' }
        });
    }

    async update(id: number, data: UpdateListingDto, userId: number): Promise<Listing> {
        const listing = await this.prisma.listing.findUnique({ where: { id } });

        if (!listing) {
            throw new NotFoundException(`Ogłoszenie o ID ${id} nie znalezione`);
        }

        if (listing.userId !== userId) {
            throw new BadRequestException('Brak uprawnień do edycji tego ogłoszenia');
        }

        return await this.prisma.listing.update({
            where: { id },
            data,
            include: {
                category: true,
                images: true,
                _count: { select: { views: true, favourites: true } }
            }
        });
    }

    async delete(id: number, userId: number): Promise<void> {
        const listing = await this.prisma.listing.findUnique({ where: { id } });

        if (!listing) {
            throw new NotFoundException(`Ogłoszenie o ID ${id} nie znalezione`);
        }

        if (listing.userId !== userId) {
            throw new BadRequestException('Brak uprawnień do usunięcia tego ogłoszenia');
        }

        await this.prisma.listing.delete({ where: { id } });
    }

    async addImage(listingId: number, url: string, position: number) {
        const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
        
        if (!listing) {
            throw new NotFoundException(`Ogłoszenie o ID ${listingId} nie znalezione`);
        }

        return await this.prisma.listingImage.create({
            data: {
                listingId,
                url,
                position
            }
        });
    }

    async deleteImage(imageId: number): Promise<void> {
        const image = await this.prisma.listingImage.findUnique({ where: { id: imageId } });
        
        if (!image) {
            throw new NotFoundException(`Zdjęcie o ID ${imageId} nie znalezione`);
        }

        await this.prisma.listingImage.delete({ where: { id: imageId } });
    }

    async search(query: string, skip = 0, take = 20): Promise<Listing[]> {
        return await this.prisma.listing.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            skip,
            take,
            include: {
                category: true,
                images: true,
                _count: { select: { views: true, favourites: true } }
            },
            orderBy: { created_at: 'desc' }
        });
    }
}