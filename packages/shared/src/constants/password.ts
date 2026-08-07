// Min 8 chars, at least one lowercase, one uppercase, one digit, one
// special character. Shared so the API's validators and the web's Zod
// schemas never drift apart on what counts as a strong enough password.
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
