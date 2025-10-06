/**
 * User Entity (Aggregate Root)
 */

import { ValidationError } from '@noos/suru-types';
import { Email } from '../value-objects/email';
import { PasswordHash } from '../value-objects/password-hash';
import { UserId } from '../value-objects/user-id';

export interface UserProps {
  id: UserId;
  email: Email;
  passwordHash: PasswordHash;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(params: { email: string; passwordHash: string }): User {
    const userId = UserId.generate();
    const email = Email.create(params.email);
    const passwordHash = PasswordHash.fromHash(params.passwordHash);

    return new User({
      id: userId,
      email,
      passwordHash,
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });
  }

  static reconstitute(props: {
    id: string;
    email: string;
    passwordHash: string;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    version: number;
  }): User {
    return new User({
      id: UserId.create(props.id),
      email: Email.create(props.email),
      passwordHash: PasswordHash.fromHash(props.passwordHash),
      isActive: props.isActive,
      isEmailVerified: props.isEmailVerified,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      version: props.version,
    });
  }

  // Getters
  get id(): string {
    return this.props.id.toString();
  }

  get email(): string {
    return this.props.email.toString();
  }

  get passwordHash(): string {
    return this.props.passwordHash.toString();
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get isEmailVerified(): boolean {
    return this.props.isEmailVerified;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get version(): number {
    return this.props.version;
  }

  /**
   * Change user's password
   */
  changePassword(newPasswordHash: string): void {
    if (!this.props.isActive) {
      throw new ValidationError('Cannot change password for inactive user');
    }

    this.props.passwordHash = PasswordHash.fromHash(newPasswordHash);
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  /**
   * Verify user's email
   */
  verifyEmail(): void {
    if (this.props.isEmailVerified) {
      throw new ValidationError('Email is already verified');
    }

    this.props.isEmailVerified = true;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  /**
   * Deactivate user account
   */
  deactivate(): void {
    if (!this.props.isActive) {
      throw new ValidationError('User is already inactive');
    }

    this.props.isActive = false;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  /**
   * Reactivate user account
   */
  reactivate(): void {
    if (this.props.isActive) {
      throw new ValidationError('User is already active');
    }

    this.props.isActive = true;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  /**
   * Change user's email
   */
  changeEmail(newEmail: string): void {
    if (!this.props.isActive) {
      throw new ValidationError('Cannot change email for inactive user');
    }

    this.props.email = Email.create(newEmail);
    this.props.isEmailVerified = false; // Email needs to be verified again
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  /**
   * Check if user can login
   */
  canLogin(): boolean {
    return this.props.isActive;
  }
}
