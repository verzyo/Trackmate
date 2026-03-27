export const ATTACHMENT_TYPES = {
	NONE: "none",
	PHOTO: "photo",
	URL: "url",
	TEXT: "text",
} as const;

export type AttachmentType =
	(typeof ATTACHMENT_TYPES)[keyof typeof ATTACHMENT_TYPES];
