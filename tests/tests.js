exports.defineAutoTests = function() {

    describe('com.crypho.plugins.securestorage', function () {

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

    });
};
