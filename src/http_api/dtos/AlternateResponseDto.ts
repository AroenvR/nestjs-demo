import { ApiProperty } from "@nestjs/swagger";

/**
 * Data Transfer Object for alternate (non-entity) responses to a client.
 */
export class AlternateResponseDto {
	@ApiProperty({ description: "Unique autoincrement identifier of the entity", example: 1, uniqueItems: true, nullable: false })
	id: number;

	@ApiProperty({ description: "Indicates that this is a DTO" })
	isDto = true;

	constructor(data: object) {
		if (data && "id" in data && data.id && typeof data.id === "number") this.id = data.id;
		else this.id = 1;
	}
}
