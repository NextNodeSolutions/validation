/**
 * NextNode domain object validators
 *
 * Complete business objects validation for NextNode ecosystem
 */

import { type } from 'arktype'

import {
	NextNodeAPIKey,
	NextNodeEmail,
	NextNodeProjectSlug,
	NextNodeUsername,
	NextNodeUUID,
	NextNodeSemVer,
} from './common.js'

/**
 * NextNode User object validator
 */
export const NextNodeUser = type({
	id: NextNodeUUID,
	username: NextNodeUsername,
	email: NextNodeEmail,
	'role?': "'admin'|'user'|'viewer'",
	'status?': "'active'|'inactive'|'pending'",
	'createdAt?': 'Date',
	'updatedAt?': 'Date',
})

/**
 * NextNode Project object validator with enhanced business constraints
 */
export const NextNodeProject = type({
	id: NextNodeUUID,
	name: 'string>=3',
	slug: NextNodeProjectSlug,
	description: 'string',
	'ownerId?': NextNodeUUID,
	'status?': "'active'|'archived'|'draft'",
	'visibility?': "'public'|'private'|'internal'",
	'tags?': 'string[]',
	'createdAt?': 'Date',
	'updatedAt?': 'Date',
}).narrow(obj => {
	// Consolidate all business rule validation
	const { name, description, tags = [] } = obj

	return (
		name.length <= 100 &&
		description.length <= 500 &&
		tags.length <= 20 && // Reasonable tag limit
		tags.every(tag => tag.length >= 1 && tag.length <= 50) // Individual tag constraints
	)
})

/**
 * NextNode API Key object validator
 */
export const NextNodeAPIKeyObject = type({
	id: NextNodeUUID,
	key: NextNodeAPIKey,
	name: 'string',
	'projectId?': NextNodeUUID,
	'userId?': NextNodeUUID,
	'permissions?': 'string[]',
	'expiresAt?': 'Date|null',
	'lastUsedAt?': 'Date|null',
	'isActive?': 'boolean',
	'createdAt?': 'Date',
	'updatedAt?': 'Date',
}).narrow(obj => obj.name.length >= 3 && obj.name.length <= 50)

/**
 * NextNode Package/Library object validator
 */
export const NextNodePackage = type({
	id: NextNodeUUID,
	name: 'string',
	version: NextNodeSemVer,
	description: 'string',
	'author?': 'string',
	'repository?': 'string',
	'dependencies?': 'Record<string, string>',
	'devDependencies?': 'Record<string, string>',
	'tags?': 'string[]',
	'license?': 'string',
	'isPublic?': 'boolean',
	'downloads?': 'number',
	'createdAt?': 'Date',
	'updatedAt?': 'Date',
}).narrow(
	obj =>
		obj.name.length >= 3 &&
		obj.name.length <= 100 &&
		obj.description.length <= 1000 &&
		(obj.downloads || 0) >= 0,
)

/**
 * NextNode Environment Configuration validator
 */
export const NextNodeEnvironment = type({
	name: "'development'|'staging'|'production'",
	'variables?': 'Record<string, string>',
	'secrets?': 'string[]',
	'allowedOrigins?': 'string[]',
	'rateLimits?': {
		'requests?': 'number',
		'window?': 'number',
	},
	'features?': 'Record<string, boolean>',
	'createdAt?': 'Date',
	'updatedAt?': 'Date',
}).narrow(obj => {
	const limits = obj.rateLimits
	return (
		!limits ||
		((limits.requests || 1) >= 1 && (limits.window || 1000) >= 1000)
	)
})

/**
 * NextNode Organization object validator
 */
export const NextNodeOrganization = type({
	id: NextNodeUUID,
	name: 'string',
	slug: NextNodeProjectSlug,
	'description?': 'string',
	'website?': 'string',
	'members?': NextNodeUser.array(),
	'projects?': NextNodeProject.array(),
	'billing?': {
		'plan?': "'free'|'pro'|'enterprise'",
		'subscriptionId?': 'string',
		'status?': "'active'|'canceled'|'past_due'",
	},
	'settings?': 'Record<string, unknown>',
	'createdAt?': 'Date',
	'updatedAt?': 'Date',
}).narrow(
	obj =>
		obj.name.length >= 2 &&
		obj.name.length <= 100 &&
		(!obj.description || obj.description.length <= 500),
)

/**
 * NextNode Deployment object validator
 */
export const NextNodeDeployment = type({
	id: NextNodeUUID,
	projectId: NextNodeUUID,
	version: NextNodeSemVer,
	environment: "'development'|'staging'|'production'",
	'status?': "'pending'|'building'|'deploying'|'success'|'failed'",
	'url?': 'string',
	'buildLogs?': 'string[]',
	'metrics?': {
		'buildTime?': 'number>=0',
		'deployTime?': 'number>=0',
		'bundleSize?': 'number>=0',
	},
	'rollbackTo?': NextNodeUUID,
	'createdAt?': 'Date',
	'updatedAt?': 'Date',
})

/**
 * NextNode Webhook object validator
 */
export const NextNodeWebhook = type({
	id: NextNodeUUID,
	projectId: NextNodeUUID,
	url: 'string',
	events: 'string[]',
	'secret?': 'string',
	'isActive?': 'boolean',
	'retryCount?': 'number',
	'lastTriggered?': 'Date',
	'lastStatus?': 'number',
	'createdAt?': 'Date',
	'updatedAt?': 'Date',
}).narrow(obj => {
	const retryCount = obj.retryCount || 0
	const lastStatus = obj.lastStatus || 200
	return (
		retryCount >= 0 &&
		retryCount <= 5 &&
		lastStatus >= 100 &&
		lastStatus <= 599
	)
})

/**
 * NextNode Analytics Event validator
 */
export const NextNodeAnalyticsEvent = type({
	eventType: 'string',
	projectId: NextNodeUUID,
	'userId?': NextNodeUUID,
	'sessionId?': 'string',
	properties: 'Record<string, unknown>',
	timestamp: 'Date',
	'metadata?': {
		'userAgent?': 'string',
		'ip?': 'string',
		'country?': 'string',
		'device?': 'string',
	},
}).narrow(obj => obj.eventType.length >= 3 && obj.eventType.length <= 50)
