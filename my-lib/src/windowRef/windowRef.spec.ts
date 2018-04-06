import { WindowRef } from './windowRef';

describe('WindowRef', () => {
    let sut: any;

    beforeEach(() => {
        sut = new WindowRef();
    });

    it('sut.nativeWindow should ref to global object', () => {
        expect(sut.nativeWindow).toEqual(global);
    });
});
