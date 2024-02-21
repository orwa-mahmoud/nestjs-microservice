import { UserRoles, UserStatuses } from '../../users/enums/user.enum';

/**
 * the data provided from the controller to the guard :
 * roles => array of user role
 * isRestricted => true => means this role is restricted only to related records , false => this role has global access
 */
export type ACLConfig = {
  roles: UserRoles[];
  isRestricted?: boolean;
};

/**
 * isValid : the token is valid ,
 * isAuthorized : the user is authorized ,
 * isRestricted : the users is authorized for his owned/related entity or global
 */
export type ValidateTokenAndAuthorizeResponse = {
  isValid: boolean;
  isAuthorized: boolean;
  isRestricted: boolean;
  userData: TokenData;
};

export type TokenData = {
  id: number;
  status: UserStatuses;
  iat: number;
  exp: number;
};
