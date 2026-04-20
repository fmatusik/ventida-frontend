import { Injectable, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    try {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 12);
      }

      return await this.prisma.user.create({ data });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new BadRequestException('Email już istnieje w bazie danych.');
      }

      throw new InternalServerErrorException('Wystąpił błąd przy tworzeniu użytkownika.');
    }
  }

  async getByEmail(email) {
    return await this.prisma.user.findUnique({
      where: { email: email },
    });
  }

  async getById(id) {
    return await this.prisma.user.findUnique({
      where: {id: id},
      include: {
        reviewsTaken: true,
      },
    });
  }

  async getByIdForAccountDetails(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { reviewsTaken: true } } }
    });

    if (!user) return null;

    const agg = await this.prisma.review.aggregate({
      where: { reviewed_user_id: id },
      _avg: { rating: true },
    });

    return { user, avgRating: agg._avg.rating ?? 0 };
  }

}
