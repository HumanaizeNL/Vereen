// Framework version management utilities
// Handles version transitions and configuration for Toetsingskader, VV8, and Meerzorg

import type { FrameworkVersion } from '../data/types';
import { getFrameworkVersions, getFrameworkVersion } from '../db/repository';
import type { CheckRule } from '../normative/check-engine';
import type { ParsedTemplate } from '../templates/parser';

export interface VersionConfig {
  version: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  rules: CheckRule[];
  template?: ParsedTemplate;
  features: {
    sustainabilityRequired: boolean;
    observationPeriod: boolean;
    enhancedBPSDAssessment: boolean;
    digitalSubmission: boolean;
    [key: string]: boolean;
  };
  limits: {
    maxDayCareHours: number;
    maxNightCareHours: number;
    maxOneOnOneHours: number;
    minAssessmentRecency: number; // days
  };
}

/**
 * Get active framework version for a specific date
 */
export async function getActiveVersion(
  frameworkType: 'toetsingskader' | 'vv8' | 'meerzorg',
  date: Date = new Date()
): Promise<FrameworkVersion | null> {
  const versions = await getFrameworkVersions(frameworkType);

  // Find version that is active on the specified date
  const activeVersion = versions.find(v => {
    const effectiveFrom = new Date(v.effective_from);
    const effectiveTo = v.effective_to ? new Date(v.effective_to) : null;

    return date >= effectiveFrom && (!effectiveTo || date <= effectiveTo);
  });

  return activeVersion || null;
}

/**
 * Get version configuration with all settings
 */
export async function getVersionConfig(
  frameworkType: 'toetsingskader' | 'vv8' | 'meerzorg',
  version: string
): Promise<VersionConfig | null> {
  const frameworkVersion = await getFrameworkVersion(frameworkType, version);

  if (!frameworkVersion) {
    return null;
  }

  const rulesJson = JSON.parse(frameworkVersion.rules_json);

  return {
    version: frameworkVersion.version,
    effectiveFrom: new Date(frameworkVersion.effective_from),
    effectiveTo: frameworkVersion.effective_to ? new Date(frameworkVersion.effective_to) : undefined,
    rules: rulesJson.rules || [],
    template: rulesJson.template,
    features: getVersionFeatures(frameworkType, version),
    limits: getVersionLimits(frameworkType, version),
  };
}

/**
 * Get version-specific features
 */
function getVersionFeatures(
  frameworkType: string,
  version: string
): VersionConfig['features'] {
  if (frameworkType === 'meerzorg') {
    if (version === '2026') {
      return {
        sustainabilityRequired: true,
        observationPeriod: true,
        enhancedBPSDAssessment: true,
        digitalSubmission: true,
        trendMonitoring: true,
        riskFlagging: true,
      };
    } else if (version === '2025') {
      return {
        sustainabilityRequired: false,
        observationPeriod: false,
        enhancedBPSDAssessment: false,
        digitalSubmission: true,
        trendMonitoring: false,
        riskFlagging: false,
      };
    }
  }

  // Default features
  return {
    sustainabilityRequired: false,
    observationPeriod: false,
    enhancedBPSDAssessment: false,
    digitalSubmission: true,
  };
}

/**
 * Get version-specific limits
 */
function getVersionLimits(
  frameworkType: string,
  version: string
): VersionConfig['limits'] {
  if (frameworkType === 'meerzorg') {
    if (version === '2026') {
      return {
        maxDayCareHours: 16,
        maxNightCareHours: 12,
        maxOneOnOneHours: 8,
        minAssessmentRecency: 90, // 3 months
      };
    } else if (version === '2025') {
      return {
        maxDayCareHours: 18,
        maxNightCareHours: 14,
        maxOneOnOneHours: 10,
        minAssessmentRecency: 180, // 6 months
      };
    }
  }

  // Default limits
  return {
    maxDayCareHours: 16,
    maxNightCareHours: 12,
    maxOneOnOneHours: 8,
    minAssessmentRecency: 90,
  };
}

/**
 * Determine appropriate version for a new application
 */
export async function determineApplicationVersion(
  frameworkType: 'toetsingskader' | 'vv8' | 'meerzorg',
  submissionDate?: Date
): Promise<string> {
  const date = submissionDate || new Date();
  const activeVersion = await getActiveVersion(frameworkType, date);

  if (activeVersion) {
    return activeVersion.version;
  }

  // Fallback to latest version
  const versions = await getFrameworkVersions(frameworkType);
  if (versions.length > 0) {
    // Sort by effective_from descending
    versions.sort((a, b) =>
      new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
    );
    return versions[0].version;
  }

  // Ultimate fallback
  return '2026';
}

/**
 * Check if version transition is needed
 */
export interface VersionTransition {
  needed: boolean;
  fromVersion: string;
  toVersion: string;
  effectiveDate: Date;
  changes: VersionChange[];
  migrationRequired: boolean;
}

export interface VersionChange {
  type: 'field_added' | 'field_removed' | 'field_modified' | 'rule_added' | 'rule_modified' | 'limit_changed';
  field?: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export async function checkVersionTransition(
  frameworkType: 'toetsingskader' | 'vv8' | 'meerzorg',
  currentVersion: string,
  targetDate?: Date
): Promise<VersionTransition | null> {
  const date = targetDate || new Date();
  const activeVersion = await getActiveVersion(frameworkType, date);

  if (!activeVersion || activeVersion.version === currentVersion) {
    return null;
  }

  const changes = calculateVersionChanges(frameworkType, currentVersion, activeVersion.version);

  return {
    needed: true,
    fromVersion: currentVersion,
    toVersion: activeVersion.version,
    effectiveDate: new Date(activeVersion.effective_from),
    changes,
    migrationRequired: changes.some(c => c.impact === 'high'),
  };
}

/**
 * Calculate changes between versions
 */
function calculateVersionChanges(
  frameworkType: string,
  fromVersion: string,
  toVersion: string
): VersionChange[] {
  const changes: VersionChange[] = [];

  if (frameworkType === 'meerzorg') {
    if (fromVersion === '2025' && toVersion === '2026') {
      changes.push({
        type: 'field_added',
        field: 'sustainability_justification',
        description: 'Nieuw verplicht veld: onderbouwing duurzaamheid zorgbehoefte',
        impact: 'high',
      });
      changes.push({
        type: 'rule_added',
        description: 'Nieuwe validatieregel: specialistisch rapport bij ernstige problematiek',
        impact: 'medium',
      });
      changes.push({
        type: 'limit_changed',
        description: 'Dagzorg maximum verlaagd van 18 naar 16 uur',
        impact: 'medium',
      });
      changes.push({
        type: 'limit_changed',
        description: 'Nachtzorg maximum verlaagd van 14 naar 12 uur',
        impact: 'medium',
      });
      changes.push({
        type: 'field_added',
        field: 'observation_period',
        description: 'Observatieperiode optie toegevoegd voor grensgevallen',
        impact: 'low',
      });
      changes.push({
        type: 'rule_modified',
        description: 'Strengere eisen aan recentheid van metingen (6 maanden -> 3 maanden)',
        impact: 'medium',
      });
    }
  }

  return changes;
}

/**
 * Migrate application data between versions
 */
export interface MigrationResult {
  success: boolean;
  warnings: string[];
  errors: string[];
  migratedFields: Record<string, any>;
}

export async function migrateApplicationData(
  formData: Record<string, any>,
  fromVersion: string,
  toVersion: string,
  frameworkType: 'toetsingskader' | 'vv8' | 'meerzorg'
): Promise<MigrationResult> {
  const warnings: string[] = [];
  const errors: string[] = [];
  const migratedFields: Record<string, any> = { ...formData };

  if (frameworkType === 'meerzorg') {
    if (fromVersion === '2025' && toVersion === '2026') {
      // Check if day care hours exceed new limit
      const dayCareHours = parseFloat(formData.dagzorg_uren || '0');
      if (dayCareHours > 16) {
        warnings.push(
          `Dagzorg uren (${dayCareHours}) overschrijdt nieuwe maximum (16). Handmatige aanpassing vereist.`
        );
      }

      // Check if night care hours exceed new limit
      const nightCareHours = parseFloat(formData.nachtzorg_uren || '0');
      if (nightCareHours > 12) {
        warnings.push(
          `Nachtzorg uren (${nightCareHours}) overschrijdt nieuwe maximum (12). Handmatige aanpassing vereist.`
        );
      }

      // Add placeholder for new required field
      if (!formData.duurzaamheid_onderbouwing) {
        migratedFields.duurzaamheid_onderbouwing = '';
        warnings.push(
          'Nieuwe verplicht veld "duurzaamheid_onderbouwing" moet worden ingevuld.'
        );
      }

      // Check if assessments are recent enough (3 months instead of 6)
      if (formData.laatste_meting_datum) {
        const lastAssessment = new Date(formData.laatste_meting_datum);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        if (lastAssessment < threeMonthsAgo) {
          warnings.push(
            'Laatste beoordeling is ouder dan 3 maanden. Nieuwe beoordeling vereist voor 2026 framework.'
          );
        }
      }
    }
  }

  return {
    success: errors.length === 0,
    warnings,
    errors,
    migratedFields,
  };
}

/**
 * Get version comparison
 */
export interface VersionComparison {
  version1: string;
  version2: string;
  differences: {
    fields: {
      added: string[];
      removed: string[];
      modified: string[];
    };
    rules: {
      added: string[];
      removed: string[];
      modified: string[];
    };
    limits: Record<string, { old: any; new: any }>;
  };
}

export async function compareVersions(
  frameworkType: 'toetsingskader' | 'vv8' | 'meerzorg',
  version1: string,
  version2: string
): Promise<VersionComparison | null> {
  const config1 = await getVersionConfig(frameworkType, version1);
  const config2 = await getVersionConfig(frameworkType, version2);

  if (!config1 || !config2) {
    return null;
  }

  const comparison: VersionComparison = {
    version1,
    version2,
    differences: {
      fields: {
        added: [],
        removed: [],
        modified: [],
      },
      rules: {
        added: [],
        removed: [],
        modified: [],
      },
      limits: {},
    },
  };

  // Compare rules
  const rules1Ids = new Set(config1.rules.map(r => r.id));
  const rules2Ids = new Set(config2.rules.map(r => r.id));

  for (const rule of config2.rules) {
    if (!rules1Ids.has(rule.id)) {
      comparison.differences.rules.added.push(rule.id);
    }
  }

  for (const rule of config1.rules) {
    if (!rules2Ids.has(rule.id)) {
      comparison.differences.rules.removed.push(rule.id);
    }
  }

  // Compare limits
  for (const [key, value] of Object.entries(config2.limits)) {
    if (config1.limits[key] !== value) {
      comparison.differences.limits[key] = {
        old: config1.limits[key],
        new: value,
      };
    }
  }

  return comparison;
}

/**
 * Validate application against version requirements
 */
export interface VersionValidation {
  valid: boolean;
  version: string;
  issues: Array<{
    type: 'missing_field' | 'invalid_value' | 'outdated_assessment' | 'limit_exceeded';
    field?: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

export async function validateAgainstVersion(
  formData: Record<string, any>,
  frameworkType: 'toetsingskader' | 'vv8' | 'meerzorg',
  version: string
): Promise<VersionValidation> {
  const config = await getVersionConfig(frameworkType, version);

  if (!config) {
    return {
      valid: false,
      version,
      issues: [{
        type: 'missing_field',
        message: `Framework version ${version} not found`,
        severity: 'error',
      }],
    };
  }

  const issues: VersionValidation['issues'] = [];

  // Check limits
  const dayCareHours = parseFloat(formData.dagzorg_uren || '0');
  if (dayCareHours > config.limits.maxDayCareHours) {
    issues.push({
      type: 'limit_exceeded',
      field: 'dagzorg_uren',
      message: `Dagzorg uren (${dayCareHours}) overschrijdt maximum (${config.limits.maxDayCareHours})`,
      severity: 'error',
    });
  }

  const nightCareHours = parseFloat(formData.nachtzorg_uren || '0');
  if (nightCareHours > config.limits.maxNightCareHours) {
    issues.push({
      type: 'limit_exceeded',
      field: 'nachtzorg_uren',
      message: `Nachtzorg uren (${nightCareHours}) overschrijdt maximum (${config.limits.maxNightCareHours})`,
      severity: 'error',
    });
  }

  // Check version-specific requirements
  if (config.features.sustainabilityRequired && !formData.duurzaamheid_onderbouwing) {
    issues.push({
      type: 'missing_field',
      field: 'duurzaamheid_onderbouwing',
      message: 'Duurzaamheid onderbouwing is verplicht voor versie 2026',
      severity: 'error',
    });
  }

  // Check assessment recency
  if (formData.laatste_meting_datum) {
    const lastAssessment = new Date(formData.laatste_meting_datum);
    const now = new Date();
    const daysOld = (now.getTime() - lastAssessment.getTime()) / (1000 * 60 * 60 * 24);

    if (daysOld > config.limits.minAssessmentRecency) {
      issues.push({
        type: 'outdated_assessment',
        field: 'laatste_meting_datum',
        message: `Laatste beoordeling is ${Math.floor(daysOld)} dagen oud (maximum ${config.limits.minAssessmentRecency} dagen)`,
        severity: 'warning',
      });
    }
  }

  return {
    valid: !issues.some(i => i.severity === 'error'),
    version,
    issues,
  };
}

/**
 * Get version timeline
 */
export interface VersionTimeline {
  frameworkType: string;
  versions: Array<{
    version: string;
    effectiveFrom: Date;
    effectiveTo?: Date;
    isCurrent: boolean;
    isUpcoming: boolean;
  }>;
}

export async function getVersionTimeline(
  frameworkType: 'toetsingskader' | 'vv8' | 'meerzorg'
): Promise<VersionTimeline> {
  const versions = await getFrameworkVersions(frameworkType);
  const now = new Date();

  const timeline = versions
    .map(v => {
      const effectiveFrom = new Date(v.effective_from);
      const effectiveTo = v.effective_to ? new Date(v.effective_to) : undefined;

      return {
        version: v.version,
        effectiveFrom,
        effectiveTo,
        isCurrent: now >= effectiveFrom && (!effectiveTo || now <= effectiveTo),
        isUpcoming: effectiveFrom > now,
      };
    })
    .sort((a, b) => a.effectiveFrom.getTime() - b.effectiveFrom.getTime());

  return {
    frameworkType,
    versions: timeline,
  };
}
