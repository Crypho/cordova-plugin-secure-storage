exports.defineAutoTests = function() {

    describe('cordova-plugin-secure-storage', function () {

        var ss, successHandler, errorHandler, handlers;

        beforeEach(function () {
            handlers = {
                successHandler: function (res) {
                },
                errorHandler: function (err) {
                }};
        });

        it("should be defined", function() {
            expect(cordova.plugins.SecureStorage).toBeDefined();
        });

        it('should be able to initialize', function (done) {
            spyOn(handlers, 'successHandler').and.callFake(function () {
                expect(ss.service).toEqual('testing');
                expect(handlers.errorHandler).not.toHaveBeenCalled();
                done();
            });
            spyOn(handlers, 'errorHandler');

            ss = new cordova.plugins.SecureStorage(handlers.successHandler, handlers.errorHandler, 'testing');
        });

        it('should be able to set a key/value', function (done) {
            spyOn(handlers, 'successHandler').and.callFake(function (res) {
                expect(res).toEqual('foo');
                expect(handlers.errorHandler).not.toHaveBeenCalled();
                done();
            });
            spyOn(handlers, 'errorHandler');

            ss = new cordova.plugins.SecureStorage(function (res) {
                ss.set(handlers.successHandler, handlers.errorHandler, 'foo', 'bar');
            }, handlers.errorHandler, 'testing');
        });

        it('should be able to get a key/value', function (done) {
            spyOn(handlers, 'successHandler').and.callFake(function (res) {
                expect(res).toEqual('bar');
                expect(handlers.errorHandler).not.toHaveBeenCalled();
                done();
            });
            spyOn(handlers, 'errorHandler');

            ss = new cordova.plugins.SecureStorage(function (res) {
                ss.set(function () {
                    ss.get(handlers.successHandler, handlers.errorHandler, 'foo');
                }, handlers.errorHandler, 'foo', 'bar');
            }, handlers.errorHandler, 'testing');
        });

        it('should be able to get a key/value that was set before', function (done) {
            spyOn(handlers, 'successHandler').and.callFake(function (res) {
                expect(res).toEqual('bar');
                expect(handlers.errorHandler).not.toHaveBeenCalled();
                done();
            });
            spyOn(handlers, 'errorHandler');

            ss = new cordova.plugins.SecureStorage(function (res) {
                ss.get(handlers.successHandler, handlers.errorHandler, 'foo');
            }, handlers.errorHandler, 'testing');
        });

        it('should call the error handler when getting a key that does not exist', function (done) {
            spyOn(handlers, 'errorHandler').and.callFake(function (res) {
                expect(handlers.successHandler).not.toHaveBeenCalled();
                done();
            });
            spyOn(handlers, 'successHandler');

            ss = new cordova.plugins.SecureStorage(function (res) {
                ss.get(handlers.successHandler, handlers.errorHandler, 'nofoo');
            }, handlers.errorHandler, 'testing');
        });

        it('should be able to remove a key/value', function (done) {
            spyOn(handlers, 'successHandler').and.callFake(function (res) {
                expect(res).toEqual('foo');
                expect(handlers.errorHandler).not.toHaveBeenCalled();
                done();
            });
            spyOn(handlers, 'errorHandler');

            ss = new cordova.plugins.SecureStorage(function (res) {
                ss.remove(handlers.successHandler, handlers.errorHandler, 'foo');
            }, handlers.errorHandler, 'testing');
        });


    });
};
