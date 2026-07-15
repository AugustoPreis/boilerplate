// Auth roles are 100% data driven. There is no fixed enum of business roles in the code.
// The only special value is ROLE_ADMIN (total bypass), imported from @boilerplate/shared
// so that backend and frontend never diverge on this reserved name.
export type RoleType = string;
