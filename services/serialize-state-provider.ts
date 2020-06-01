import { SerializedState } from '../serialized-state'

export interface SerializeStateProvider {
    getState(): Promise<SerializedState>;
    serialize(state: SerializedState): Promise<void>
}