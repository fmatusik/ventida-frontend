import { Body, Controller, Get, NotFoundException, Param, Post, Req, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserService } from "./user.service";
import { UserMapper } from "./user.mapper";
import { AuthGuard } from "@nestjs/passport";
import { RequiredKeys } from "@prisma/client/runtime/library";
import { ListingService } from "../listing/listing.service";
import { ListingMapper } from "../listing/listing.mapper";
import { ReviewService } from "../review/review.service";
import { ReviewMapper } from "../review/review.mapper";

 

@Controller('user')
export class UserController{

  constructor( private readonly userService: UserService,
    private readonly listingService: ListingService,
    private readonly reviewService: ReviewService
   ) {}

    @Post()
    async create(@Body() body: CreateUserDto) {
        const user = await this.userService.create(body)
        return {
          success: true,
          userId: user.id
        }
    }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getUser(@Req() req: Request) {
    const userEmail = (req as any).user['email'];
    const user = await this.userService.getByEmail(userEmail);
    if(!user) throw new NotFoundException(`This user was not found`);
    return user;
    //return UserMapper.toAccountDetails(user, user.);
  }
  
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const res = await this.userService.getByIdForAccountDetails(Number(id));
    if(!res) throw new NotFoundException(`This user was not found`);
    return UserMapper.toAccountDetails(res.user, res.avgRating);
  }

  @Get(':id/listings')
  async getUserListingsById(@Param('id') id: number) {
    const res = await this.listingService.getByUserId(id);
    if(!res) throw new NotFoundException(`This user has no listings or does not exist`);
    return res.map(listing => ListingMapper.toShortLisitngSummary(listing));
  }

  
  @Get(':id/reviews')
  async getUserRewievsById(@Param('id') id: number) {
    const res = await this.reviewService.getByUserId(id);
    if(!res) throw new NotFoundException(`This user has no listings or does not exist`);
    return res.map(review => ReviewMapper.toGetReview(review));
  }
}