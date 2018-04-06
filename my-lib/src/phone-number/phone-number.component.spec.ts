import { PhoneNumberComponent } from './phone-number.component';
import * as calculation from 'tonic-ng4-pro-spa-components/src/components/shared/helpers/string-mask.calculation';
import { mockModuleProp } from 'tonic-ng4-pro-spa-components/src/components/shared/helpers/mockHelpers.helper';

describe('phone-number.component', () => {
    let sut: any;
    let mockWinRef: any = {};

    beforeEach(() => {
        mockWinRef = {nativeWindow: {}};

        sut = new PhoneNumberComponent(mockWinRef);
    });

    describe('propagateChange', () => {
        it('should containe default handler which returns false', () => {
            expect(sut.propagateChange()).toBeFalsy();
        });
    });

    describe('onKeyUp', () => {
        let event: any;
        beforeEach(() => {
            event = {target: {}};
            sut.calculateCaretPositionByDigit = jasmine.createSpy('calculateCaretPositionByDigit');
            sut.getSelection = jasmine.createSpy('getSelection');
        });

        it('should call this.getSelection if event.keyCode is 37 or 39', () => {
            event.keyCode = 37;
            event.target.value = 12;

            sut.onKeyUp(event);
            expect(sut.getSelection).toHaveBeenCalledWith(event);
            expect(sut.calculateCaretPositionByDigit).toHaveBeenCalledWith(event.target.value, event.target);

            event.keyCode = 39;
            sut.onKeyUp(event);
            expect(sut.getSelection).toHaveBeenCalledWith(event);
            expect(sut.calculateCaretPositionByDigit).toHaveBeenCalledWith(event.target.value, event.target);
        });

        it('should not call this.getSelection if event.keyCode is not 37 or 39', () => {
            event.keyCode = 35;
            event.target.value = 12;

            sut.onKeyUp(event);
            expect(sut.getSelection).not.toHaveBeenCalled();
        });

    });

    describe('getSelection', () => {
        let mockModule: Function;
        let getSelectedTextSpy: any;
        let formattedValue: string;
        let digitedValue: string;
        let event: any;

        beforeEach(() => {
            event = {
                target: {}
            };
            formattedValue = '123-12';
            digitedValue = formattedValue.replace(/\D/g, '');
            getSelectedTextSpy = jasmine.createSpy('getSelectedTextSpy').and.returnValue(formattedValue);
            mockModule = mockModuleProp(calculation, 'getSelectedText', getSelectedTextSpy);
        });
        afterEach(() => {
            mockModule();
        });

        it('should call getSelectedText', () => {

            sut.getSelection(event);
            expect(getSelectedTextSpy).toHaveBeenCalled();
        });

        it('should assign digits from getSelectedText output to this.selection', () => {
            sut.getSelection(event);
            expect(sut.selection).toEqual(digitedValue);
        });
    });

    describe('onKeyDown', () => {
        let event: any;

        beforeEach(() => {
            event = {
                preventDefault: jasmine.createSpy('event.preventDefault'),
                keyCode: 12,
                target: {value: 15}
            };
            sut.calculateCarretCorrectionOnDigitsRemoval = jasmine.createSpy('calculateCarretCorrectionOnDigitsRemoval');
            sut.checkForCopyCutPasteCombinations = jasmine.createSpy('checkForCopyCutPasteCombinations').and.returnValue([true]);
            sut.calculateCaretPositionByDigit = jasmine.createSpy('calculateCaretPositionByDigit');
        });

        it('should call this.calculateCarretCorrectionOnDigitsRemoval and others', () => {
            sut.onKeyDown(event);

            expect(sut.calculateCarretCorrectionOnDigitsRemoval).toHaveBeenCalled();
            expect(sut.checkForCopyCutPasteCombinations).toHaveBeenCalled();
            expect(sut.calculateCaretPositionByDigit).toHaveBeenCalled();
        });

        it('should call this.calculateCaretPositionByDigit ' +
            'if this.checkForCopyCutPasteCombinations returns array with some true value', () => {
            sut.checkForCopyCutPasteCombinations = jasmine.createSpy('checkForCopyCutPasteCombinations')
                .and.returnValue([true]);
            sut.onKeyDown(event);
            expect(sut.calculateCaretPositionByDigit).toHaveBeenCalled();
        });

        it('should not call this.calculateCaretPositionByDigit ' +
            'if this.checkForCopyCutPasteCombinations returns array without any true value ' +
            'and specific keys were not pressed', () => {
            sut.checkForCopyCutPasteCombinations = jasmine.createSpy('checkForCopyCutPasteCombinations')
                .and.returnValue([false]);
            sut.onKeyDown(event);

            expect(sut.calculateCaretPositionByDigit).not.toHaveBeenCalled();
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should call this.calculateCaretPositionByDigit ' +
            'if this.checkForCopyCutPasteCombinations returns array without any true value ' +
            'and specific keys were pressed', () => {
            event.keyCode = 8;
            sut.checkForCopyCutPasteCombinations = jasmine.createSpy('checkForCopyCutPasteCombinations')
                .and.returnValue([false]);
            sut.onKeyDown(event);

            expect(sut.calculateCaretPositionByDigit).toHaveBeenCalled();
        });
    });

    describe('changeInput', () => {
        let event: any;
        let mockFormatter: any;

        beforeEach(() => {
            event = {
                keyCode: 12,
                target: {value: '15-12'}
            };

            mockFormatter = {
                apply: jasmine.createSpy('formatter.apply')
            };

            sut.getCutLengthAndValidatedValueOnPaste = jasmine.createSpy('getCutLengthAndValidatedValueOnPaste')
                .and.returnValue(event.target.value);
            sut.getRespectiveFormatter = jasmine.createSpy('getRespectiveFormatter');
            sut.correctFormattedString = jasmine.createSpy('correctFormattedString');
            sut.restoreCaretPosition = jasmine.createSpy('restoreCaretPosition');
            sut.propagateChange = jasmine.createSpy('propagateChange');
        });

        it('should call this.getCutLengthAndValidatedValueOnPaste and others', () => {
            sut.changeInput(event);

            expect(sut.getCutLengthAndValidatedValueOnPaste).toHaveBeenCalled();
            expect(sut.restoreCaretPosition).toHaveBeenCalled();
        });

        it('should call formatter.apply if formatter is defined', () => {
            sut.getRespectiveFormatter = () => (mockFormatter);

            sut.changeInput(event);
            expect(mockFormatter.apply).toHaveBeenCalled();
        });

        it('should assign this.formatValue to this.prevValue', () => {
            let mockValue: string = '123-1234';
            sut.getRespectiveFormatter = () => (mockFormatter);
            mockFormatter = {
                apply: jasmine.createSpy('formatter.apply').and.returnValue(mockValue)
            };
            sut.changeInput(event);
            expect(sut.prevValue).toEqual(mockValue);
        });

        it('should call this.propagateChange with respective value with only digits', () => {
            sut.changeInput(event);
            expect(sut.propagateChange).toHaveBeenCalledWith(event.target.value.replace(/\D/g, ''));
        });
    });

    describe('writeValue', () => {
        beforeEach(() => {
            sut.changeInput = jasmine.createSpy('changeInput');
            sut.phoneInput = {
                nativeElement: {
                    blur: jasmine.createSpy('this.phoneInput.nativeElement.blur')
                }
            };
        });

        it('should call this.changeInput and this.phoneInput.nativeElement.blur', () => {
            let phoneString: string = '123-4433';
            sut.writeValue(phoneString);

            expect(sut.changeInput).toHaveBeenCalled();
            expect(sut.phoneInput.nativeElement.blur).toHaveBeenCalled();
        });
    });

    describe('registerOnChange', () => {
        it('should assign argument function to this.propagateChange', () => {
            const testFunc = () => true;
            sut.propagateChange = undefined;

            sut.registerOnChange(testFunc);

            expect(sut.propagateChange).toBe(testFunc);
        });
    });

    describe('registerOnTouched', () => {
        it('should do nothing, just for caverage', () => {
            sut.registerOnTouched();
        });
    });

    describe('restoreCaretPosition', () => {
        let mockModule: any;
        let setCaretPositionSpy: any;
        let element: any;
        let prevValueDigitsOnly: string;
        let formattedValueDigitsOnly: string;

        beforeEach(() => {
            prevValueDigitsOnly = '12314';
            formattedValueDigitsOnly = '123145';
            element = {value: '123-145'};
            setCaretPositionSpy = jasmine.createSpy('setCaretPositionSpy');
            sut.calculateMaskedCurrentPosition = jasmine.createSpy('calculateMaskedCurrentPosition');
            mockModule = mockModuleProp(calculation, 'setCaretPosition', setCaretPositionSpy);
        });

        it('should set 0 to this.carretCorrectionOnDigitsRemoval', () => {
            sut.carretCorrectionOnDigitsRemoval = 1;
            sut.restoreCaretPosition(element, formattedValueDigitsOnly, prevValueDigitsOnly);

            expect(sut.carretCorrectionOnDigitsRemoval).toEqual(0);
        });

        it('should set empty string to this.selection', () => {
            sut.selection = '11-1';
            sut.restoreCaretPosition(element, formattedValueDigitsOnly, prevValueDigitsOnly);

            expect(sut.selection).toEqual('');
        });

        it('should call setCaretPosition and this.calculateMaskedCurrentPosition ' +
            'if new value is longer then old value and no text selection', () => {
            prevValueDigitsOnly = '12314';
            formattedValueDigitsOnly = '123145';
            sut.selection = 0;

            sut.restoreCaretPosition(element, formattedValueDigitsOnly, prevValueDigitsOnly);
            expect(setCaretPositionSpy).toHaveBeenCalled();
            expect(sut.calculateMaskedCurrentPosition).toHaveBeenCalled();
        });

        it('should calculate correctly newCarretPosition' +
            'if new value is longer then old value and no text selection', () => {
            prevValueDigitsOnly = '12314';
            formattedValueDigitsOnly = '123145';
            let diff: number = prevValueDigitsOnly.length - formattedValueDigitsOnly.length;
            sut.selection = '';
            sut.caretPositionByDigitOnKeyDown = 13;
            let newCarretPosition = sut.caretPositionByDigitOnKeyDown - diff;
            sut.restoreCaretPosition(element, formattedValueDigitsOnly, prevValueDigitsOnly);

            expect(sut.calculateMaskedCurrentPosition).toHaveBeenCalledWith(element.value, newCarretPosition);
        });

        it('should calculate correctly newCarretPosition' +
            'if new value is longer then old value and there is text selection', () => {
            prevValueDigitsOnly = '12314';
            formattedValueDigitsOnly = '123145';
            sut.selection = '5';
            sut.caretPositionByDigitOnKeyDown = 13;
            let diff: number = prevValueDigitsOnly.length - formattedValueDigitsOnly.length;
            let newCarretPosition = sut.caretPositionByDigitOnKeyDown + sut.selection.length - diff;
            sut.restoreCaretPosition(element, formattedValueDigitsOnly, prevValueDigitsOnly);

            expect(sut.calculateMaskedCurrentPosition).toHaveBeenCalledWith(element.value, newCarretPosition);
        });

        it('should not call  this.calculateMaskedCurrentPosition if new value is longer then old value' +
            ' and new value length === this.caretPositionByDigitOnKeyDown', () => {
            prevValueDigitsOnly = '12314';
            formattedValueDigitsOnly = '123145';
            sut.caretPositionByDigitOnKeyDown = 5;

            sut.restoreCaretPosition(element, formattedValueDigitsOnly, prevValueDigitsOnly);

            expect(sut.calculateMaskedCurrentPosition).not.toHaveBeenCalled();
        });

        it('should call  this.calculateMaskedCurrentPosition with correct args if new value length is same as ' +
            'then old value length and old value is not empty', () => {
            prevValueDigitsOnly = '12314';
            formattedValueDigitsOnly = '12314';
            sut.selection = '';
            sut.caretPositionByDigitOnKeyDown = 3;
            sut.restoreCaretPosition(element, formattedValueDigitsOnly, prevValueDigitsOnly);

            expect(sut.calculateMaskedCurrentPosition).toHaveBeenCalledWith(
                element.value,
                sut.caretPositionByDigitOnKeyDown + sut.selection.length
            );
        });

        it('should not call  this.calculateMaskedCurrentPosition with correct args if new value length is same as ' +
            'then old value length and old value is empty', () => {
            prevValueDigitsOnly = '';
            formattedValueDigitsOnly = '12314';
            sut.selection = '';
            sut.caretPositionByDigitOnKeyDown = 3;

            sut.restoreCaretPosition(element, formattedValueDigitsOnly, prevValueDigitsOnly);

            expect(sut.calculateMaskedCurrentPosition).not.toHaveBeenCalledWith();
        });

        it('should call  this.calculateMaskedCurrentPosition with correct args if old value length is bigger ' +
            'then new value length and there is no text selection', () => {
            prevValueDigitsOnly = '123146';
            formattedValueDigitsOnly = '12314';
            sut.selection = '';
            sut.caretPositionByDigitOnKeyDown = 3;
            sut.carretCorrectionOnDigitsRemoval = 1;
            let diff: number = prevValueDigitsOnly.length - formattedValueDigitsOnly.length;
            let newCarretPosition = sut.caretPositionByDigitOnKeyDown - sut.carretCorrectionOnDigitsRemoval;

            sut.restoreCaretPosition(element, formattedValueDigitsOnly, prevValueDigitsOnly);

            expect(sut.calculateMaskedCurrentPosition).toHaveBeenCalledWith(element.value, newCarretPosition);
        });

        it('should call  this.calculateMaskedCurrentPosition with correct args if old value length is bigger ' +
            'then new value length and there is a text selection', () => {
            prevValueDigitsOnly = '123146';
            formattedValueDigitsOnly = '12314';
            sut.selection = '23';
            sut.caretPositionByDigitOnKeyDown = 5;
            sut.carretCorrectionOnDigitsRemoval = 1;
            let diff: number = prevValueDigitsOnly.length - formattedValueDigitsOnly.length;
            let newCarretPosition = sut.caretPositionByDigitOnKeyDown - sut.carretCorrectionOnDigitsRemoval
                + sut.selection.length - diff;

            sut.restoreCaretPosition(element, formattedValueDigitsOnly, prevValueDigitsOnly);

            expect(sut.calculateMaskedCurrentPosition).toHaveBeenCalledWith(element.value, newCarretPosition);
        });

    });

    describe('getCutLengthAndValidatedValueOnPaste', () => {

        let event: any;

        beforeEach(() => {
            event = {};
        });

        it('should return original value if its length is less then 10', () => {
            event.target = {value: '123-1278'};

            let result: string = sut.getCutLengthAndValidatedValueOnPaste(event);

            expect(result).toEqual(event.target.value);
        });

        it('should return first 14 letters of value  if its length>10 & first letter is not 1', () => {
            event.target = {value: '2(234) 127-844466'};

            let result: string = sut.getCutLengthAndValidatedValueOnPaste(event);

            expect(result).toEqual(event.target.value.slice(0, 14));
        });

        it('should return original value  if its length = 11 & first letter is 1', () => {
            event.target = {value: '1(234) 127-8444'};

            let result: string = sut.getCutLengthAndValidatedValueOnPaste(event);

            expect(result).toEqual(event.target.value);
        });

        it('should return first 14 letters of value  if its length>11 & first letter is 1', () => {
            event.target = {value: '1(234) 127-844466'};

            let result: string = sut.getCutLengthAndValidatedValueOnPaste(event);

            expect(result).toEqual(event.target.value.slice(0, 15));
        });
    });

    describe('calculateCarretCorrectionOnDigitsRemoval', () => {
        const DELETE_CODE = 46;
        const BACK_SPACE_CODE = 8;
        const SPACE_CODE = 32;
        const deleteBehaviourCodes = [DELETE_CODE, SPACE_CODE];
        const backSpaceRemovalBehaviorCodes = [BACK_SPACE_CODE];

        it('should assign 1 to this.carretCorrectionOnDigitsRemoval if backSpace is pressed with no selection', () => {
            sut.selection = '';
            sut.carretCorrectionOnDigitsRemoval = undefined;
            sut.calculateCarretCorrectionOnDigitsRemoval(
                BACK_SPACE_CODE,
                backSpaceRemovalBehaviorCodes,
                deleteBehaviourCodes
            );

            expect(sut.carretCorrectionOnDigitsRemoval).toEqual(1);
        });

        it('should assign 0 to this.carretCorrectionOnDigitsRemoval if delete is pressed', () => {
            sut.selection = '';
            sut.carretCorrectionOnDigitsRemoval = undefined;
            sut.calculateCarretCorrectionOnDigitsRemoval(
                DELETE_CODE,
                backSpaceRemovalBehaviorCodes,
                deleteBehaviourCodes
            );

            expect(sut.carretCorrectionOnDigitsRemoval).toEqual(0);
        });

        it('should assign 0 to this.carretCorrectionOnDigitsRemoval if space is pressed', () => {
            sut.selection = '';
            sut.carretCorrectionOnDigitsRemoval = undefined;
            sut.calculateCarretCorrectionOnDigitsRemoval(
                SPACE_CODE,
                backSpaceRemovalBehaviorCodes,
                deleteBehaviourCodes
            );

            expect(sut.carretCorrectionOnDigitsRemoval).toEqual(0);
        });

        it('should assign 1 to this.carretCorrectionOnDigitsRemoval if backSpace is pressed but with selection', () => {
            sut.selection = '123';
            sut.carretCorrectionOnDigitsRemoval = undefined;
            sut.calculateCarretCorrectionOnDigitsRemoval(
                BACK_SPACE_CODE,
                backSpaceRemovalBehaviorCodes,
                deleteBehaviourCodes
            );

            expect(sut.carretCorrectionOnDigitsRemoval).toEqual(undefined);
        });

        it('should not assign this.carretCorrectionOnDigitsRemoval if any other key is pressed', () => {
            sut.selection = '';
            sut.carretCorrectionOnDigitsRemoval = undefined;
            sut.calculateCarretCorrectionOnDigitsRemoval(
                55,
                backSpaceRemovalBehaviorCodes,
                deleteBehaviourCodes
            );

            expect(sut.carretCorrectionOnDigitsRemoval).toEqual(undefined);
        });
    });

    describe('calculateCaretPositionByDigits', () => {
        it('should correctly calculate digit position', () => {
            let maskedValue: string = '123-4567';
            let maskedCaretPosition: number = 5;
            let result: number = sut.calculateCaretPositionByDigits(maskedValue, maskedCaretPosition);
            expect(result).toEqual(4);
        });

        it('should return 0 if string is empty', () => {
            let maskedValue: string = '';
            let maskedCaretPosition: number = 5;
            let result: number = sut.calculateCaretPositionByDigits(maskedValue, maskedCaretPosition);
            expect(result).toEqual(0);
        });

        it('should return 0 if maskedCaretPosition is not valid', () => {
            let maskedValue: string = '123-5';
            let maskedCaretPosition: number = 8;
            let result: number = sut.calculateCaretPositionByDigits(maskedValue, maskedCaretPosition);
            expect(result).toEqual(0);
        });
    });

    describe('calculateMaskedCurrentPosition', () => {
        it('should correctly calculate digit position in masked string', () => {
            let maskedValue: string = '123-4567';
            let caretPositionByDigits: number = 5;
            let result: number = sut.calculateMaskedCurrentPosition(maskedValue, caretPositionByDigits);
            expect(result).toEqual(6);
        });

        it('should return 0 if caretPositionByDigits is out of scope', () => {
            let maskedValue: string = '123-4567';
            let caretPositionByDigits: number = 15;
            let result: number = sut.calculateMaskedCurrentPosition(maskedValue, caretPositionByDigits);
            expect(result).toEqual(0);
        });
    });

    describe('checkForCopyCutPasteCombinations', () => {
        it('should determine if command+V was pressed if metaKey is true and keyCode is 86', () => {
            let event: any = {
                metaKey: true,
                keyCode: 86
            };

            let result: any[] = sut.checkForCopyCutPasteCombinations(event);

            expect(result[0]).toBeTruthy();
        });

        it('should determine if command+V was not pressed if metaKey is true and keyCode is 86', () => {
            let event: any = {
                ctrlKey: true,
                metaKey: false,
                keyCode: 86
            };

            let result: any[] = sut.checkForCopyCutPasteCombinations(event);

            expect(result[0]).toBeFalsy();
        });
    });

    describe('calculateCaretPositionByDigit', () => {

        beforeEach(() => {
            sut.calculateCaretPositionByDigits = jasmine.createSpy('calculateCaretPositionByDigits').and.returnValue(6);
        });

        it('should call this.calculateCaretPositionByDigits', () => {
            let formattedValue: string = '(123) 456-4444';
            let element: any = {selectionStart: 5};
            sut.calculateCaretPositionByDigit(formattedValue, element);

            expect(sut.calculateCaretPositionByDigits).toHaveBeenCalled();
        });

        it('should assign this.caretPositionByDigitOnKeyDown with number value', () => {
            let formattedValue: string = '(123) 456-4444';
            let element: any = {selectionStart: 5};
            sut.calculateCaretPositionByDigit(formattedValue, element);

            expect(sut.caretPositionByDigitOnKeyDown).toEqual(6);
        });
    });

    describe('getRespectiveFormatter', () => {

        beforeEach(() => {
            sut.maskFactory = jasmine.createSpy('maskFactory');
        });

        it('should call this.maskFactory with "999" if string length is less then 4', () => {
            let value: string = '444';
            sut.getRespectiveFormatter(value);

            expect(sut.maskFactory).toHaveBeenCalledWith('999');
        });

        it('should call this.maskFactory with "999-9999" if value.length >= 4 && value.length <= 7', () => {
            let value: string = '44466';
            sut.getRespectiveFormatter(value);

            expect(sut.maskFactory).toHaveBeenCalledWith('999-9999');
        });

        it('should call this.maskFactory with "(999) 999-9999" if value.length > 7 && value.length < 11', () => {
            let value: string = '44466666';
            sut.getRespectiveFormatter(value);

            expect(sut.maskFactory).toHaveBeenCalledWith('(999) 999-9999');
        });

        it('should call this.maskFactory with "9(999) 999-9999" if value.length = 11', () => {
            let value: string = '44466666654';
            sut.getRespectiveFormatter(value);

            expect(sut.maskFactory).toHaveBeenCalledWith('9(999) 999-9999', {reverse: true});
        });

        it('should not call this.maskFactory if value.length > 11', () => {
            let value: string = '44466666654777';
            sut.getRespectiveFormatter(value);

            expect(sut.maskFactory).not.toHaveBeenCalled();
        });
    });
});
