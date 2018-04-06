import { Injectable } from '@angular/core';

interface WindowObject {
    requestAnimationFrame?: Function;
    setTimeout?: Function;
    clearTimeout?: Function;
    document?: Document;
    getSelection?: Function;
    location?: {
        href: string;
        search: string;
    };
    parent?: any;
    addEventListener?: Function;
    removeEventListener?: Function;
}

const _window = (): WindowObject | any => global;

@Injectable()
class WindowRef {
    get nativeWindow(): WindowObject {
        return _window();
    }
}

export {WindowObject, WindowRef };
