const mockObservableMethod = (methodName) => (mapValue) => ({
    [methodName]: jasmine.createSpy('store.' + methodName).and.callFake((x) => {
        const mapResult = x(mapValue);
        return ({
            subscribe: jasmine.createSpy('store.' + methodName + '.subscribe').and.callFake((y) => {
                y(mapResult);
                return ({unsubscribe: jasmine.createSpy('unsubscribe')});
            }),
            distinctUntilChanged: (f) => ({subscribe: (a) => a(mapResult)})
        });

    })
});

const mockModuleProp = (module: any, prop: string, newValue: any) => {
    const oldPropValue = module[prop];
    Object.defineProperty(module, prop, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: newValue
    });

    return () => {
        Object.defineProperty(module, prop, {
            enumerable: true,
            configurable: true,
            writable: true,
            value: oldPropValue
        });
    };
};

export {
    mockModuleProp,
    mockObservableMethod
};
