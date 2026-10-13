export type ErrorCopy = {
	pose: 'hiker' | 'guard' | 'sleeping' | 'reader';
	eyebrow: string;
	title: string;
	message: string;
};

const fallbackRequestMessage = 'Something about the request was off.';

/** What the error page says, and which marmot it shows, for an HTTP status. */
export function copyForStatus(status: number, errorMessage: string | undefined): ErrorCopy {
	if (status === 404) {
		return {
			pose: 'hiker',
			eyebrow: 'off the trail',
			title: 'This page doesn’t exist',
			message: 'The link may be old, or the address has a typo.'
		};
	}
	if (status === 401 || status === 403) {
		return {
			pose: 'guard',
			eyebrow: 'not your burrow',
			title: 'You can’t open this page',
			message: 'Sign in with an account that has access to it.'
		};
	}
	if (status >= 500) {
		return {
			pose: 'sleeping',
			eyebrow: 'dozed off',
			title: 'Something went wrong on our side',
			message: 'Try again in a moment. If it keeps happening, let us know.'
		};
	}
	return {
		pose: 'reader',
		eyebrow: 'hmm',
		title: 'This request didn’t work',
		message: requestErrorMessage(errorMessage)
	};
}

function requestErrorMessage(errorMessage: string | undefined): string {
	if (errorMessage) return errorMessage;
	return fallbackRequestMessage;
}
