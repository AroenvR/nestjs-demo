import { ResponseDto } from 'src/application/dtos/ResponseDto';

/**
 * Interface for Server-Sent Event messages.
 * @property { data } T - The data to be sent to the client.
 */
export interface ISseMessage<T extends ResponseDto> {
	data: T;
}
