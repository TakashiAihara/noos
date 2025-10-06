/**
 * TeamMember Entity
 */

import { ValidationError } from '@noos/suru-types';
import { TeamRole } from '../value-objects/index.js';

export interface TeamMemberProps {
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: Date;
}

export class TeamMember {
  private props: TeamMemberProps;

  private constructor(props: TeamMemberProps) {
    this.props = props;
  }

  static create(params: {
    userId: string;
    teamId: string;
    role: string;
  }): TeamMember {
    const role = TeamRole.create(params.role);

    return new TeamMember({
      userId: params.userId,
      teamId: params.teamId,
      role,
      joinedAt: new Date(),
    });
  }

  /**
   * Change member role
   */
  changeRole(newRole: string): void {
    const role = TeamRole.create(newRole);
    this.props.role = role;
  }

  /**
   * Check if member is owner
   */
  isOwner(): boolean {
    return this.props.role.equals(TeamRole.OWNER());
  }

  /**
   * Check if member can manage other members
   */
  canManageMembers(): boolean {
    return this.props.role.canManageMembers();
  }

  /**
   * Check if member can manage projects
   */
  canManageProjects(): boolean {
    return this.props.role.canManageProjects();
  }

  // Getters
  get userId(): string {
    return this.props.userId;
  }

  get teamId(): string {
    return this.props.teamId;
  }

  get role(): TeamRole {
    return this.props.role;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }

  toObject(): {
    userId: string;
    teamId: string;
    role: string;
    joinedAt: Date;
  } {
    return {
      userId: this.props.userId,
      teamId: this.props.teamId,
      role: this.props.role.toString(),
      joinedAt: this.props.joinedAt,
    };
  }
}
