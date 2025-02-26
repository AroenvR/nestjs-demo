import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from 'class-validator';
import { QueryDto } from "../QueryDto";
import { UserEntity } from "../../../domain/user/UserEntity"; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * This DTO represents the allowed values a client can use to query for one or many {@link UserEntity} objects.
 */
export class UserQueryDto extends QueryDto {
    @ApiProperty({ description: 'Whether to query for users by their username' })
    @IsOptional()
    @IsString({ message: 'value must be a string' })
    username?: string;
}