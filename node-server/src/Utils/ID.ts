import { v4 as uuidv4, validate as uuidValidate } from "uuid";

/**
 * A class that represents an id.
 */
export class id {
    private uuid: string;

    /**
     * Constructs an id.
     * @param stringId The id.
     */
    public constructor(stringId?: string) {
        if (typeof stringId === "undefined") {
            this.uuid = uuidv4() as string;
            return;
        }

        if (!uuidValidate(stringId as string)) {
            throw new Error("Invalid id");
        }

        this.uuid = stringId as string;
    }

    /**
     * Converts the id to a string.
     * @returns The id as a string.
     */
    public toString(): string {
        return this.uuid;
    }

    /**
     * Checks if two IDs are equal.
     * @param id1 The first ID.
     * @param id2 The second ID.
     * @returns True if the IDs are equal, false otherwise.
     */
    public static isEqual(id1: id, id2: id): boolean {
        return id1.toString() === id2.toString();
    }
}