import { ListingResponseDto } from "./listing/ListingDto";
import { UserResponseDto } from "./user/UserResponseDto";

export class CategoryDto {
  id!: number;
  name!: string;
  slug!: string;
  position!: number;
  parentId?: number;
  children?: CategoryDto[];
}

export class ReviewDto {
  id!: number;
  title!: string;
  description!: string;
  rating!: number;
  created_at!: Date;
  userId!: number;
  listingId!: number;
  reviewer?: { id: number; username: string; pictureUrl?: string };
}

export class ChatDto {
  id!: number;
  userId!: number;
  listingId!: number;
  created_at!: Date;
  messages?: MessageDto[];
  listing?: ListingResponseDto;
  user?: UserResponseDto;
}

export class MessageDto {
  id!: number;
  message!: string;
  senderId!: number;
  chatId!: number;
  created_at!: Date;
  is_read!: boolean;
}

export class FavouriteDto {
  id!: number;
  userId!: number;
  listingId!: number;
  created_at!: Date;
}

export class AddressDto {
  id!: number;
  userId!: number;
  city!: string;
  street!: string;
  zip_code!: string;
  country!: string;
}

export class ViewDto {
  id!: number;
  listingId!: number;
  userId?: number;
  created_at!: Date;
}
