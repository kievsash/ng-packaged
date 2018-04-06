import {
    Component, ElementRef, EventEmitter, forwardRef, HostListener, OnInit, Output,
    ViewChild
} from '@angular/core';

import {
    getSelectedText,
    StringMaskFactory,
    setCaretPosition
} from './string-mask.calculation';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { WindowRef } from '../windowRef/windowRef';

const LEFT_ARROW_CODE = 37;
const RIGHT_ARROW_CODE = 39;
const DELETE_CODE = 46;
const BACK_SPACE_CODE = 8;
const SPACE_CODE = 32;

const allowedCodes = [BACK_SPACE_CODE, DELETE_CODE, LEFT_ARROW_CODE, RIGHT_ARROW_CODE, SPACE_CODE];
const deleteBehaviourCodes = [DELETE_CODE, SPACE_CODE];
const backSpaceRemovalBehaviorCodes = [BACK_SPACE_CODE];
const leftRightArrowsKeyCodes = [LEFT_ARROW_CODE, RIGHT_ARROW_CODE];

@Component({
    selector: 'phone-number-input',
    templateUrl: './phone-number.component.html',
    styleUrls: ['./phone-number.styles.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PhoneNumberComponent),
            multi: true
        },
        WindowRef
    ]
})
class PhoneNumberComponent implements ControlValueAccessor {

    @ViewChild('phoneInput')
    public phoneInput: ElementRef;

    @Output()
    public blur: EventEmitter<boolean> = new EventEmitter();

    @Output()
    public focus: EventEmitter<boolean> = new EventEmitter();

    public selection = '';
    public formatValue: any;
    public prevValue: any = '';
    public maskFactory: any = StringMaskFactory();
    public caretPositionByDigitOnKeyDown = 0;
    public carretCorrectionOnDigitsRemoval = 0;

    constructor(private winRef: WindowRef) {
    }

    public propagateChange: any = () => false;

    public onKeyUp($event) {
        const keyCode: number = $event.keyCode;

        if (leftRightArrowsKeyCodes.indexOf(keyCode) > -1) {
            const el: any = $event.target;
            const formattedValue = $event.target.value;
            this.calculateCaretPositionByDigit(formattedValue, el);
            this.getSelection($event);
        }
    }

    @HostListener('window:mouseup', ['$event'])
    public getSelection($event) {
        const el: any = $event.target;
        this.selection = getSelectedText(el, this.winRef.nativeWindow).replace(/\D/g, '');
    }

    public onKeyDown($event) {
        const el: any = $event.target;
        const formattedValue = $event.target.value;
        const keyCode: number = $event.keyCode;

        this.calculateCarretCorrectionOnDigitsRemoval(keyCode, backSpaceRemovalBehaviorCodes, deleteBehaviourCodes);

        let controlCombinations = this.checkForCopyCutPasteCombinations($event);
        if (controlCombinations.some((item) => item)) {
            this.calculateCaretPositionByDigit(formattedValue, el);
            return;
        }

        if (allowedCodes.indexOf($event.keyCode) === -1 &&
            String.fromCharCode($event.keyCode).match(/[ 0-9]/g) === null
        ) {
            $event.preventDefault();
            return;
        }

        this.calculateCaretPositionByDigit(formattedValue, el);
    }

    public changeInput($event) {
        const el: any = $event.target;

        let originalformattedValueDigitsOnly: string = $event.target.value.replace(/\D/g, '');

        $event.target.value = this.getCutLengthAndValidatedValueOnPaste($event);

        const formattedValueDigitsOnly = $event.target.value.replace(/\D/g, '');
        const prevValueDigitsOnly = this.prevValue.replace(/\D/g, '');

        // TODO Lib string-mask has issue but we didnt find other lib with direct and revert mask appliance
        // So we need to do correction applying different masks depending on string length
        const formatter: any = this.getRespectiveFormatter(formattedValueDigitsOnly);

        if (formatter) {
            this.formatValue = formatter.apply(formattedValueDigitsOnly);
            $event.target.value = this.formatValue;
        }
        this.restoreCaretPosition(el, originalformattedValueDigitsOnly, prevValueDigitsOnly);

        this.prevValue = this.formatValue;

        this.propagateChange(formattedValueDigitsOnly);
    }

    public writeValue(phoneString: string) {

        this.phoneInput.nativeElement.value = phoneString;

        let event: any = {target: this.phoneInput.nativeElement};

        this.changeInput(event);
        this.phoneInput.nativeElement.blur();
    }

    public registerOnChange(fn) {
        this.propagateChange = fn;
    }

    /* tslint:disable */
    public registerOnTouched() {
    }

    /* tslint:enable */

    private restoreCaretPosition(el, formattedValueDigitsOnly, prevValueDigitsOnly) {
        let diff = prevValueDigitsOnly.length - formattedValueDigitsOnly.length;

        if (formattedValueDigitsOnly.length < prevValueDigitsOnly.length) {

            let newCarretPosition = this.caretPositionByDigitOnKeyDown - this.carretCorrectionOnDigitsRemoval
                + this.selection.length - diff;

            if (this.selection.length === 0) {
                newCarretPosition = this.caretPositionByDigitOnKeyDown - this.carretCorrectionOnDigitsRemoval;
            }

            setCaretPosition(
                el,
                this.calculateMaskedCurrentPosition(
                    el.value,
                    newCarretPosition
                )
            );
        }

        if (formattedValueDigitsOnly.length === prevValueDigitsOnly.length && prevValueDigitsOnly !== '') {

            setCaretPosition(el, this.calculateMaskedCurrentPosition(
                el.value,
                    this.caretPositionByDigitOnKeyDown + this.selection.length
                )
            );
        }

        if (formattedValueDigitsOnly.length > prevValueDigitsOnly.length
            && prevValueDigitsOnly.length === this.caretPositionByDigitOnKeyDown) {
            return;
        }

        if (formattedValueDigitsOnly.length > prevValueDigitsOnly.length) {

            let newCarretPosition = this.caretPositionByDigitOnKeyDown
                + this.selection.length - diff;

            if (this.selection.length === 0) {
                newCarretPosition = this.caretPositionByDigitOnKeyDown - diff; // diff is negative here
            }

            setCaretPosition(
                el,
                this.calculateMaskedCurrentPosition(el.value, newCarretPosition)
            );
        }

        this.carretCorrectionOnDigitsRemoval = 0;
        this.selection = '';
    }

    private getCutLengthAndValidatedValueOnPaste(event) {
        let value = event.target.value;
        const valueDigitsOnly = value.replace(/\D/g, '');

        if (valueDigitsOnly.length > 10 && valueDigitsOnly.charAt(0) !== '1') {
            return value.slice(0, 14);
        }

        if (valueDigitsOnly.length > 11 && valueDigitsOnly.charAt(0) === '1') {
            return value.slice(0, 15);
        }

        return value;
    }

    private calculateCarretCorrectionOnDigitsRemoval(keyCode, backSpaceRemovalCodes, deleteCodes) {

        if (backSpaceRemovalCodes.indexOf(keyCode) > -1 && this.selection.length === 0) {
            this.carretCorrectionOnDigitsRemoval = 1;
        }

        if (deleteCodes.indexOf(keyCode) > -1) {
            this.carretCorrectionOnDigitsRemoval = 0;
        }
    }

    private calculateCaretPositionByDigits(maskedValue, maskedCaretPosition) {

        if (maskedCaretPosition > maskedValue.length) {
            return 0;
        }

        const substringTillCarret: string = maskedValue.slice(0, maskedCaretPosition);

        return substringTillCarret.replace(/\D/g, '').length;
    }

    private calculateMaskedCurrentPosition(maskedValue, caretPositionByDigits) {

        let digitIndex: number = 0;
        let result: number;
        let maskedValueDigits: string = maskedValue.replace(/\D/g, '');

        if (maskedValueDigits.length < caretPositionByDigits) {
            return 0;
        }

        maskedValue.split('').forEach((char, index) => {
            if (('' + char).replace(/\D/g, '').length) {
                digitIndex++;
            }
            if (digitIndex === caretPositionByDigits) {
                result = index;
            }
        });

        return result + 1;
    }

    private checkForCopyCutPasteCombinations($event) {
        let isCmdV = $event.metaKey && $event.keyCode === 86;
        let isCtrlV = $event.ctrlKey && $event.keyCode === 86;
        let isCmdC = $event.metaKey && $event.keyCode === 67;
        let isCtrlC = $event.metaKey && $event.keyCode === 67;
        let isCmdA = $event.metaKey && $event.keyCode === 65;
        let isCtrlA = $event.metaKey && $event.keyCode === 65;
        let isCmdZ = $event.metaKey && $event.keyCode === 90;
        let isCtrlZ = $event.metaKey && $event.keyCode === 90;
        let isCmdX = $event.metaKey && $event.keyCode === 88;
        let isCtrlX = $event.metaKey && $event.keyCode === 88;

        return [isCmdV, isCtrlV, isCmdC, isCtrlC, isCmdA, isCtrlA, isCmdZ, isCtrlZ, isCmdX, isCtrlX];
    }

    private calculateCaretPositionByDigit(formattedValue, el) {

        const caretPositionByMaskedValue = formattedValue.slice(0, el.selectionStart).length;

        this.caretPositionByDigitOnKeyDown = this.calculateCaretPositionByDigits(formattedValue, caretPositionByMaskedValue);
    }

    private getRespectiveFormatter(value) {

        let formatter: any;

        if (value.length >= 0 && value.length <= 3) {
            formatter = new this.maskFactory('999');
        }

        if (value.length >= 4 && value.length <= 7) {
            formatter = new this.maskFactory('999-9999');
        }
        if (value.length > 7 && value.length < 11) {
            formatter = new this.maskFactory('(999) 999-9999');
        }

        if (value.length === 11) {
            formatter = new this.maskFactory('9(999) 999-9999', {reverse: true});
        }

        return formatter;
    }
}

export {
    PhoneNumberComponent
};
