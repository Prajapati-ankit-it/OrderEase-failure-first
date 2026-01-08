/**
 * User Domain Entity
 * Pure domain object with no framework dependencies
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface UserProps {
  readonly id?: string;
  readonly email: string;
  readonly password: string;
  readonly name?: string;
  readonly role: UserRole;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class User {
  private readonly _id?: string;
  private readonly _email: string;
  private _password: string;
  private _name?: string;
  private readonly _role: UserRole;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(props: UserProps) {
    this._id = props.id;
    this._email = props.email;
    this._password = props.password;
    this._name = props.name;
    this._role = props.role;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string | undefined {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get name(): string | undefined {
    return this._name;
  }

  get role(): UserRole {
    return this._role;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  /**
   * Get safe user data (without password)
   */
  toSafeUser(): SafeUser {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      role: this._role,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

export interface SafeUser {
  readonly id?: string;
  readonly email: string;
  readonly name?: string;
  readonly role: UserRole;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
