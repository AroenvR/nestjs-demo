import { UUID } from "crypto";
import { ResponseDto } from "../../http_api/dtos/ResponseDto";

/**
 * Interface for Server-Sent Event messages.
 * @property authenticated - Indicates whether the event requires authentication or not.
 * @property receiverUuid - The UUID of the receiver which is authenticated for this event.
 * @property data - The data to be sent to the client.
 */
export interface ISseMessage<DTO extends ResponseDto> {
	authenticated: boolean;
	receiverUuid: UUID;
	data: DTO;
}
