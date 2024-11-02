import { ResponseDto } from '../dtos/ResponseDto';

/**
 * Interface for Server-Sent Event messages.
 * @property { data } T - The data to be sent to the client.
 */
export interface ISseMessage<DTO extends ResponseDto> {
	data: DTO;
}
