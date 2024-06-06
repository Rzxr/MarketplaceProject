/**
 * Interface serialising objects to JSON.
 */
export interface ISerialisable {
    toJSON(): Record<string, unknown>;
}