/**
 * Interface for Server-Sent Event messages.
 * @property { data } T - The data to be sent to the client.
 */
export interface ISseMessage<T> {
    data: T;
}