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

const getItemKey = (item: ItemDto, index = 0) => (
    item.Id || `${item.Type || 'Item'}:${item.Name || item.OriginalTitle || 'Unknown'}:${index}`
);

const getSearchableTitles = (item: ItemDto) => (
    [
        item.Name,
        item.OriginalTitle,
        item.SortName,
        item.SeriesName
    ]
        .map(normalizeText)
        .filter(Boolean)
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

const matchesProviderIds = (
    item: ItemDto,
    providerIds: Record<string, string[]> | undefined
) => {
    if (!providerIds || Object.keys(providerIds).length === 0) return true;

    const itemProviderIds = Object.entries(item.ProviderIds || {});

    return Object.entries(providerIds).some(([ provider, acceptedIds ]) => {
        const providerEntry = itemProviderIds.find(
            ([ itemProvider ]) => itemProvider.toLocaleLowerCase() === provider.toLocaleLowerCase()
        );
        const providerId = providerEntry?.[1];
        return Boolean(providerId && acceptedIds.includes(providerId));
    });
};

const matchesMatcher = (item: ItemDto, matcher: FranchiseMatcher) => {
    if (!matchesType(item, matcher.types) || !matchesYear(item, matcher)) {
        return false;
    }

    const titles = getSearchableTitles(item);
    const hasTitleCriteria = Boolean(
        matcher.titles?.length
        || matcher.titleIncludes?.length
    );
    const hasStudioCriteria = Boolean(matcher.studios?.length);
    const hasTagCriteria = Boolean(matcher.tags?.length);
    const hasProviderCriteria = Boolean(
        matcher.providerIds && Object.keys(matcher.providerIds).length
    );

    if (matcher.titles?.length) {
        const expectedTitles = matcher.titles.map(normalizeText);
        if (!expectedTitles.some(title => titles.includes(title))) return false;
    }

    if (matcher.titleIncludes?.length) {
        const fragments = matcher.titleIncludes.map(normalizeText);
        if (!fragments.some(fragment => titles.some(title => title.includes(fragment)))) {
            return false;
        }
    }

    if (matcher.studios?.length) {
        if (!includesNormalizedValue(getStudioNames(item), matcher.studios)) return false;
    }

    if (matcher.tags?.length) {
        const itemTags = getTags(item);
        if (!matcher.tags.some(tag => itemTags.includes(normalizeTag(tag)))) return false;
    }

    if (!matchesProviderIds(item, matcher.providerIds)) return false;

    return hasTitleCriteria || hasStudioCriteria || hasTagCriteria || hasProviderCriteria;
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
        const key = getItemKey(item, index);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const getCuratedSortIndex = (item: ItemDto, sortOrder: string[] | undefined) => {
    if (!sortOrder?.length) return -1;

    const titles = getSearchableTitles(item);
    return sortOrder.findIndex(candidate => titles.includes(normalizeText(candidate)));
};

const sortGroupItems = (items: ItemDto[], group: FranchiseGroupDefinition) => (
    [ ...items ].sort((a, b) => {
        const aIndex = getCuratedSortIndex(a, group.sortOrder);
        const bIndex = getCuratedSortIndex(b, group.sortOrder);

        if (aIndex >= 0 || bIndex >= 0) {
            if (aIndex < 0) return 1;
            if (bIndex < 0) return -1;
            if (aIndex !== bIndex) return aIndex - bIndex;
        }

        const aYear = a.ProductionYear || Number.MAX_SAFE_INTEGER;
        const bYear = b.ProductionYear || Number.MAX_SAFE_INTEGER;
        if (aYear !== bYear) return aYear - bYear;

        return (a.SortName || a.Name || '').localeCompare(b.SortName || b.Name || '');
    })
);

const findPreferredItem = (
    items: ItemDto[],
    heroTitles: string[] | undefined,
    imagePredicate: (item: ItemDto) => boolean
) => {
    if (!heroTitles?.length) return undefined;

    for (const heroTitle of heroTitles) {
        const normalizedHeroTitle = normalizeText(heroTitle);
        const item = items.find(candidate => (
            imagePredicate(candidate)
            && getSearchableTitles(candidate).includes(normalizedHeroTitle)
        ));

        if (item) return item;
    }

    return undefined;
};

const pickRepresentativeItem = (
    items: ItemDto[],
    heroTitles: string[] | undefined
) => (
    findPreferredItem(items, heroTitles, item => Boolean(item.BackdropImageTags?.length))
    || findPreferredItem(items, heroTitles, item => Boolean(item.ImageTags?.Primary))
    || items.find(item => item.BackdropImageTags?.length)
    || items.find(item => item.ImageTags?.Primary)
    || items[0]
);

const resolveHub = (
    definition: FranchiseHubDefinition,
    items: ItemDto[]
): ResolvedFranchiseHub | undefined => {
    const resolvedGroups: ResolvedFranchiseGroup[] = [];
    const previouslyMatched = new Set<string>();

    definition.groups.forEach(group => {
        let groupItems = uniqueItems(items.filter(item => matchesGroup(item, group)));

        if (group.excludePreviouslyMatched) {
            groupItems = groupItems.filter(
                (item, index) => !previouslyMatched.has(getItemKey(item, index))
            );
        }

        groupItems = sortGroupItems(groupItems, group);
        if (groupItems.length > 0) {
            resolvedGroups.push({
                id: group.id,
                name: group.name,
                items: groupItems
            });

            groupItems.forEach((item, index) => {
                previouslyMatched.add(getItemKey(item, index));
            });
        }
    });

    const groupedKeys = new Set(
        resolvedGroups.flatMap(group => group.items.map((item, index) => getItemKey(item, index)))
    );

    const manuallyAssignedItems = uniqueItems(
        items.filter(item => hasManualFranchiseTag(item, definition.id))
    );
    const fallbackItems = manuallyAssignedItems.filter(
        (item, index) => !groupedKeys.has(getItemKey(item, index))
    );

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
        representativeItem: pickRepresentativeItem(hubItems, definition.heroTitles)
    };
};

export const buildVelarisFranchiseHubs = (items: ItemDto[]) => (
    VELARIS_FRANCHISE_CATALOG
        .map(definition => resolveHub(definition, items))
        .filter((hub): hub is ResolvedFranchiseHub => Boolean(hub))
);
