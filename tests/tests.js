exports.defineAutoTests = function() {
    var ss, handlers;
    var SERVICE = 'testing';

    describe('cordova-plugin-secure-storage', function () {

        beforeEach(function () {
            handlers = {
                successHandler: function () {},
                errorHandler: function () {}
            };
        });

        it('should be defined', function() {
            expect(cordova.plugins.SecureStorage).toBeDefined();
        });

        it('should be able to initialize', function (done) {
            spyOn(handlers, 'successHandler').and.callFake(function () {
                expect(ss.service).toEqual(SERVICE);
                expect(handlers.errorHandler).not.toHaveBeenCalled();
                done();
            });
            spyOn(handlers, 'errorHandler');

            ss = new cordova.plugins.SecureStorage(handlers.successHandler, handlers.errorHandler, SERVICE);
        });

        it('should be able to set a key/value', function (done) {
            spyOn(handlers, 'successHandler').and.callFake(function (res) {
                expect(res).toEqual('foo');
                expect(handlers.errorHandler).not.toHaveBeenCalled();
                done();
            });
            spyOn(handlers, 'errorHandler');

            ss = new cordova.plugins.SecureStorage(function () {
                ss.set(handlers.successHandler, handlers.errorHandler, 'foo', 'bar');
            }, handlers.errorHandler, SERVICE);
        });

        it('should be able to get a key/value', function (done) {
            spyOn(handlers, 'successHandler').and.callFake(function (res) {
                expect(res).toEqual('bar');
                expect(handlers.errorHandler).not.toHaveBeenCalled();
                done();
            });
            spyOn(handlers, 'errorHandler');

            ss = new cordova.plugins.SecureStorage(function () {
                ss.set(function () {
                    ss.get(handlers.successHandler, handlers.errorHandler, 'foo');
                }, handlers.errorHandler, 'foo', 'bar');
            }, handlers.errorHandler, SERVICE);
        });

        it('should be able to get a key/value that was set before', function (done) {
            spyOn(handlers, 'successHandler').and.callFake(function (res) {
                expect(res).toEqual('bar');
                expect(handlers.errorHandler).not.toHaveBeenCalled();
                done();
            });
            spyOn(handlers, 'errorHandler');

            ss = new cordova.plugins.SecureStorage(function () {
                ss.get(handlers.successHandler, handlers.errorHandler, 'foo');
            }, handlers.errorHandler, SERVICE);
        });

        it('should call the error handler when getting a key that does not exist', function (done) {
            spyOn(handlers, 'errorHandler').and.callFake(function () {
                expect(handlers.successHandler).not.toHaveBeenCalled();
                done();
            });
            spyOn(handlers, 'successHandler');

            ss = new cordova.plugins.SecureStorage(function () {
                ss.get(handlers.successHandler, handlers.errorHandler, 'nofoo');
            }, handlers.errorHandler, SERVICE);
        });

        it('should be able to remove a key/value', function (done) {
            spyOn(handlers, 'successHandler').and.callFake(function (res) {
                expect(res).toEqual('foo');
                expect(handlers.errorHandler).not.toHaveBeenCalled();
                done();
            });
            spyOn(handlers, 'errorHandler');

            ss = new cordova.plugins.SecureStorage(function () {
                ss.remove(handlers.successHandler, handlers.errorHandler, 'foo');
            }, handlers.errorHandler, SERVICE);
        });
        it('should be able to set and retrieve multiple values in sequence', function (done) {
            var results = [];
            spyOn(handlers, 'successHandler').and.callFake(function (res) {
                results.push(res);
                expect(res === 'foo' || res === 'bar').toBe(true);
                if (results.indexOf('foo') !== -1 && results.indexOf('bar') !== -1) {
                    done();
                }
            });
            ss = new cordova.plugins.SecureStorage(function () {
                ss.set(function () {
                    ss.set(function () {
                        ss.get(handlers.successHandler, handlers.errorHandler, 'foo');
                        ss.get(handlers.successHandler, handlers.errorHandler, 'bar');
                    }, function () {}, 'bar', 'bar');
                }, function () {}, 'foo', 'foo');
            }, handlers.errorHandler, 'testing');
        });
    });

    if (cordova.platformId === 'android') {
        describe('cordova-plugin-secure-storage-android', function () {
            beforeEach(function () {
                handlers = {
                    successHandler: function () {},
                    errorHandler: function () {}
                };
            });

            it('should be able to set a key/value with sjcl', function (done) {
                localStorage.clear();
                spyOn(handlers, 'successHandler').and.callFake(function (res) {
                    expect(res).toEqual('foo');
                    expect(handlers.errorHandler).not.toHaveBeenCalled();
                    done();
                });
                spyOn(handlers, 'errorHandler');

                ss = new cordova.plugins.SecureStorage(function () {
                    ss.set(handlers.successHandler, handlers.errorHandler, 'foo', 'bar');
                },
                handlers.errorHandler,
                SERVICE,
                {native: false}
                );
            });

            it('should be able to get a key/value that was set before with sjcl', function (done) {
                spyOn(handlers, 'successHandler').and.callFake(function (res) {
                    expect(res).toEqual('bar');
                    expect(handlers.errorHandler).not.toHaveBeenCalled();
                    done();
                });
                spyOn(handlers, 'errorHandler');

                ss = new cordova.plugins.SecureStorage(function () {
                    ss.get(handlers.successHandler, handlers.errorHandler, 'foo');
                }, handlers.errorHandler, SERVICE);
            });

        });
    }
};
