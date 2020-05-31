const EXTERNAL_ID_PREFIX = "fyi"

export function toIntercomExternalId(originalId: string): string {
    return EXTERNAL_ID_PREFIX + originalId;
}

export function fromIntercomExternalId(intercomExternalId: string): string {
    return intercomExternalId.replace(EXTERNAL_ID_PREFIX, '');
}