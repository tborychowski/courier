import {on, off, fire} from './pubsub';
export const EVENT = {
	on,
	off,
	fire,

	tracking: {
		added: 'tracking-added',
		deleted: 'tracking-deleted'
	},
	document: {
		clicked: 'document-clicked'
	},


};
