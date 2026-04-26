import { UserResponseDto } from "../user/UserResponseDto";

export class ListingResponseDto {
  id!: number;
  title!: string;
  description!: string;
  price!: number;
  is_negotiable!: boolean;
  status!: string;
  location!: string;
  created_at!: Date;
  expires_at?: Date;
  contact_person?: string;
  email?: string;
  phone_number?: string;
  userId!: number;
  categoryId!: number;
  images?: ListingImageResponseDto[];
  _count?: { views: number; favourites: number };
  category?: { id: number; name: string };
  user?: UserResponseDto;
}

export class ListingImageResponseDto {
  id!: number;
  url!: string;
  listingId!: number;
}

export class ShortListingSummaryDto {
  id!: number;
  title!: string;
  category!: string;
  price!: number;
  viewsCount!: number;
  likesCount!: number;
  created_at!: string;
  imageUrl!: string;
  location?: string;
}

export class CreateListingDto {
  title!: string;
  description!: string;
  price!: number;
  is_negotiable?: boolean;
  status!: string;
  location!: string;
  contact_person?: string;
  email?: string;
  phone_number?: string;
  categoryId!: number;
}

export class UpdateListingDto {
  title?: string;
  description?: string;
  price?: number;
  is_negotiable?: boolean;
  status?: string;
  location?: string;
  contact_person?: string;
  email?: string;
  phone_number?: string;
  categoryId?: number;
}
