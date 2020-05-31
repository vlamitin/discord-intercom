import { UsersService } from './users-service';
import { SegmentsProvider } from '../broadcast-service';

const PROVIDER_PREFIX = 'discord-role-';

export class DiscordSegmentsProvider implements SegmentsProvider {
    userService: UsersService

    constructor(userService: UsersService) {
        this.userService = userService;
    }

    getUserIds(segmentIds: string[]): string[] {
        if (!segmentIds) {
            return [];
        }

        const rolesMap = this.userService.getAllRoles().reduce((result, current) => {
            return {
                ...result,
                [current.id]: current
            };
        }, {});

        return segmentIds.flatMap(segmentId => {
            if (segmentId.startsWith(PROVIDER_PREFIX)) {
                let pureId = segmentId.replace(PROVIDER_PREFIX, '');
                let role = rolesMap[pureId];
                if (role) {
                    return role.members.map(v => v.id);
                }
            }
            return [];
        });
    }
}