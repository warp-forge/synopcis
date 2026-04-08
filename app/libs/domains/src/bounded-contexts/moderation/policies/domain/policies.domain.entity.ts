import { DomainPolicy, Ownership, UUID } from '../../../../core';

export interface ModerationPolicyRegistry {
  readonly articleFreezePolicy: DomainPolicy<ArticleFreezeContext>;
  readonly blockSourcePolicy: DomainPolicy<BlockSourceContext>;
  readonly userRestrictionPolicy: DomainPolicy<UserRestrictionContext>;
}

export const MODERATION_POLICY_REGISTRY = Symbol('MODERATION_POLICY_REGISTRY');

export interface ArticleFreezeContext {
  readonly article: any;
  readonly actorId: UUID;
  readonly reason: string;
}

export interface BlockSourceContext {
  readonly block: any;
  readonly sourceUrl: string;
  readonly actorId: UUID;
}

export interface UserRestrictionContext {
  readonly userId: UUID;
  readonly ownership: Ownership;
  readonly restrictionReason: string;
  readonly durationHours: number;
}

//TODO Provide concrete implementations once infrastructure adapters are available.
