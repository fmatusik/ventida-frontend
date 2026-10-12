export class UserResponseDto {
    id!: number;
    name?: string;
    surname?: string;
    username?: string;
    email!: string;
    phone_number?: string;
    pictureUrl?: string;
    city?: string;
    countryCode?: string;
    role?: "USER" | "ADMIN";
    createdAt!: Date;
    description?: string;
}
