export declare enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER"
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
export declare class User {
    private readonly _id?;
    private readonly _email;
    private _password;
    private _name?;
    private readonly _role;
    private readonly _createdAt?;
    private _updatedAt?;
    constructor(props: UserProps);
    get id(): string | undefined;
    get email(): string;
    get password(): string;
    get name(): string | undefined;
    get role(): UserRole;
    get createdAt(): Date | undefined;
    get updatedAt(): Date | undefined;
    isAdmin(): boolean;
    toSafeUser(): SafeUser;
}
export interface SafeUser {
    readonly id?: string;
    readonly email: string;
    readonly name?: string;
    readonly role: UserRole;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}
//# sourceMappingURL=user.entity.d.ts.map