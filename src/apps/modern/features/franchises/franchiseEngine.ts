import type { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';

import type { ItemDto } from 'types/base/models/item-dto';

import {
    VELARIS_FRANCHISE_CATALOG,
    type FranchiseGroupDefinition,
    type FranchiseHubDefinition,
    type FranchiseMatcher
} from './catalog';

export interface ResolvedFranchiseGroup {
    id: string
    name: string
    items: ItemDto[]
}

export interface ResolvedFranchiseHub {
    id: string
    name: string
    eyebrow: string
    description: string
    groups: ResolvedFranchiseGroup[]
    items: ItemDto[]
    representativeItem?: ItemDto
}

const normalizeText = (value: string | null | undefined) => (
    (value || '')
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
);

const normalizeTag = (value: string | null | undefined) => (
    (value || '')
        .toLocaleLowerCase()
        .trim()
);

const matchesType = (item: ItemDto, types: BaseItemKind[] | undefined) => (
    !types?.length || (item.Type ? types.includes(item.Type as BaseItemKind) : false)
);

const matchesYear = (item: ItemDto, matcher: FranchiseMatcher) => {
    const year = item.ProductionYear;

    if (matcher.year != null && year !== matcher.year) return false;
    if (matcher.minYear != null && (!year || year < matcher.minYear)) return false;
    if (matcher.maxYear != null && (!year || year > matcher.maxYear)) return false;

    return true;
};

const getStudioNames = (item: ItemDto) => (
    (item.Studios || [])
        .map(studio => normalizeText(studio.Name))
        .filter(Boolean)
);

const getTags = (item: ItemDto) => (
    (item.Tags || [])
        .map(normalizeTag)
        .filter(Boolean)
);

const includesNormalizedValue = (values: string[], candidates: string[]) => (
    candidates.some(candidate => {
        const normalizedCandidate = normalizeText(candidate);
        return values.some(value => value.includes(normalizedCandidate));
    })
);

const matchesMatcher = (item: ItemDto, matcher: FranchiseMatcher) => {
    if (!matchesType(item, matcher.types) || !matchesYear(item, matcher)) {
        return false;
    }

    const title = normalizeText(item.Name);
    const hasTitleCriteria = Boolean(
        matcher.titles?.length
        || matcher.titleIncludes?.length
        || matcher.titlePatterns?.length
    );
    const hasStudioCriteria = Boolean(matcher.studios?.length);
    const hasTagCriteria = Boolean(matcher.tags?.length);

    if (matcher.titles?.length) {
        const titles = matcher.titles.map(normalizeText);
        if (!titles.includes(title)) return false;
    }

    if (matcher.titleIncludes?.length) {
        const includes = matcher.titleIncludes.map(normalizeText);
        if (!includes.some(value => title.includes(value))) return false;
    }

    if (matcher.titlePatterns?.length) {
        if (!matcher.titlePatterns.some(pattern => pattern.test(title))) return false;
    }

    if (matcher.studios?.length) {
        if (!includesNormalizedValue(getStudioNames(item), matcher.studios)) return false;
    }

    if (matcher.tags?.length) {
        const itemTags = getTags(item);
        if (!matcher.tags.some(tag => itemTags.includes(normalizeTag(tag)))) return false;
    }

    return hasTitleCriteria || hasStudioCriteria || hasTagCriteria;
};

const hasManualGroupTag = (item: ItemDto, groupId: string) => {
    const tags = getTags(item);
    return tags.includes(`velaris:group:${groupId}`)
        || tags.includes(`velaris:hub-group:${groupId}`);
};

const hasManualFranchiseTag = (item: ItemDto, franchiseId: string) => {
    const tags = getTags(item);
    return tags.includes(`velaris:franchise:${franchiseId}`)
        || tags.includes(`velaris:hub:${franchiseId}`);
};

const matchesGroup = (item: ItemDto, group: FranchiseGroupDefinition) => (
    hasManualGroupTag(item, group.id)
    || group.matchers.some(matcher => matchesMatcher(item, matcher))
);

const uniqueItems = (items: ItemDto[]) => {
    const seen = new Set<string>();

    return items.filter((item, index) => {
        const key = item.Id || `${item.Type || 'Item'}:${item.Name || 'Unknown'}:${index}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const pickRepresentativeItem = (items: ItemDto[]) => (
    items.find(item => item.BackdropImageTags?.length)
    || items.find(item => item.ImageTags?.Primary)
    || items[0]
);

const resolveHub = (
    definition: FranchiseHubDefinition,
    items: ItemDto[]
): ResolvedFranchiseHub | undefined => {
    const resolvedGroups = definition.groups
        .map(group => ({
            id: group.id,
            name: group.name,
            items: uniqueItems(items.filter(item => matchesGroup(item, group)))
        }))
        .filter(group => group.items.length > 0);

    const groupedIds = new Set(
        resolvedGroups.flatMap(group => group.items.map(item => item.Id).filter(Boolean))
    );

    const manuallyAssignedItems = uniqueItems(
        items.filter(item => hasManualFranchiseTag(item, definition.id))
    );
    const fallbackItems = manuallyAssignedItems.filter(item => !item.Id || !groupedIds.has(item.Id));

    if (fallbackItems.length > 0) {
        resolvedGroups.push({
            id: 'other',
            name: definition.fallbackGroupName || 'Weitere Titel',
            items: fallbackItems
        });
    }

    const hubItems = uniqueItems([
        ...resolvedGroups.flatMap(group => group.items),
        ...manuallyAssignedItems
    ]);

    if (hubItems.length === 0) return undefined;

    return {
        id: definition.id,
        name: definition.name,
        eyebrow: definition.eyebrow,
        description: definition.description,
        groups: resolvedGroups,
        items: hubItems,
        representativeItem: pickRepresentativeItem(hubItems)
    };
};

export const buildVelarisFranchiseHubs = (items: ItemDto[]) => (
    VELARIS_FRANCHISE_CATALOG
        .map(definition => resolveHub(definition, items))
        .filter((hub): hub is ResolvedFranchiseHub => Boolean(hub))
);
