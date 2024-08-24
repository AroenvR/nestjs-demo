import { FooEntity } from "../../foo/entities/FooEntity"

describe("FooEntity", () => {
    let entity: FooEntity;

    beforeEach(() => {
        entity = new FooEntity();
    });

    // --------------------------------------------------

    it("should be defined", () => {
        expect(entity).toBeDefined();
    });
});