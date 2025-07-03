/**
 * The minimum configuration required to set up a connection with an external API.
 * @property ssl - Whether HTTP or HTTPS should be used.
 * @property domain - Which domain to connect to.
 * @property port - Which port to use.
 * @property events - Whether event consuming should be initialized or not.
 */
export interface IExternalConfig {
	ssl: boolean;
	domain: string;
	port: number;
	events: boolean;
}
